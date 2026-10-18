import sys
import io
import re
import shutil
import tarfile
from pathlib import Path

import pytest

from conftest import GUIDE_OK, make_guide

# No Windows, o CreateProcess procura System32 antes do PATH e acharia o bash.exe do WSL; o do PATH é o do Git Bash.
_BASH = shutil.which("bash") or "bash"


# ---------- parsing & lint ----------

def test_extract_block_single(vs_mod, tmp_path):
    p = make_guide(tmp_path)
    assert "guide: piloto" in vs_mod.extract_block(p.read_text(encoding="utf-8"))


@pytest.mark.parametrize("text", ["# sem bloco\n", "```yaml heuristics\na: 1\n```\n```yaml heuristics\nb: 2\n```\n"])
def test_extract_block_rejects_zero_or_many(vs_mod, text):
    with pytest.raises(ValueError):
        vs_mod.extract_block(text)


def test_load_guide_adds_path(vs_mod, tmp_path):
    p = make_guide(tmp_path)
    g = vs_mod.load_guide(p)
    assert g["guide"] == "piloto" and g["path"] == p and len(g["heuristics"]) == 3


def test_lint_ok(vs_mod, tmp_path):
    assert vs_mod.lint(vs_mod.load_guide(make_guide(tmp_path))) == []


@pytest.mark.parametrize("mutation, fragment", [
    (lambda b: b.replace('    verify: "test -d a"\n', ""), "campo 'verify'"),
    (lambda b: b.replace("id: PIL-02", "id: PIL-01"), "duplicado"),
    (lambda b: b.replace('do: "mkdir -p a"', 'do: "mkdir -p a && agent: faça x"'), "misto"),
    (lambda b: b.replace("depends_on: [PIL-01]", "depends_on: [PIL-99]"), "desconhecidas"),
    (lambda b: b.replace("id: PIL-03", "id: OUTRO-03"), "prefixos"),
    (lambda b: b.replace("version: 1", "version: '1'"), "'version'"),
    (lambda b: b.replace("id: PIL-01\n", "id: PIL-01\n    depends_on: [PIL-02]\n"), "ciclo"),
])
def test_lint_reports_errors(vs_mod, tmp_path, mutation, fragment):
    errs = vs_mod.lint(vs_mod.load_guide(make_guide(tmp_path, mutation(GUIDE_OK))))
    assert any(fragment in e for e in errs), errs


def test_topo_orders_dependencies(vs_mod):
    assert vs_mod.topo({"b": ["a"], "a": [], "c": ["b"]}) == ["a", "b", "c"]


def test_topo_detects_cycle(vs_mod):
    with pytest.raises(ValueError):
        vs_mod.topo({"a": ["b"], "b": ["a"]})


# ---------- runtime & índice ----------

def test_find_runtime_prefers_env_then_project_then_plugin(vs_mod, runtime, project, monkeypatch):
    monkeypatch.delenv("AI_GUIDES_HOME", raising=False)
    monkeypatch.delenv("CLAUDE_PLUGIN_ROOT", raising=False)
    with pytest.raises(RuntimeError):
        vs_mod.find_runtime(project)
    monkeypatch.setenv("CLAUDE_PLUGIN_ROOT", str(runtime))
    assert vs_mod.find_runtime(project, allow_plugin=True) == runtime.resolve()
    local = project / ".agents" / "ai-guides"
    make_guide(local)
    assert vs_mod.find_runtime(project) == local.resolve()
    monkeypatch.setenv("AI_GUIDES_HOME", str(runtime))
    assert vs_mod.find_runtime(project) == runtime.resolve()


def test_find_runtime_rejects_plugin_only_runtime(vs_mod, runtime, project, monkeypatch):
    """Runtime só no plugin não serve para trabalhar: o /setup tem de materializar .agents/ai-guides/."""
    monkeypatch.delenv("AI_GUIDES_HOME", raising=False)
    monkeypatch.setenv("CLAUDE_PLUGIN_ROOT", str(runtime))
    assert vs_mod.resolve_runtime(project) == (runtime.resolve(), "plugin")
    with pytest.raises(RuntimeError, match="fetch"):
        vs_mod.find_runtime(project)
    for argv in (["list"], ["plan", "piloto"], ["apply", "piloto"], ["verify", "piloto"]):
        assert vs_mod.main([*argv, "--project", str(project)]) == 2
    assert vs_mod.main(["where", "--project", str(project)]) == 3
    vs_mod.fetch(project, None, False)
    assert vs_mod.resolve_runtime(project)[1] == "projeto"
    assert vs_mod.main(["where", "--project", str(project)]) == 0


def test_index_guides_skips_md_without_block_and_rejects_dup_slug(vs_mod, runtime):
    (runtime / "guides" / "x" / "prosa.md").write_text("# só prosa\n", encoding="utf-8")
    assert list(vs_mod.index_guides(runtime)) == ["piloto"]
    make_guide(runtime, rel="guides/y/copia.md")
    with pytest.raises(ValueError):
        vs_mod.index_guides(runtime)


def test_ordered_heuristics_respects_depends_on(vs_mod, tmp_path):
    body = GUIDE_OK.replace("  - id: PIL-01", "  - id: PIL-00\n    title: t\n    when: 'true'\n    do: 'true'\n    verify: 'true'\n    depends_on: [PIL-02]\n  - id: PIL-01")
    g = vs_mod.load_guide(make_guide(tmp_path, body))
    ids = [h["id"] for h in vs_mod.ordered_heuristics(g)]
    assert ids.index("PIL-02") < ids.index("PIL-00")


def test_ordered_guides_uses_requires(vs_mod, runtime):
    make_guide(runtime, GUIDE_OK.replace("guide: piloto", "guide: base").replace("PIL-", "BAS-"), rel="guides/base.md")
    make_guide(runtime, GUIDE_OK.replace("guide: piloto", "guide: topo").replace("requires: []", "requires: [base]").replace("PIL-", "TOP-"), rel="guides/topo.md")
    idx = vs_mod.index_guides(runtime)
    assert vs_mod.ordered_guides(idx, ["topo", "base"]) == ["base", "topo"]


# ---------- execução ----------

def test_sh_runs_in_project_with_runtime_env(vs_mod, runtime, project):
    # cd "$PJ" && pwd: no Git Bash o pwd é /c/..., não C:\...
    cmd = "test \"$AI_GUIDES_RUNTIME\" = \"$RT\" && test \"$(pwd)\" = \"$(cd \"$PJ\" && pwd)\"".replace("$RT", str(runtime)).replace("$PJ", str(project.resolve()))
    assert vs_mod.sh(cmd, project, runtime)
    assert not vs_mod.sh("exit 3", project, runtime)


def test_plan_lists_only_applicable_in_order(vs_mod, runtime, project):
    g = vs_mod.index_guides(runtime)["piloto"]
    assert [h["id"] for h in vs_mod.plan(g, project, runtime)] == ["PIL-01", "PIL-02"]
    (project / "a").mkdir()
    assert [h["id"] for h in vs_mod.plan(g, project, runtime)] == ["PIL-02"]


def test_verify_statuses(vs_mod, runtime, project):
    g = vs_mod.index_guides(runtime)["piloto"]
    assert vs_mod.verify(g, project, runtime) == {"PIL-01": "fail", "PIL-02": "fail", "PIL-03": "skip"}
    (project / "a").mkdir()
    (project / "a" / "b").touch()
    (project / "package.json").write_text("{}", encoding="utf-8")
    assert vs_mod.verify(g, project, runtime) == {"PIL-01": "pass", "PIL-02": "pass", "PIL-03": "warn"}


@pytest.mark.parametrize("results, status", [
    ({"A-01": "pass", "A-02": "skip", "A-03": "warn"}, "pass"),
    ({"A-01": "fail", "A-02": "fail"}, "fail"),
    ({"A-01": "pass", "A-02": "fail"}, "partial"),
])
def test_guide_status(vs_mod, results, status):
    assert vs_mod.guide_status(results) == status


# ---------- manifesto ----------

def test_update_manifest_creates_and_preserves_project(vs_mod, runtime, project):
    g = vs_mod.index_guides(runtime)["piloto"]
    m = vs_mod.update_manifest(project, g, {"PIL-01": "pass", "PIL-02": "fail", "PIL-03": "skip"}, {"purpose": "api", "stack": "python,fastapi"}, [])
    assert (project / "docs/ai/setup-manifest.yaml").exists()
    assert m["project"] == {"purpose": "api", "stack": ["python", "fastapi"]}
    assert m["guides"]["piloto"]["status"] == "partial" and m["guides"]["piloto"]["version"] == 1
    m2 = vs_mod.update_manifest(project, None, {}, {"purpose": "web"}, ["outro"])
    assert m2["project"] == {"purpose": "web", "stack": ["python", "fastapi"]}  # --set da última rodada prevalece
    assert m2["guides"]["outro"] == {"status": "skipped"}
    assert m2["guides"]["piloto"]["heuristics"]["PIL-02"] == "fail"


def test_own_version_reads_skill_version_file(vs_mod):
    assert re.fullmatch(r"\d+\.\d+\.\d+", vs_mod.own_version())


# ---------- fetch ----------

def _tarball(files: dict[str, str]) -> bytes:
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        for name, content in files.items():
            data = content.encode()
            info = tarfile.TarInfo(f"org-repo-abc123/{name}")
            info.size = len(data)
            tar.addfile(info, io.BytesIO(data))
    return buf.getvalue()


def test_extract_runtime_keeps_guides_templates_and_mods(vs_mod, tmp_path):
    tb = _tarball({
        "guides/a.md": "# a",
        "templates/t.txt": "t",
        "templates/run.sh": "echo 1",
        "mods/x/bin/x.js": "console.log(1)",
        "mods/y/launcher.sh": "echo 2",
        "mods/../../evil.txt": "evil",
        "skills/x/SKILL.md": "no",
        "README.md": "no",
    })
    dest = tmp_path / "rt"
    vs_mod.extract_runtime(tb, dest)
    assert (dest / "guides/a.md").read_text(encoding="utf-8") == "# a" and (dest / "templates/t.txt").exists()
    assert (dest / "mods/x/bin/x.js").exists()
    assert not (dest / "skills").exists() and not (dest / "README.md").exists()
    assert (dest / "templates/run.sh").stat().st_mode & 0o111
    assert (dest / "mods/x/bin/x.js").stat().st_mode & 0o111
    assert (dest / "mods/y/launcher.sh").stat().st_mode & 0o111
    assert not (tmp_path / "evil.txt").exists()
    assert not (dest / "evil.txt").exists()


def test_local_source_falls_back_to_the_package_that_ships_this_skill(vs_mod, runtime, project, monkeypatch):
    """Sem AI_GUIDES_HOME/CLAUDE_PLUGIN_ROOT, o fetch ainda copia do pacote onde a skill vive (sem rede)."""
    monkeypatch.delenv("AI_GUIDES_HOME", raising=False)
    monkeypatch.delenv("CLAUDE_PLUGIN_ROOT", raising=False)
    monkeypatch.setattr(vs_mod, "SKILL_DIR", runtime / "skills" / "setup")
    monkeypatch.setattr(vs_mod, "download_tarball", lambda ref: (_ for _ in ()).throw(AssertionError("não deveria baixar")))
    assert vs_mod.local_source() == runtime
    assert (vs_mod.fetch(project, None, False) / "guides/x/piloto.md").exists()


def test_fetch_copies_from_local_source_without_network(vs_mod, runtime, project, monkeypatch):
    monkeypatch.delenv("AI_GUIDES_HOME", raising=False)
    monkeypatch.setenv("CLAUDE_PLUGIN_ROOT", str(runtime))
    monkeypatch.setattr(vs_mod, "download_tarball", lambda ref: (_ for _ in ()).throw(AssertionError("não deveria baixar")))
    (runtime / "mods" / "blast-radius").mkdir(parents=True)
    dest = vs_mod.fetch(project, None, False)
    assert dest == project / ".agents/ai-guides"
    assert (dest / "guides/x/piloto.md").exists() and (dest / "VERSION").read_text(encoding="utf-8").strip() == vs_mod.own_version()
    assert (dest / "mods/blast-radius").is_dir()


def test_fetch_downloads_and_falls_back_to_main_on_404(vs_mod, project, monkeypatch, tmp_path):
    monkeypatch.delenv("AI_GUIDES_HOME", raising=False)
    monkeypatch.delenv("CLAUDE_PLUGIN_ROOT", raising=False)
    monkeypatch.delenv("AI_GUIDES_REF", raising=False)
    monkeypatch.setattr(vs_mod, "SKILL_DIR", tmp_path / "sem-guides" / "skills" / "setup")  # sem fonte local
    calls = []

    def fake_download(ref):
        calls.append(ref)
        if ref != "main":
            raise vs_mod.urllib.error.HTTPError("u", 404, "nf", {}, None)
        return _tarball({"guides/g.md": "# g", "templates/t": "t"})

    monkeypatch.setattr(vs_mod, "download_tarball", fake_download)
    dest = vs_mod.fetch(project, None, False)
    assert calls == [f"v{vs_mod.own_version()}", "main"]
    assert (dest / "guides/g.md").exists() and "main" in (dest / "VERSION").read_text(encoding="utf-8")


def test_fetch_respects_ai_guides_ref_env_and_flag(vs_mod, project, monkeypatch, tmp_path):
    monkeypatch.delenv("AI_GUIDES_HOME", raising=False)
    monkeypatch.delenv("CLAUDE_PLUGIN_ROOT", raising=False)
    monkeypatch.setattr(vs_mod, "SKILL_DIR", tmp_path / "sem-guides" / "skills" / "setup")
    calls = []

    def fake_download(ref):
        calls.append(ref)
        return _tarball({"guides/dev.md": "# dev", "templates/t": "t"})

    monkeypatch.setattr(vs_mod, "download_tarball", fake_download)

    # 1. Por variável de ambiente AI_GUIDES_REF
    monkeypatch.setenv("AI_GUIDES_REF", "dev-matdgruber")
    dest = vs_mod.fetch(project, None, False)
    assert calls[-1] == "dev-matdgruber"
    assert (dest / "guides/dev.md").exists() and "dev-matdgruber" in (dest / "VERSION").read_text(encoding="utf-8")

    # 2. Por parâmetro explícito ref
    dest2 = vs_mod.fetch(project, "custom-branch", False)
    assert calls[-1] == "custom-branch"
    assert "custom-branch" in (dest2 / "VERSION").read_text(encoding="utf-8")


def test_fetch_respects_ai_guides_ref_env_and_flag_even_with_local(vs_mod, runtime, project, monkeypatch):
    """Quando ref ou AI_GUIDES_REF é passada, fetch ignora a fonte local e baixa a ref solicitada."""
    monkeypatch.setenv("CLAUDE_PLUGIN_ROOT", str(runtime))
    assert vs_mod.local_source() == runtime
    calls = []

    def fake_download(ref):
        calls.append(ref)
        return _tarball({"guides/remote.md": "# remote", "templates/t": "t"})

    monkeypatch.setattr(vs_mod, "download_tarball", fake_download)
    monkeypatch.setenv("AI_GUIDES_REF", "feature-branch")
    dest = vs_mod.fetch(project, None, False)
    assert calls[-1] == "feature-branch"
    assert (dest / "guides/remote.md").exists()
    assert "feature-branch" in (dest / "VERSION").read_text(encoding="utf-8")

    monkeypatch.delenv("AI_GUIDES_REF", raising=False)
    dest2 = vs_mod.fetch(project, "param-branch", False)
    assert calls[-1] == "param-branch"
    assert "param-branch" in (dest2 / "VERSION").read_text(encoding="utf-8")


# ---------- CLI ----------

def test_cli_lint_exit_codes(vs_mod, tmp_path, capsys):
    ok = make_guide(tmp_path, rel="ok.md")
    bad = make_guide(tmp_path, GUIDE_OK.replace("id: PIL-02", "id: PIL-01"), rel="bad.md")
    assert vs_mod.main(["--lint", str(ok)]) == 0
    assert vs_mod.main(["--lint", str(ok), str(bad)]) == 1
    assert "duplicado" in capsys.readouterr().out


def test_cli_plan_and_verify_flow(vs_mod, runtime, project, monkeypatch, capsys):
    monkeypatch.setenv("AI_GUIDES_HOME", str(runtime))
    assert vs_mod.main(["plan", "piloto", "--project", str(project)]) == 0
    out = capsys.readouterr().out
    assert f"AI_GUIDES_RUNTIME={runtime.resolve()}" in out and "[PIL-01]" in out and "DO:\nmkdir -p a" in out
    assert vs_mod.main(["verify", "piloto", "--project", str(project)]) == 1
    (project / "a" / "b").parent.mkdir()
    (project / "a" / "b").touch()
    assert vs_mod.main(["verify", "piloto", "--project", str(project), "--manifest", "--set", "purpose=api"]) == 0
    out = capsys.readouterr().out
    assert "✅ PIL-01" in out and "⏭️ PIL-03" in out
    assert vs_mod.read_manifest(project)["guides"]["piloto"]["status"] == "pass"
    assert vs_mod.main(["verify", "--all", "--project", str(project)]) == 0
    assert vs_mod.main(["list", "--project", str(project)]) == 0
    assert "piloto" in capsys.readouterr().out
    assert vs_mod.main(["where", "--project", str(project)]) == 0


def test_cli_verify_all_uses_manifest_and_skips(vs_mod, runtime, project, monkeypatch, capsys):
    monkeypatch.setenv("AI_GUIDES_HOME", str(runtime))
    vs_mod.update_manifest(project, None, {}, {}, ["piloto"])
    assert vs_mod.main(["verify", "--all", "--project", str(project)]) == 0
    assert "== piloto ==" not in capsys.readouterr().out


# ---------- helpers de shell dos guias (detect_stack / in_each / install_dep) ----------

def _sh(script, *args, cwd=None, env=None):
    import os
    import subprocess
    root = Path(__file__).resolve().parents[3]
    return subprocess.run(["sh", str(root / "templates" / script), *args], cwd=cwd, encoding="utf-8",
                          capture_output=True, env={**os.environ, **(env or {})})


@pytest.fixture
def monorepo(tmp_path):
    """apps/web (React) + services/api (FastAPI), com node_modules que não pode ser detectado."""
    (tmp_path / "apps/web/node_modules").mkdir(parents=True)
    (tmp_path / "services/api").mkdir(parents=True)
    (tmp_path / "apps/web/package.json").write_text('{"dependencies":{"react":"19"}}', encoding="utf-8")
    (tmp_path / "apps/web/node_modules/package.json").write_text('{"dependencies":{"react":"18"}}', encoding="utf-8")
    (tmp_path / "services/api/pyproject.toml").write_text('[project]\nname="api"\ndependencies=["fastapi"]\n', encoding="utf-8")
    return tmp_path


@pytest.mark.parametrize("alvo,esperado", [
    ("frontend", ["./apps/web"]), ("backend", ["./services/api"]), ("api", ["./services/api"]),
    ("node", ["./apps/web"]), ("python", ["./services/api"]), ("mobile", []),
])
def test_detect_stack_encontra_subprojetos_e_ignora_node_modules(monorepo, alvo, esperado):
    r = _sh("detect_stack.sh", alvo, "--list", cwd=monorepo)
    assert sorted(r.stdout.split()) == esperado
    assert r.returncode == (0 if esperado else 1)


def test_in_each_any_e_all(monorepo):
    root = Path(__file__).resolve().parents[3]
    env = {"AI_GUIDES_RUNTIME": str(root)}
    assert _sh("in_each.sh", "--any", "node", "test -f package.json", cwd=monorepo, env=env).returncode == 0
    assert _sh("in_each.sh", "--all", "node", "grep -q vitest package.json", cwd=monorepo, env=env).returncode == 1
    assert _sh("in_each.sh", "--any", "backend", "grep -q fastapi pyproject.toml", cwd=monorepo, env=env).returncode == 0
    assert _sh("in_each.sh", "--any", "mobile", "true", cwd=monorepo, env=env).returncode == 1


def test_install_dep_e_idempotente_para_comando_existente(tmp_path):
    r = _sh("install_dep.sh", "sh", cwd=tmp_path)
    assert r.returncode == 0 and "já instalado" in r.stdout


def test_verify_hooks_detecta_json_invalido_binario_ausente_e_aprova_hook_valido(tmp_path):
    import json
    import subprocess
    script = Path(__file__).resolve().parents[3] / "templates" / "harness" / "verify_hooks.py"
    settings = tmp_path / "settings.json"
    run = lambda: subprocess.run([sys.executable, str(script), str(settings)], cwd=tmp_path, capture_output=True, encoding="utf-8")
    settings.write_text("{ isso não é json", encoding="utf-8")
    assert run().returncode == 1
    settings.write_text(json.dumps({"hooks": {"PreToolUse": [{"hooks": [{"command": "binario-inexistente-xyz --x"}]}]}}), encoding="utf-8")
    assert run().returncode == 1
    settings.write_text(json.dumps({"hooks": {"PreToolUse": [{"hooks": [{"command": "echo ok | grep -E 'a|b'"}]}]}}), encoding="utf-8")
    assert run().returncode == 0


def test_verify_hooks_acusa_caminho_inexistente_e_schema_invalido(tmp_path):
    import json
    import subprocess
    script = Path(__file__).resolve().parents[3] / "templates" / "harness" / "verify_hooks.py"
    settings = tmp_path / "settings.json"

    def run(*cmds, extra=None):
        hooks = {"PreToolUse": [{"matcher": "Grep", "hooks": [{"type": "command", "command": c} for c in cmds]}]}
        hooks.update(extra or {})
        settings.write_text(json.dumps({"hooks": hooks}), encoding="utf-8")
        return subprocess.run([sys.executable, str(script), str(settings)], cwd=tmp_path, capture_output=True, encoding="utf-8")

    for ruim in ("/Users/ninguem-xyz/.local/bin/graphify hook-guard search",   # dev de outra máquina
                 "$HOME/.local/bin/nao-existe-xyz update .",
                 "bash ~/.nao-existe-xyz/notify.sh"):
        r = run(ruim)
        assert r.returncode == 1 and "ausente" in r.stdout, (ruim, r.stdout)
    assert run(f"{sys.executable} -c pass").returncode == 0, "binário absoluto existente passa"
    r = run("echo ok", extra={"Notification": [{"matcher": "task_complete", "run": "echo oi"}]})
    assert r.returncode == 1 and "Notification[0]" in r.stdout, r.stdout


def test_verify_hooks_js_sem_node_nao_lanca_excecao(tmp_path):
    import json
    import subprocess
    script = Path(__file__).resolve().parents[3] / "templates" / "harness" / "verify_hooks.py"
    settings = tmp_path / "settings.json"
    hook_js = tmp_path / "mods" / "demo.js"
    hook_js.parent.mkdir(parents=True)
    hook_js.write_text("console.log('hi');\n", encoding="utf-8")
    settings.write_text(json.dumps({"hooks": {"PreToolUse": [{"hooks": [{"type": "command", "command": "node mods/demo.js"}]}]}}), encoding="utf-8")
    r = subprocess.run([sys.executable, str(script), str(settings)], cwd=tmp_path, capture_output=True, encoding="utf-8",
                       env={"PATH": "/bin:/usr/bin", "HOME": str(tmp_path)})
    assert r.returncode == 1
    assert "Traceback" not in r.stderr
    assert "node: não encontrado no PATH" in r.stdout


def test_verify_hooks_js_com_node_em_local_bin(tmp_path):
    import json
    import subprocess
    script = Path(__file__).resolve().parents[3] / "templates" / "harness" / "verify_hooks.py"
    home = tmp_path / "home"
    fake_node = home / ".local" / "bin" / "node"
    fake_node.parent.mkdir(parents=True)
    fake_node.write_text("#!/bin/sh\nexit 0\n", encoding="utf-8")
    fake_node.chmod(0o755)
    settings = tmp_path / "settings.json"
    hook_js = tmp_path / "mods" / "demo.js"
    hook_js.parent.mkdir(parents=True)
    hook_js.write_text("console.log('hi');\n", encoding="utf-8")
    settings.write_text(json.dumps({"hooks": {"PreToolUse": [{"hooks": [{"type": "command", "command": "node mods/demo.js"}]}]}}), encoding="utf-8")
    r = subprocess.run([sys.executable, str(script), str(settings)], cwd=tmp_path, capture_output=True, encoding="utf-8",
                       env={"PATH": "/bin:/usr/bin", "HOME": str(home)})
    assert r.returncode == 0, r.stdout


def _merge_hooks(*args, cwd):
    import subprocess
    root = Path(__file__).resolve().parents[3]
    return subprocess.run([sys.executable, str(root / "templates" / "harness" / "merge_hooks.py"), *map(str, args)],
                          cwd=cwd, capture_output=True, encoding="utf-8")


def test_merge_hooks_preserva_existentes_substitui_legado_e_e_idempotente(tmp_path):
    import json
    root = Path(__file__).resolve().parents[3]
    gov = root / "templates" / "harness" / "governance-hooks.json"
    s = tmp_path / ".claude" / "settings.json"
    s.parent.mkdir()
    s.write_text(json.dumps({"permissions": {"allow": ["Bash(ls)"]}, "hooks": {"PreToolUse": [
        {"matcher": "Grep", "hooks": [{"type": "command", "command": "graphify hook-guard search"}]},
        {"matcher": "Read", "hooks": [{"type": "command", "command": "bash .claude/protect-secrets.sh"}]}]}}), encoding="utf-8")
    args = (gov, s, "--event", "PreToolUse", "--matcher", "Read|Write|Edit|Grep", "--replace", "protect-secrets")
    r = _merge_hooks(*args, cwd=tmp_path)
    assert r.returncode == 0, r.stderr
    data = json.loads(s.read_text(encoding="utf-8"))
    cmds = [h["command"] for e in data["hooks"]["PreToolUse"] for h in e["hooks"]]
    assert data["permissions"] == {"allow": ["Bash(ls)"]}
    assert "graphify hook-guard search" in cmds and "bash .claude/protect-secrets.sh" not in cmds
    assert sum("protect-secrets" in c for c in cmds) == 1 and not any("verify-semver" in c for c in cmds)
    antes = s.read_text(encoding="utf-8")
    assert _merge_hooks(*args, cwd=tmp_path).returncode == 0 and s.read_text(encoding="utf-8") == antes


def test_merge_hooks_cria_settings_recusa_json_invalido_e_filtro_vazio(tmp_path):
    import json
    root = Path(__file__).resolve().parents[3]
    gemini = root / "templates" / "settings.gemini.json"
    s = tmp_path / ".gemini" / "settings.json"
    assert _merge_hooks(gemini, s, cwd=tmp_path).returncode == 0
    assert set(json.loads(s.read_text(encoding="utf-8"))["hooks"]) == {"BeforeTool", "AfterTool"}
    assert _merge_hooks(gemini, s, "--matcher", "nao-existe", cwd=tmp_path).returncode == 1
    s.write_text('{ "hooks": {}, }', encoding="utf-8")
    r = _merge_hooks(gemini, s, cwd=tmp_path)
    assert r.returncode == 1 and "JSON inválido" in r.stderr and s.read_text(encoding="utf-8") == '{ "hooks": {}, }'


@pytest.mark.parametrize("guia,hid,settings", [
    ("essentials/guia-graph-engineering.md", "GRAPH-04", ".claude/settings.json"),
    ("essentials/guia-graph-engineering.md", "GRAPH-05", ".gemini/settings.json"),
    ("ai-engineering/guia-construcao-harness.md", "HN3-04", ".claude/settings.json"),
    ("ai-engineering/guia-construcao-harness.md", "HN3-05", ".claude/settings.json"),
])
def test_do_de_merge_de_hooks_e_shell_e_satisfaz_o_verify(vs_mod, tmp_path, guia, hid, settings):
    root = Path(__file__).resolve().parents[3]
    h = next(x for x in vs_mod.load_guide(root / "guides" / guia)["heuristics"] if x["id"] == hid)
    assert not h["do"].lstrip().startswith("agent:"), "merge de hooks é determinístico: shell, não agent"
    alvo = tmp_path / settings
    alvo.parent.mkdir(parents=True)
    alvo.write_text('{"hooks": {"PreToolUse": [{"matcher": "Read", "hooks": ['
                    '{"type": "command", "command": "bash .claude/protect-secrets.sh"}]}]}}', encoding="utf-8")
    assert vs_mod.sh(h["when"], tmp_path, root) and vs_mod.sh(h["do"], tmp_path, root)
    assert vs_mod.sh(h["verify"], tmp_path, root) and not vs_mod.sh(h["when"], tmp_path, root)


@pytest.fixture
def repo_unico(tmp_path):
    """Projeto clássico: manifests na raiz (o caso mais comum — não pode regredir por causa do monorepo)."""
    (tmp_path / "src").mkdir()
    (tmp_path / "pyproject.toml").write_text('[project]\nname="app"\nversion="0.1.0"\ndependencies=["fastapi"]\n', encoding="utf-8")
    (tmp_path / "package.json").write_text('{"name":"app","version":"0.1.0","dependencies":{"react":"19"}}', encoding="utf-8")
    (tmp_path / "Dockerfile").write_text("FROM python\n", encoding="utf-8")
    return tmp_path


@pytest.mark.parametrize("alvo", ["backend", "frontend", "api", "python", "node", "docker"])
def test_detect_stack_funciona_em_repo_unico(repo_unico, alvo):
    r = _sh("detect_stack.sh", alvo, "--list", cwd=repo_unico)
    assert r.returncode == 0 and r.stdout.split() == ["."]


def test_in_each_roda_na_raiz_em_repo_unico(repo_unico):
    root = Path(__file__).resolve().parents[3]
    env = {"AI_GUIDES_RUNTIME": str(root)}
    assert _sh("in_each.sh", "--any", "node", "test -f package.json", cwd=repo_unico, env=env).returncode == 0
    assert _sh("in_each.sh", "--all", "python", "grep -q fastapi pyproject.toml", cwd=repo_unico, env=env).returncode == 0
    assert _sh("in_each.sh", "--all", "node", "grep -q vitest package.json", cwd=repo_unico, env=env).returncode == 1


def test_merge_agent_md_preserva_conteudo_customizado_e_check_detecta_reescrita(tmp_path):
    import subprocess
    script = Path(__file__).resolve().parents[3] / "templates" / "harness" / "merge_agent_md.py"
    tpl = tmp_path / "CLAUDE.md.template"
    tpl.write_text("# T\n\n## 🎯 A\nconteúdo A\n\n## 📂 B\nconteúdo B\n", encoding="utf-8")
    alvo = tmp_path / "CLAUDE.md"
    run = lambda *a: subprocess.run([sys.executable, str(script), *a, str(tpl), str(alvo)], cwd=tmp_path,
                                    capture_output=True, encoding="utf-8")
    assert run("--check").returncode == 1  # ausente
    assert run().stdout.strip() == "criado" and alvo.read_text(encoding="utf-8") == tpl.read_text(encoding="utf-8")

    custom = "# Meu Projeto\n\n## 🎯 A\nregra própria do projeto\n\n## Deploy\nnunca rode make prod\n"
    alvo.write_text(custom, encoding="utf-8")
    for cmd in (["init", "-q"], ["add", "CLAUDE.md"], ["-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "x"]):
        subprocess.run(["git", *cmd], cwd=tmp_path, check=True)
    assert run("--check").returncode == 1  # falta ## 📂 B
    assert run().stdout.strip() == "mesclado: ## 📂 B"
    assert alvo.read_text(encoding="utf-8").startswith(custom) and "conteúdo B" in alvo.read_text(encoding="utf-8")
    assert "conteúdo A" not in alvo.read_text(encoding="utf-8")  # seção existente não é duplicada
    assert run("--check").returncode == 0
    assert run().stdout.strip() == "completo"

    alvo.write_text(tpl.read_text(encoding="utf-8"), encoding="utf-8")  # agente "padronizou" sobrescrevendo tudo
    r = run("--check")
    assert r.returncode == 1 and "nunca rode make prod" in r.stderr


def test_governance_hooks_resilientes_a_cwd_e_regex_sem_md():
    import json
    root = Path(__file__).resolve().parents[3]
    gov_path = root / "templates" / "harness" / "governance-hooks.json"
    gov = json.loads(gov_path.read_text(encoding="utf-8"))

    # Valida que hooks de Bash em governance-hooks usam resolução agnóstica de raiz
    bash_hooks = [h for group in gov.get("hooks", {}).get("PreToolUse", []) if group.get("matcher") == "Bash" for h in group.get("hooks", [])]
    assert bash_hooks, "deve existir hook para Bash em PreToolUse"
    for h in bash_hooks:
        cmd = h.get("command", "")
        assert "CLAUDE_PROJECT_DIR" in cmd or "git rev-parse --show-toplevel" in cmd, f"hook de bash deve resolver raiz: {cmd}"
        assert not cmd.startswith("bash .claude/"), f"hook não pode usar path relativo cego: {cmd}"

    # Valida que settings.claude.json não dispara graphify para *.md
    claude_settings = json.loads((root / "templates" / "settings.claude.json").read_text(encoding="utf-8"))
    post_hooks = claude_settings.get("hooks", {}).get("PostToolUse", [])
    for group in post_hooks:
        for h in group.get("hooks", []):
            cmd = h.get("command", "")
            if "graphify" in cmd:
                assert "\\.md" not in cmd, f"hook do graphify não deve disparar em .md: {cmd}"


def test_governance_hooks_rodam_de_subdiretorio_e_cada_script_recebe_o_stdin(tmp_path):
    import json
    import os
    import subprocess
    root = Path(__file__).resolve().parents[3]
    gov = json.loads((root / "templates" / "harness" / "governance-hooks.json").read_text(encoding="utf-8"))
    subprocess.run(["git", "init", "-q"], cwd=tmp_path, check=True)
    (tmp_path / ".claude").mkdir()
    (tmp_path / "src" / "app" / "core").mkdir(parents=True)
    for s in ("verify-semver.sh", "verify-docs.sh", "protect-secrets.sh"):
        (tmp_path / ".claude" / s).write_text(f'cat > "$(dirname "$0")/{s}.stdin"\n', encoding="utf-8")
    payload = '{"tool_input": {"command": "git push origin main"}}'
    env = {k: v for k, v in os.environ.items() if k != "CLAUDE_PROJECT_DIR"}
    for group in gov["hooks"]["PreToolUse"]:
        for h in group["hooks"]:
            r = subprocess.run(["sh", "-c", h["command"]], cwd=tmp_path / "src" / "app" / "core", input=payload,
                               encoding="utf-8", capture_output=True, env=env)
            assert r.returncode == 0, (h["command"], r.stderr)
    for s in ("verify-semver.sh", "verify-docs.sh", "protect-secrets.sh"):
        assert (tmp_path / ".claude" / f"{s}.stdin").read_text(encoding="utf-8") == payload, f"{s} não recebeu o tool_input"


def test_hn3_05_reaplica_quando_hook_usa_caminho_relativo_cego(vs_mod, tmp_path):
    root = Path(__file__).resolve().parents[3]
    guide = vs_mod.load_guide(root / "guides" / "ai-engineering" / "guia-construcao-harness.md")
    h = next(x for x in guide["heuristics"] if x["id"] == "HN3-05")
    (tmp_path / ".claude").mkdir()
    settings = tmp_path / ".claude" / "settings.json"
    settings.write_text((root / "templates" / "harness" / "governance-hooks.json").read_text(encoding="utf-8"), encoding="utf-8")
    assert not vs_mod.sh(h["when"], tmp_path, root) and vs_mod.sh(h["verify"], tmp_path, root)
    settings.write_text('{"hooks": {"PreToolUse": [{"matcher": "Bash", "hooks": ['
                        '{"type": "command", "command": "bash .claude/verify-semver.sh"},'
                        '{"type": "command", "command": "bash .claude/verify-docs.sh"}]}]}}', encoding="utf-8")
    assert vs_mod.sh(h["when"], tmp_path, root) and not vs_mod.sh(h["verify"], tmp_path, root)


def test_migrate_skills_preserva_skills_locais_no_padrao_canonico(vs_mod, tmp_path):
    import subprocess
    root = Path(__file__).resolve().parents[3]
    script = root / "templates" / "harness" / "migrate_skills.sh"

    # Cria repositório com skill plana pré-existente
    claude_skills = tmp_path / ".claude" / "skills"
    claude_skills.mkdir(parents=True)
    flat_skill = claude_skills / "modular-architecture.md"
    flat_skill.write_text("# Modular Architecture Skill\nRegras locais de modularidade\n", encoding="utf-8")

    # Skill já no formato pasta
    folder_skill = claude_skills / "minha-skill"
    folder_skill.mkdir()
    (folder_skill / "SKILL.md").write_text("# Minha Skill\n", encoding="utf-8")

    # Inicializa git e comita
    for cmd in (["init", "-q"], ["add", "-A"], ["-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "skills iniciais"]):
        subprocess.run(["git", *cmd], cwd=tmp_path, check=True)

    # Executa script de migração
    r = subprocess.run([_BASH, str(script)], cwd=tmp_path, capture_output=True, encoding="utf-8")
    assert r.returncode == 0, f"falha na migração: {r.stderr}"

    # Validações estruturais canônicas
    dest_modular = tmp_path / ".agents" / "skills" / "modular-architecture" / "SKILL.md"
    dest_minha = tmp_path / ".agents" / "skills" / "minha-skill" / "SKILL.md"
    assert dest_modular.exists(), "modular-architecture deve ser migrada para .agents/skills/modular-architecture/SKILL.md"
    assert "Regras locais de modularidade" in dest_modular.read_text(encoding="utf-8")
    assert dest_minha.exists(), "minha-skill deve ser preservada em .agents/skills/minha-skill/SKILL.md"

    # Valida symlinks
    assert (tmp_path / ".claude" / "skills").is_symlink()
    assert (tmp_path / ".gemini" / "skills").is_symlink()

    # Valida que o git rastreou a nova localização e não há arquivos desestagiados
    status = subprocess.run(["git", "status", "--porcelain"], cwd=tmp_path, capture_output=True, encoding="utf-8").stdout
    assert "D  .claude/skills/modular-architecture.md" not in status, "não pode registrar deleção não-rastreada"
    assert "?? .agents/skills" not in status, "novas skills devem estar staged/rastreadas"

    # A heurística HARNESS-04 aprova o resultado e é idempotente
    guide = vs_mod.load_guide(root / "guides" / "essentials" / "guia-completo-harness-commit-memoria.md")
    h = next(x for x in guide["heuristics"] if x["id"] == "HARNESS-04")
    assert vs_mod.sh(h["verify"], tmp_path, root) and not vs_mod.sh(h["when"], tmp_path, root)
    assert subprocess.run([_BASH, str(script)], cwd=tmp_path, capture_output=True).returncode == 0


def test_migrate_skills_conflito_nao_apaga_nada_e_verify_detecta_delecao(vs_mod, tmp_path):
    import subprocess
    root = Path(__file__).resolve().parents[3]
    script = root / "templates" / "harness" / "migrate_skills.sh"
    (tmp_path / ".claude" / "skills" / ".oculta").mkdir(parents=True)
    (tmp_path / ".claude" / "skills" / ".oculta" / "SKILL.md").write_text("oculta\n", encoding="utf-8")
    (tmp_path / ".claude" / "skills" / "dup.md").write_text("versão do .claude\n", encoding="utf-8")
    (tmp_path / ".agents" / "skills" / "dup").mkdir(parents=True)
    (tmp_path / ".agents" / "skills" / "dup" / "SKILL.md").write_text("versão do .agents\n", encoding="utf-8")
    r = subprocess.run([_BASH, str(script)], cwd=tmp_path, capture_output=True, encoding="utf-8")
    assert r.returncode != 0 and "conflito" in (r.stdout + r.stderr)
    assert (tmp_path / ".claude" / "skills" / "dup.md").read_text(encoding="utf-8") == "versão do .claude\n"
    assert (tmp_path / ".agents" / "skills" / "dup" / "SKILL.md").read_text(encoding="utf-8") == "versão do .agents\n"
    assert (tmp_path / ".claude" / "skills" / ".oculta" / "SKILL.md").exists()

    # verify de HARNESS-04 falha se o git registrar deleção de skill versionada
    guide = vs_mod.load_guide(root / "guides" / "essentials" / "guia-completo-harness-commit-memoria.md")
    h = next(x for x in guide["heuristics"] if x["id"] == "HARNESS-04")
    repo = tmp_path / "repo"
    (repo / ".claude" / "skills").mkdir(parents=True)
    (repo / ".claude" / "skills" / "s.md").write_text("x\n", encoding="utf-8")
    for cmd in (["init", "-q"], ["add", "-A"], ["-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "s"]):
        subprocess.run(["git", *cmd], cwd=repo, check=True)
    (repo / ".claude" / "skills" / "s.md").unlink()
    (repo / ".claude" / "skills").rmdir()
    (repo / ".agents" / "skills").mkdir(parents=True)
    for hdir in (".claude", ".gemini"):
        (repo / hdir).mkdir(exist_ok=True)
        (repo / hdir / "skills").symlink_to("../.agents/skills")
    assert not vs_mod.sh(h["verify"], repo, root)


@pytest.mark.parametrize("proprio", ["template-adr.md", "adr-template.md"])
def test_adr_02_respeita_o_template_proprio_do_projeto(vs_mod, tmp_path, proprio):
    guia = "essentials/guia-padrao-criacao-adrs.md"
    root = Path(__file__).resolve().parents[3]
    h = _heuristica(vs_mod, guia, "ADR-02")
    adr_dir = tmp_path / "docs" / "adr"
    adr_dir.mkdir(parents=True)
    (adr_dir / proprio).write_text("# Template do time\n", encoding="utf-8")
    assert not vs_mod.sh(h["when"], tmp_path, root), "o projeto já tem template: nada de um segundo"
    assert _status(vs_mod, guia, "ADR-02", tmp_path) == "skip"
    assert not (adr_dir / "TEMPLATE.md").exists()


def test_adr_02_sem_template_cria_o_canonico_e_registra_no_git(vs_mod, tmp_path):
    import subprocess
    root = Path(__file__).resolve().parents[3]
    h = _heuristica(vs_mod, "essentials/guia-padrao-criacao-adrs.md", "ADR-02")
    adr_dir = tmp_path / "docs" / "adr"
    adr_dir.mkdir(parents=True)
    (adr_dir / "0003-template-de-email.md").write_text("# ADR 0003: Template de e-mail\n", encoding="utf-8")  # ADR, não template
    _git(tmp_path, ["init", "-q"])
    assert vs_mod.sh(h["when"], tmp_path, root) and vs_mod.sh(h["do"], tmp_path, root)
    assert vs_mod.sh(h["verify"], tmp_path, root)
    status = subprocess.run(["git", "status", "--porcelain"], cwd=tmp_path, capture_output=True, encoding="utf-8").stdout
    assert "A  docs/adr/TEMPLATE.md" in status, status


def test_arch_03_04_usam_o_template_de_adr_do_projeto(vs_mod):
    guia = "architecture/guia-arquitetura-software-design-clean-code.md"
    for hid in ("ARCH-03", "ARCH-04"):
        do = _heuristica(vs_mod, guia, hid)["do"]
        assert "template de ADR do projeto" in do and "template docs/adr/TEMPLATE.md" not in do, hid
    skill = (Path(__file__).resolve().parents[3] / "skills" / "setup" / "SKILL.md").read_text(encoding="utf-8")
    assert "nunca edite a checagem do projeto" in skill


@pytest.mark.parametrize("validador", ["templates/adr/validate_adrs.py",
                                       "skills/software-engineering/forensic-adr-recovery/scripts/validate_adrs.py"])
def test_validadores_de_adr_ignoram_templates_legados(tmp_path, validador):
    import subprocess
    root = Path(__file__).resolve().parents[3]
    adr = tmp_path / "docs" / "adr"
    adr.mkdir(parents=True)
    (adr / "template-adr.md").write_text("# Template Antigo de ADR\n", encoding="utf-8")
    (adr / "TEMPLATE.md").write_text((root / "templates" / "adr" / "TEMPLATE.md").read_text(encoding="utf-8"), encoding="utf-8")
    (adr / "README.md").write_text("# índice\n", encoding="utf-8")
    (adr / "0001-usar-postgres.md").write_text(
        "<!-- LOG DE MANUTENÇÃO DE DOCUMENTAÇÃO -->\n# ADR 0001: Usar Postgres\n\n"
        "| **Status** | **Aprovada** (2026-09-27) |\n| **Decisores** | time |\n\n"
        "## 1. Contexto e Problema\nx\n## 2. Decisão de Arquitetura\nx\n", encoding="utf-8")
    r = subprocess.run([sys.executable, str(root / validador)], cwd=tmp_path, capture_output=True, encoding="utf-8")
    assert r.returncode == 0, r.stdout + r.stderr


@pytest.mark.parametrize("guia,hid", [("essentials/guia-padrao-criacao-adrs.md", "ADR-01"),
                                      ("essentials/guia-completo-harness-commit-memoria.md", "HARNESS-11")])
def test_docs_adrs_em_instalacao_nova_e_docs_adr_existente_mantido(vs_mod, tmp_path, guia, hid):
    root = Path(__file__).resolve().parents[3]
    h = _heuristica(vs_mod, guia, hid)
    novo, legado = tmp_path / "novo", tmp_path / "legado"
    novo.mkdir()
    (legado / "docs" / "adr").mkdir(parents=True)
    assert vs_mod.sh(h["when"], novo, root) and vs_mod.sh(h["do"], novo, root) and vs_mod.sh(h["verify"], novo, root)
    assert (novo / "docs" / "adrs").is_dir() and not (novo / "docs" / "adr").exists()
    if vs_mod.sh(h["when"], legado, root):  # HARNESS-11 ainda cria docs/ai e docs/commits
        assert vs_mod.sh(h["do"], legado, root)
    assert vs_mod.sh(h["verify"], legado, root) and not (legado / "docs" / "adrs").exists()


_ADR_OK = ("<!-- LOG DE MANUTENÇÃO DE DOCUMENTAÇÃO -->\n# ADR 0001: Usar Postgres\n\n"
           "| **Status** | **Aprovada** (2026-10-01) |\n| **Decisores** | time |\n\n## 2. Decisão de Arquitetura\nx\n")


@pytest.mark.parametrize("scripts", [("templates/adr/validate_adrs.py", "templates/adr/generate_adr_index.py"),
                                     ("skills/software-engineering/forensic-adr-recovery/scripts/validate_adrs.py",
                                      "skills/software-engineering/forensic-adr-recovery/scripts/generate_adr_index.py")])
def test_scripts_de_adr_usam_docs_adrs_e_preferem_docs_adr_existente(tmp_path, scripts):
    import subprocess
    root = Path(__file__).resolve().parents[3]
    validador, indice = (str(root / s) for s in scripts)
    _git(tmp_path, ["init", "-q"])
    sub = tmp_path / "backend"
    sub.mkdir()
    adrs = tmp_path / "docs" / "adrs"
    adrs.mkdir(parents=True)
    (adrs / "0001-usar-postgres.md").write_text("# sem padrão\n", encoding="utf-8")
    run = lambda s: subprocess.run([sys.executable, s], cwd=sub, capture_output=True, encoding="utf-8")  # subdir → raiz do git
    assert run(validador).returncode == 1, "docs/adrs é validado"
    (adrs / "0001-usar-postgres.md").write_text(_ADR_OK, encoding="utf-8")
    assert run(validador).returncode == 0 and run(indice).returncode == 0
    assert "0001-usar-postgres.md" in (adrs / "README.md").read_text(encoding="utf-8")
    legado = tmp_path / "docs" / "adr"
    legado.mkdir()
    (legado / "0001-x.md").write_text(_ADR_OK.replace("Usar Postgres", "X"), encoding="utf-8")
    assert run(indice).returncode == 0 and "0001-x.md" in (legado / "README.md").read_text(encoding="utf-8")


def test_adr_03_reinstala_copia_canonica_sem_resolucao_de_diretorio(vs_mod, tmp_path):
    root = Path(__file__).resolve().parents[3]
    h = _heuristica(vs_mod, "essentials/guia-padrao-criacao-adrs.md", "ADR-03")
    d = tmp_path / ".agents" / "scripts" / "adr"
    d.mkdir(parents=True)
    (d / "generate_adr_index.py").write_text("print()\n", encoding="utf-8")
    (d / "validate_adrs.py").write_text(  # cópia canônica da v2.7.3: já tinha eh_template, mas ADR_DIR = "docs/adr" fixo
        '"""Valida ADRs em docs/adr (fonte: guia-padrao-criacao-adrs.md §7.2)."""\nADR_DIR = "docs/adr"\n'
        "def eh_template(nome):\n    return False\n", encoding="utf-8")
    assert vs_mod.sh(h["when"], tmp_path, root) and not vs_mod.sh(h["verify"], tmp_path, root)
    assert vs_mod.sh(h["do"], tmp_path, root) and vs_mod.sh(h["verify"], tmp_path, root)


@pytest.mark.parametrize("pasta", ["adr", "adrs"])
def test_adr_02_e_05_atuam_no_diretorio_ativo(vs_mod, tmp_path, pasta):
    root = Path(__file__).resolve().parents[3]
    guia = "essentials/guia-padrao-criacao-adrs.md"
    (tmp_path / "docs" / pasta).mkdir(parents=True)
    scripts = tmp_path / ".agents" / "scripts" / "adr"
    scripts.mkdir(parents=True)
    for f in ("validate_adrs.py", "generate_adr_index.py"):
        (scripts / f).write_text((root / "templates" / "adr" / f).read_text(encoding="utf-8"), encoding="utf-8")
    for hid in ("ADR-02", "ADR-05"):
        h = _heuristica(vs_mod, guia, hid)
        assert vs_mod.sh(h["when"], tmp_path, root) and vs_mod.sh(h["do"], tmp_path, root), hid
        assert vs_mod.sh(h["verify"], tmp_path, root), hid
    assert sorted(p.name for p in (tmp_path / "docs" / pasta).iterdir()) == ["README.md", "TEMPLATE.md"]
    assert [p.name for p in (tmp_path / "docs").iterdir()] == [pasta]


@pytest.mark.parametrize("arquivos,esperado", [
    ({"Makefile": "test:\n\tpytest\n", "pyproject.toml": "[project]\ndependencies=['pytest']\n"}, "make test"),
    ({"pyproject.toml": "[project]\nname='a'\n[dependency-groups]\ndev=['pytest']\n", "uv.lock": ""}, "uv run pytest"),
    ({"pyproject.toml": "[project]\nname='a'\n"}, None),
    ({"composer.json": '{"require-dev": {"pestphp/pest": "^3"}}'}, "./vendor/bin/pest"),
    ({"go.mod": "module x\n"}, "go test ./..."),
    ({"Cargo.toml": "[package]\nname='x'\n"}, "cargo test"),
    ({"package.json": '{"scripts": {"test": "vitest run"}}'}, "npm test"),
    ({"package.json": '{"scripts": {"test": "echo \\"Error: no test specified\\" && exit 1"}}'}, None),
    ({}, None),
])
def test_detect_test_cmd(tmp_path, arquivos, esperado):
    for nome, conteudo in arquivos.items():
        (tmp_path / nome).write_text(conteudo, encoding="utf-8")
    r = _sh("detect_test_cmd.sh", cwd=tmp_path)
    assert (r.stdout.strip() or None, r.returncode) == (esperado, 0 if esperado else 1)


# ---------- fix pass da revisão final ----------

def _git(repo, *cmds):
    import subprocess
    for cmd in cmds:
        subprocess.run(["git", *cmd], cwd=repo, check=True, capture_output=True)


GIT_COMMIT = ["-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "x"]


def _status(vs_mod, guia, hid, proj):
    root = Path(__file__).resolve().parents[3]
    return vs_mod.verify(vs_mod.load_guide(root / "guides" / guia), proj, root)[hid]


def test_harness_04_no_verify_real_falha_com_skill_perdida_ou_plana(vs_mod, tmp_path):
    guia = "essentials/guia-completo-harness-commit-memoria.md"
    (tmp_path / ".claude" / "skills").mkdir(parents=True)
    (tmp_path / ".claude" / "skills" / "s.md").write_text("x\n", encoding="utf-8")
    _git(tmp_path, ["init", "-q"], ["add", "-A"], GIT_COMMIT)
    (tmp_path / ".claude" / "skills" / "s.md").unlink()
    (tmp_path / ".claude" / "skills").rmdir()
    (tmp_path / ".agents" / "skills").mkdir(parents=True)
    for h in (".claude", ".gemini"):
        (tmp_path / h).mkdir(exist_ok=True)
        (tmp_path / h / "skills").symlink_to("../.agents/skills")
    assert _status(vs_mod, guia, "HARNESS-04", tmp_path) == "fail", "skill deletada tem de reprovar no G6"
    (tmp_path / ".agents" / "skills" / "s").mkdir()
    (tmp_path / ".agents" / "skills" / "s" / "SKILL.md").write_text("x\n", encoding="utf-8")
    assert _status(vs_mod, guia, "HARNESS-04", tmp_path) == "pass", "deleção com a skill preservada em .agents não é perda"
    (tmp_path / ".agents" / "skills" / "legado.md").write_text("plana da v2.5.2\n", encoding="utf-8")
    assert _status(vs_mod, guia, "HARNESS-04", tmp_path) == "fail", "skill plana em .agents/skills tem de ser promovida"


def test_migrate_skills_promove_plana_de_agents_ignora_gitkeep_e_dedupe_passa(vs_mod, tmp_path):
    import subprocess
    root = Path(__file__).resolve().parents[3]
    script = root / "templates" / "harness" / "migrate_skills.sh"
    (tmp_path / ".claude" / "skills").mkdir(parents=True)
    (tmp_path / ".claude" / "skills" / ".gitkeep").write_text("", encoding="utf-8")
    (tmp_path / ".claude" / "skills" / "dup.md").write_text("igual\n", encoding="utf-8")
    (tmp_path / ".claude" / "skills" / "notas.txt").write_text("não é skill\n", encoding="utf-8")
    (tmp_path / ".agents" / "skills" / "dup").mkdir(parents=True)
    (tmp_path / ".agents" / "skills" / "dup" / "SKILL.md").write_text("igual\n", encoding="utf-8")
    (tmp_path / ".agents" / "skills" / "legado.md").write_text("plana da v2.5.2\n", encoding="utf-8")
    _git(tmp_path, ["init", "-q"], ["add", "-A"], GIT_COMMIT)
    r = subprocess.run([_BASH, str(script)], cwd=tmp_path, capture_output=True, encoding="utf-8")
    assert r.returncode == 0, r.stderr
    assert (tmp_path / ".agents" / "skills" / "legado" / "SKILL.md").read_text(encoding="utf-8") == "plana da v2.5.2\n"
    assert (tmp_path / ".agents" / "skills" / "notas.txt").read_text(encoding="utf-8") == "não é skill\n"
    assert not (tmp_path / ".agents" / "skills" / "notas").exists()
    assert _status(vs_mod, "essentials/guia-completo-harness-commit-memoria.md", "HARNESS-04", tmp_path) == "pass"


def test_adr_03_reinstala_validador_desatualizado(vs_mod, tmp_path):
    root = Path(__file__).resolve().parents[3]
    h = next(x for x in vs_mod.load_guide(root / "guides" / "essentials" / "guia-padrao-criacao-adrs.md")["heuristics"]
             if x["id"] == "ADR-03")
    d = tmp_path / ".agents" / "scripts" / "adr"
    d.mkdir(parents=True)
    (d / "generate_adr_index.py").write_text((root / "templates" / "adr" / "generate_adr_index.py").read_text(encoding="utf-8"), encoding="utf-8")
    (d / "validate_adrs.py").write_text(  # cabeçalho e filtro da cópia canônica instalada pela v2.5.2
        '"""Valida integridade e formato das ADRs em docs/adr (fonte: guia-padrao-criacao-adrs.md §7.2)."""\n'
        'IGNORADOS = {"README.md", "TEMPLATE.md"}\n', encoding="utf-8")
    assert vs_mod.sh(h["when"], tmp_path, root) and not vs_mod.sh(h["verify"], tmp_path, root)
    assert vs_mod.sh(h["do"], tmp_path, root) and vs_mod.sh(h["verify"], tmp_path, root)


def test_hn3_04_reaplica_quando_protect_secrets_usa_laco_relativo(vs_mod, tmp_path):
    import json
    root = Path(__file__).resolve().parents[3]
    h = next(x for x in vs_mod.load_guide(root / "guides" / "ai-engineering" / "guia-construcao-harness.md")["heuristics"]
             if x["id"] == "HN3-04")
    (tmp_path / ".claude").mkdir()
    s = tmp_path / ".claude" / "settings.json"
    s.write_text((root / "templates" / "harness" / "governance-hooks.json").read_text(encoding="utf-8"), encoding="utf-8")
    assert not vs_mod.sh(h["when"], tmp_path, root) and vs_mod.sh(h["verify"], tmp_path, root)
    antigo = "for d in . .claude .. ../.claude; do [ -f \"$d/protect-secrets.sh\" ] && exec bash \"$d/protect-secrets.sh\"; done; exit 0"
    s.write_text(json.dumps({"hooks": {"PreToolUse": [{"matcher": "Read", "hooks": [{"type": "command", "command": antigo}]}]}}), encoding="utf-8")
    assert vs_mod.sh(h["when"], tmp_path, root) and not vs_mod.sh(h["verify"], tmp_path, root)


def test_verify_hooks_checa_scripts_referenciados_via_root(tmp_path):
    import subprocess
    root = Path(__file__).resolve().parents[3]
    (tmp_path / ".claude").mkdir()
    (tmp_path / ".claude" / "settings.json").write_text((root / "templates" / "harness" / "governance-hooks.json").read_text(encoding="utf-8"), encoding="utf-8")
    for n in ("verify-semver.sh", "verify-docs.sh", "protect-secrets.sh"):
        (tmp_path / ".claude" / n).write_text("exit 0\n", encoding="utf-8")
        (tmp_path / ".claude" / n).chmod(0o755)
    run = lambda: subprocess.run([sys.executable, str(root / "templates" / "harness" / "verify_hooks.py"), ".claude/settings.json"],
                                 cwd=tmp_path, capture_output=True, encoding="utf-8")
    assert run().returncode == 0, run().stdout
    (tmp_path / ".claude" / "verify-semver.sh").write_text("if then fi (\n", encoding="utf-8")
    r = run()
    assert r.returncode == 1 and "verify-semver.sh" in r.stdout, r.stdout


def test_nenhum_exemplo_de_hook_nos_guias_dispara_graphify_em_md():
    import re
    root = Path(__file__).resolve().parents[3]
    ruins = [f"{p.relative_to(root)}:{i}" for p in (root / "guides").rglob("*.md")
             for i, line in enumerate(p.read_text(encoding="utf-8").splitlines(), 1)
             if "graphify" in line and re.search(r"\|md\)|\(md\||\|md\|", line)]
    assert not ruins, ruins


@pytest.mark.parametrize("arquivos,esperado", [
    ({"pyproject.toml": "[tool.poetry]\nname='a'\n[tool.poetry.group.dev.dependencies]\npytest='^8'\n", "poetry.lock": ""}, "poetry run pytest"),
    ({"pyproject.toml": "[project]\nname='a'\n[dependency-groups]\ndev=['pytest']\n", "uv.lock": ""}, "uv run pytest"),
    ({"requirements-dev.txt": "pytest==8.0\n"}, "python3 -m pytest"),
    ({"pyproject.toml": "[tool.ruff.lint]\nselect=['PT']\n[project]\ndependencies=['flake8-pytest-style']\n"}, None),
])
def test_detect_test_cmd_respeita_o_gerenciador_python(tmp_path, arquivos, esperado):
    for nome, conteudo in arquivos.items():
        (tmp_path / nome).write_text(conteudo, encoding="utf-8")
    r = _sh("detect_test_cmd.sh", cwd=tmp_path)
    assert (r.stdout.strip() or None, r.returncode) == (esperado, 0 if esperado else 1)


def test_test_baseline_so_bloqueia_falha_nova(tmp_path):
    import os
    root = Path(__file__).resolve().parents[3]
    env = {"AI_GUIDES_RUNTIME": str(root), "AI_GUIDES_BASELINE": str(tmp_path / "bl")}
    (tmp_path / "services" / "my api").mkdir(parents=True)
    (tmp_path / "apps" / "web").mkdir(parents=True)
    (tmp_path / "services" / "my api" / "pyproject.toml").write_text('[project]\nname="api"\ndependencies=["fastapi"]\n', encoding="utf-8")
    (tmp_path / "services" / "my api" / "Makefile").write_text("test:\n\t@true\n", encoding="utf-8")
    (tmp_path / "apps" / "web" / "package.json").write_text('{"dependencies":{"react":"19"},"scripts":{"test":"exit 3"}}', encoding="utf-8")
    assert _sh("test_baseline.sh", "save", cwd=tmp_path, env=env).returncode == 0
    r = _sh("test_baseline.sh", "check", cwd=tmp_path, env=env)
    assert r.returncode == 0 and "já falhava" in r.stdout, r.stdout      # web vermelho antes e depois: não bloqueia
    (tmp_path / "services" / "my api" / "Makefile").write_text("test:\n\t@false\n", encoding="utf-8")   # o setup quebrou a api
    (tmp_path / "Makefile").write_text("test:\n\t@true\n", encoding="utf-8")                          # comando novo na raiz
    r = _sh("test_baseline.sh", "check", cwd=tmp_path, env=env)
    assert r.returncode == 1 and "my api" in r.stdout and "novo" in r.stdout, r.stdout


# ---------- revisão das decisões à luz de docs/ai/reports/2026-09-25-review-setup-skill.md ----------

def test_verify_semver_ignora_comando_trivial_sem_chamar_git(tmp_path):
    import os
    import subprocess
    root = Path(__file__).resolve().parents[3]
    fake = tmp_path / "bin"
    fake.mkdir()
    (fake / "git").write_text(f'#!/bin/sh\ntouch "{tmp_path}/git-chamado"\nexit 1\n', encoding="utf-8")
    (fake / "git").chmod(0o755)
    env = {**os.environ, "PATH": f"{fake}{os.pathsep}{os.environ['PATH']}"}
    for cmd in ("ls -la", "make test", "cat README.md"):
        r = subprocess.run([_BASH, str(root / "templates" / "harness" / "verify-semver.sh")], cwd=tmp_path, env=env,
                           input='{"tool_input": {"command": "%s"}}' % cmd, encoding="utf-8", capture_output=True)
        assert r.returncode == 0 and r.stdout == ""
    assert not (tmp_path / "git-chamado").exists(), "hook de semver não pode rodar git em todo comando Bash"


@pytest.mark.parametrize("hid,comando", [
    ("HN3-05", "bash ./.claude/verify-semver.sh"),
    ("HN3-05", "sh .claude/verify-docs.sh"),
    ("HN3-04", "bash .claude/protect-secrets.sh"),
])
def test_hn3_detecta_variantes_do_hook_relativo(vs_mod, tmp_path, hid, comando):
    import json
    root = Path(__file__).resolve().parents[3]
    h = next(x for x in vs_mod.load_guide(root / "guides" / "ai-engineering" / "guia-construcao-harness.md")["heuristics"]
             if x["id"] == hid)
    (tmp_path / ".claude").mkdir()
    gov = json.loads((root / "templates" / "harness" / "governance-hooks.json").read_text(encoding="utf-8"))
    gov["hooks"]["PreToolUse"].append({"matcher": "Bash", "hooks": [{"type": "command", "command": comando}]})
    (tmp_path / ".claude" / "settings.json").write_text(json.dumps(gov, indent=2), encoding="utf-8")
    assert vs_mod.sh(h["when"], tmp_path, root) and not vs_mod.sh(h["verify"], tmp_path, root)


def test_verify_hooks_acusa_script_referenciado_ausente(tmp_path):
    import subprocess
    root = Path(__file__).resolve().parents[3]
    (tmp_path / ".claude").mkdir()
    (tmp_path / ".claude" / "settings.json").write_text((root / "templates" / "harness" / "governance-hooks.json").read_text(encoding="utf-8"), encoding="utf-8")
    (tmp_path / ".claude" / "verify-docs.sh").write_text("exit 0\n", encoding="utf-8")
    (tmp_path / ".claude" / "verify-docs.sh").chmod(0o755)
    r = subprocess.run([sys.executable, str(root / "templates" / "harness" / "verify_hooks.py"), ".claude/settings.json"],
                       cwd=tmp_path, capture_output=True, encoding="utf-8")
    assert r.returncode == 1 and "verify-semver.sh" in r.stdout and "ausente" in r.stdout, r.stdout


def _migrar(tmp_path, *args):
    import subprocess
    root = Path(__file__).resolve().parents[3]
    return subprocess.run([_BASH, str(root / "templates" / "harness" / "migrate_skills.sh"), *args], cwd=tmp_path,
                          capture_output=True, encoding="utf-8", env={**__import__("os").environ, "AI_GUIDES_BASELINE": str(tmp_path / "bl")})


def test_migrate_skills_adota_pasta_canonica_que_o_projeto_ja_tinha(tmp_path):
    (tmp_path / "skills" / "minha").mkdir(parents=True)
    (tmp_path / "skills" / "minha" / "SKILL.md").write_text("minha\n", encoding="utf-8")
    (tmp_path / "skills" / "README.md").write_text("catálogo do plugin\n", encoding="utf-8")
    (tmp_path / ".claude").mkdir()
    (tmp_path / ".claude" / "skills").symlink_to("../skills")
    _git(tmp_path, ["init", "-q"], ["add", "-A"], GIT_COMMIT)
    r = _migrar(tmp_path)
    assert r.returncode == 0, r.stderr
    for h in (".claude", ".gemini", ".agents"):
        assert (tmp_path / h / "skills" / "minha" / "SKILL.md").read_text(encoding="utf-8") == "minha\n", h
    assert (tmp_path / "skills" / "README.md").exists() and not (tmp_path / "skills" / "README").exists()
    assert _migrar(tmp_path, "--check").returncode == 0


def test_migrate_skills_symlink_elsewhere_com_agents_divergente_e_conflito(tmp_path):
    (tmp_path / "skills" / "a").mkdir(parents=True)
    (tmp_path / "skills" / "a" / "SKILL.md").write_text("a\n", encoding="utf-8")
    (tmp_path / ".agents" / "skills" / "b").mkdir(parents=True)
    (tmp_path / ".agents" / "skills" / "b" / "SKILL.md").write_text("b\n", encoding="utf-8")
    (tmp_path / ".claude").mkdir()
    (tmp_path / ".claude" / "skills").symlink_to("../skills")
    r = _migrar(tmp_path)
    assert r.returncode != 0 and "conflito" in r.stderr
    assert (tmp_path / ".claude" / "skills").resolve() == (tmp_path / "skills").resolve(), "não pode redirecionar"


def test_migrate_skills_reaponta_symlink_de_arquivo_ao_aprofundar(tmp_path):
    (tmp_path / "shared").mkdir()
    (tmp_path / "shared" / "x.md").write_text("compartilhada\n", encoding="utf-8")
    (tmp_path / ".claude" / "skills").mkdir(parents=True)
    (tmp_path / ".claude" / "skills" / "x.md").symlink_to("../../shared/x.md")
    assert _migrar(tmp_path).returncode == 0
    dest = tmp_path / ".agents" / "skills" / "x" / "SKILL.md"
    assert dest.is_symlink() and dest.read_text(encoding="utf-8") == "compartilhada\n"


def test_migrate_skills_delecao_intencional_anterior_ao_setup_nao_reprova(tmp_path):
    (tmp_path / ".claude" / "skills").mkdir(parents=True)
    (tmp_path / ".claude" / "skills" / "velha.md").write_text("x\n", encoding="utf-8")
    (tmp_path / ".claude" / "skills" / "boa.md").write_text("y\n", encoding="utf-8")
    _git(tmp_path, ["init", "-q"], ["add", "-A"], GIT_COMMIT)
    (tmp_path / ".claude" / "skills" / "velha.md").unlink()           # o usuário apagou, sem commitar
    root = Path(__file__).resolve().parents[3]
    env = {"AI_GUIDES_RUNTIME": str(root), "AI_GUIDES_BASELINE": str(tmp_path / "bl")}
    assert _sh("test_baseline.sh", "save", cwd=tmp_path, env=env).returncode == 0   # início da Fase 4
    assert _migrar(tmp_path).returncode == 0
    assert _migrar(tmp_path, "--check").returncode == 0, "deleção anterior ao setup não é perda causada por ele"


def test_validadores_de_adr_ainda_validam_adr_numerada_com_template_no_nome(tmp_path):
    import subprocess
    root = Path(__file__).resolve().parents[3]
    (tmp_path / "docs" / "adr").mkdir(parents=True)
    (tmp_path / "docs" / "adr" / "0012-usar-template-engine.md").write_text("# sem padrão\n", encoding="utf-8")
    for v in ("templates/adr/validate_adrs.py", "skills/software-engineering/forensic-adr-recovery/scripts/validate_adrs.py"):
        r = subprocess.run([sys.executable, str(root / v)], cwd=tmp_path, capture_output=True, encoding="utf-8")
        assert r.returncode == 1, v


def test_adr_03_nao_sobrescreve_validador_customizado(vs_mod, tmp_path):
    root = Path(__file__).resolve().parents[3]
    h = next(x for x in vs_mod.load_guide(root / "guides" / "essentials" / "guia-padrao-criacao-adrs.md")["heuristics"]
             if x["id"] == "ADR-03")
    d = tmp_path / ".agents" / "scripts" / "adr"
    d.mkdir(parents=True)
    (d / "generate_adr_index.py").write_text((root / "templates" / "adr" / "generate_adr_index.py").read_text(encoding="utf-8"), encoding="utf-8")
    (d / "validate_adrs.py").write_text('"""Validador do nosso time."""\nprint("ok")\n', encoding="utf-8")
    assert not vs_mod.sh(h["when"], tmp_path, root) and vs_mod.sh(h["verify"], tmp_path, root)


def test_arch_03_debito_aparece_como_warn_e_nomes_por_stack(vs_mod, tmp_path):
    guia = "architecture/guia-arquitetura-software-design-clean-code.md"
    (tmp_path / "pyproject.toml").write_text('[project]\nname="app"\ndependencies=["fastapi"]\n', encoding="utf-8")
    (tmp_path / "docs" / "adr").mkdir(parents=True)
    (tmp_path / "docs" / "adr" / "0004-debito-contrato-camadas-js.md").write_text("# ADR 0004: Débito JS\n", encoding="utf-8")
    assert _status(vs_mod, guia, "ARCH-03", tmp_path) == "warn", "débito JS não pode desligar o contrato Python"
    (tmp_path / "docs" / "adr" / "0005-debito-contrato-camadas-python.md").write_text("# ADR 0005: Débito\n", encoding="utf-8")
    (tmp_path / "pyproject.toml").write_text('[project]\nname="app"\ndependencies=["fastapi"]\n# [tool.importlinter] ver ADR 0005\n', encoding="utf-8")
    assert _status(vs_mod, guia, "ARCH-03", tmp_path) == "warn", "débito aberto é ⚠️, não ✅"
    (tmp_path / "pyproject.toml").write_text('[project]\nname="app"\ndependencies=["fastapi"]\n[tool.importlinter]\nroot_packages=["app"]\n', encoding="utf-8")
    assert _status(vs_mod, guia, "ARCH-03", tmp_path) == "pass"


def test_scalar_03_plan_e_verify_nao_executam_o_alvo(vs_mod, tmp_path):
    root = Path(__file__).resolve().parents[3]
    guia = "integrations/guia-scalar-openapi-dx.md"
    (tmp_path / "pyproject.toml").write_text('[project]\nname="api"\ndependencies=["fastapi"]\n', encoding="utf-8")
    (tmp_path / "docs" / "api").mkdir(parents=True)
    (tmp_path / "docs" / "api" / "openapi.json").write_text('{"openapi": "3.1.0"}', encoding="utf-8")
    assert _status(vs_mod, guia, "SCALAR-03", tmp_path) == "warn", "JSON sem alvo que o regenere"
    (tmp_path / "Makefile").write_text("openapi:\n\ttouch executou\n", encoding="utf-8")
    assert _status(vs_mod, guia, "SCALAR-03", tmp_path) == "pass"
    vs_mod.plan(vs_mod.load_guide(root / "guides" / guia), tmp_path, root)
    assert not (tmp_path / "executou").exists(), "verify/plan não podem rodar o alvo (efeito colateral, timeout de 60s)"
    assert "make openapi" in (root / "skills" / "setup" / "SKILL.md").read_text(encoding="utf-8"), "a prova de execução fica no G6"


def test_detect_test_cmd_prefere_test_ci(tmp_path):
    (tmp_path / "package.json").write_text('{"scripts": {"test": "jest --watch", "test:ci": "jest --ci"}}', encoding="utf-8")
    r = _sh("detect_test_cmd.sh", cwd=tmp_path)
    assert r.stdout.strip() == "npm run test:ci"


def test_test_baseline_roda_com_ci_true_e_so_a_raiz_quando_ela_tem_suite(tmp_path):
    root = Path(__file__).resolve().parents[3]
    env = {"AI_GUIDES_RUNTIME": str(root), "AI_GUIDES_BASELINE": str(tmp_path / "bl")}
    (tmp_path / "Makefile").write_text('test:\n\t@test "$$CI" = true\n', encoding="utf-8")
    (tmp_path / "services" / "api").mkdir(parents=True)
    (tmp_path / "services" / "api" / "pyproject.toml").write_text('[project]\nname="api"\ndependencies=["fastapi","pytest"]\n', encoding="utf-8")
    r = _sh("test_baseline.sh", "save", cwd=tmp_path, env=env)
    assert "baseline .: verde" in r.stdout and "services/api" not in r.stdout, r.stdout


def test_templates_de_agente_isentam_o_manifesto_da_regra_de_nome():
    root = Path(__file__).resolve().parents[3]
    for t in ("AGENTS.md.template",):
        assert "setup-manifest.yaml" in (root / "templates" / t).read_text(encoding="utf-8"), t


def test_templates_agents_e_stub_do_claude():
    import json
    root = Path(__file__).resolve().parents[3] / "templates"
    assert not (root / "GEMINI.md.template").exists()
    assert "@AGENTS.md" in (root / "CLAUDE.md.template").read_text(encoding="utf-8").splitlines()
    assert sum(l.startswith("## ") for l in (root / "AGENTS.md.template").read_text(encoding="utf-8").splitlines()) == 6
    assert json.loads((root / "settings.gemini.json").read_text(encoding="utf-8"))["context"]["fileName"] == ["AGENTS.md", "GEMINI.md"]


# ---------- apply ----------

GUIDE_AGENT = """\
guide: piloto
version: 1
heuristics:
  - id: PIL-01
    title: passo do agente
    when: "! test -f a.txt"
    do: "agent: crie a.txt"
    verify: "test -f a.txt"
  - id: PIL-02
    title: depende do agente
    when: "! test -f b.txt"
    do: "cp a.txt b.txt"
    verify: "test -f b.txt"
    depends_on: [PIL-01]
  - id: PIL-03
    title: shell quebrado
    when: "true"
    do: "echo tentei; exit 3"
    verify: "false"
  - id: PIL-04
    title: nunca roda depois de um fail
    when: "true"
    do: "touch nunca"
    verify: "test -f nunca"
"""


def test_apply_executa_do_shell_na_ordem_prova_com_verify_e_e_idempotente(vs_mod, runtime, project):
    g = vs_mod.index_guides(runtime)["piloto"]
    assert vs_mod.apply(g, project, runtime) == ({"PIL-01": "pass", "PIL-02": "pass"}, [], "")
    assert (project / "a" / "b").exists()
    assert vs_mod.apply(g, project, runtime) == ({}, [], "")


def test_apply_adia_dependente_de_agent_e_para_no_primeiro_fail(vs_mod, tmp_path, project):
    rt = tmp_path / "rt-agent"
    make_guide(rt, GUIDE_AGENT)
    g = vs_mod.index_guides(rt)["piloto"]
    results, pendentes, saida = vs_mod.apply(g, project, rt)
    assert results == {"PIL-02": "adiado", "PIL-03": "fail"}
    assert [h["id"] for h in pendentes] == ["PIL-01"] and "tentei" in saida
    assert not (project / "nunca").exists()
    (project / "a.txt").write_text("x", encoding="utf-8")  # o agente fez o PIL-01
    results, pendentes, _ = vs_mod.apply(g, project, rt)
    assert results["PIL-02"] == "pass" and pendentes == []


def test_apply_nao_trava_em_do_que_le_stdin(vs_mod, tmp_path, project):
    rt = tmp_path / "rt-stdin"
    make_guide(rt, GUIDE_OK.replace('do: "mkdir -p a"', 'do: "read resposta && mkdir -p a"'))
    g = vs_mod.index_guides(rt)["piloto"]
    assert vs_mod.apply(g, project, rt)[0] == {"PIL-01": "fail"}


def test_cmd_apply_imprime_status_e_nada_a_aplicar_na_segunda_vez(vs_mod, runtime, project, monkeypatch, capsys):
    monkeypatch.setenv("AI_GUIDES_HOME", str(runtime))
    assert vs_mod.main(["apply", "piloto", "--project", str(project)]) == 0
    out = capsys.readouterr().out
    assert "✅ PIL-01" in out and "✅ PIL-02" in out
    assert vs_mod.main(["apply", "piloto", "--project", str(project)]) == 0
    assert "nada a aplicar" in capsys.readouterr().out


def test_verify_termina_com_linha_de_resultado(vs_mod, runtime, project, monkeypatch, capsys):
    monkeypatch.setenv("AI_GUIDES_HOME", str(runtime))
    assert vs_mod.main(["verify", "piloto", "--project", str(project)]) == 1
    ultima = capsys.readouterr().out.strip().splitlines()[-1]
    assert ultima.startswith("RESULTADO: 2 ❌ · 0 ⚠️ · 0 ✅") and "NÃO declare sucesso" in ultima
    (project / "a").mkdir()
    (project / "a" / "b").touch()
    assert vs_mod.main(["verify", "piloto", "--project", str(project)]) == 0
    assert capsys.readouterr().out.strip().splitlines()[-1].startswith("RESULTADO: 0 ❌ · 0 ⚠️ · 2 ✅")


def test_verify_com_aviso_pede_o_agent_ou_a_justificativa(vs_mod, runtime, project, monkeypatch, capsys):
    monkeypatch.setenv("AI_GUIDES_HOME", str(runtime))
    (project / "a").mkdir()
    (project / "a" / "b").touch()
    (project / "package.json").write_text("{}\n", encoding="utf-8")          # PIL-03 (opcional) aplicável e não feito
    assert vs_mod.main(["verify", "piloto", "--project", str(project)]) == 0, "⚠️ não bloqueia"
    ultima = capsys.readouterr().out.strip().splitlines()[-1]
    assert ultima.startswith("RESULTADO: 0 ❌ · 1 ⚠️ · 2 ✅"), ultima
    assert "sem ❌, mas 1 ⚠️" in ultima and "faça o AGENT" in ultima and "justifique" in ultima, ultima
    assert "`plan <slug>`" in ultima and "apply" not in ultima, "apply executa os do (inclusive o recusado); plan só lê"


def test_orquestrador_e_sub_skills_pedem_motivo_de_cada_aviso():
    root = Path(__file__).resolve().parents[3]
    for arq in ("templates/setup-subskill.SKILL.md.template", "skills/setup/SKILL.md"):
        texto = (root / arq).read_text(encoding="utf-8")
        assert "⚠️ <ID>: <motivo>" in texto and "recusou" in texto and "sem executar nada" in texto, arq
        assert "` mostra o texto" not in texto.replace("plan {{slug}}` mostra o texto", "").replace(
            "plan <slug>` mostra o texto", ""), arq


def test_docs_dizem_que_o_adr_02_so_cria_template_sem_template_proprio():
    root = Path(__file__).resolve().parents[3]
    assert "sem template próprio" in (root / "skills" / "setup" / "padrao-criacao-adrs" / "SKILL.md").read_text(
        encoding="utf-8").split("---\n", 2)[1]
    linha = next(l for l in (root / "templates" / "README.md").read_text(encoding="utf-8").splitlines()
                 if "adr/TEMPLATE.md" in l)
    assert "sem template próprio" in linha, linha


def test_test_baseline_compara_ids_de_falha_e_acusa_baseline_cego(tmp_path):
    root = Path(__file__).resolve().parents[3]
    env = {"AI_GUIDES_RUNTIME": str(root), "AI_GUIDES_BASELINE": str(tmp_path / "bl")}
    saida = tmp_path / "saida.txt"
    (tmp_path / "Makefile").write_text(f"test:\n\t@cat {saida.as_posix()}; exit 1\n", encoding="utf-8")  # sh: \ é escape
    saida.write_text("FAILED tests/test_a.py::test_x - AssertionError: 1\n", encoding="utf-8")
    assert _sh("test_baseline.sh", "save", cwd=tmp_path, env=env).returncode == 0
    saida.write_text("FAILED tests/test_a.py::test_x - AssertionError: 2\n", encoding="utf-8")    # mesma falha, outra mensagem
    r = _sh("test_baseline.sh", "check", cwd=tmp_path, env=env)
    assert r.returncode == 0 and "sem falha nova" in r.stdout, r.stdout
    saida.write_text("FAILED tests/test_a.py::test_x - AssertionError: 1\nFAILED tests/test_b.py::test_y - boom\n", encoding="utf-8")
    r = _sh("test_baseline.sh", "check", cwd=tmp_path, env=env)
    assert r.returncode == 1 and "tests/test_b.py::test_y" in r.stdout and "test_x" not in r.stdout, r.stdout
    saida.write_text("ERROR tests/test_c.py - ModuleNotFoundError\n!!! Interrupted: 1 error during collection !!!\n", encoding="utf-8")
    assert _sh("test_baseline.sh", "save", cwd=tmp_path, env=env).returncode == 0
    r = _sh("test_baseline.sh", "check", cwd=tmp_path, env=env)
    assert r.returncode == 0 and "baseline cego" in r.stdout and "nem executou os testes" in r.stdout, r.stdout


def test_test_baseline_enxerga_teste_novo_quebrado_com_coleta_quebrada(tmp_path):
    root = Path(__file__).resolve().parents[3]
    env = {"AI_GUIDES_RUNTIME": str(root), "AI_GUIDES_BASELINE": str(tmp_path / "bl")}
    tests = tmp_path / "tests"
    tests.mkdir()
    (tests / "test_ok.py").write_text("def test_ok():\n    assert True\n", encoding="utf-8")
    (tests / "test_quebrado.py").write_text("import modulo_que_nao_existe\n", encoding="utf-8")   # coleta quebrada antes do setup
    (tmp_path / "Makefile").write_text(f"test:\n\t{sys.executable} -m pytest -q -p no:cacheprovider tests\n", encoding="utf-8")
    assert _sh("test_baseline.sh", "save", cwd=tmp_path, env=env).returncode == 0
    (tests / "test_novo.py").write_text("def test_novo():\n    assert False\n", encoding="utf-8")  # teste que o setup criou, quebrado
    r = _sh("test_baseline.sh", "check", cwd=tmp_path, env=env)
    assert r.returncode == 1 and "tests/test_novo.py::test_novo" in r.stdout, r.stdout


def test_test_baseline_acrescenta_o_flag_ao_pytest_addopts_do_projeto(tmp_path):
    root = Path(__file__).resolve().parents[3]
    env = {"AI_GUIDES_RUNTIME": str(root), "AI_GUIDES_BASELINE": str(tmp_path / "bl"), "PYTEST_ADDOPTS": "-p no:xdist"}
    (tmp_path / "Makefile").write_text('test:\n\t@echo "addopts=$$PYTEST_ADDOPTS"\n', encoding="utf-8")
    assert _sh("test_baseline.sh", "save", cwd=tmp_path, env=env).returncode == 0
    log = (tmp_path / "bl" / "..antes.log").read_text(encoding="utf-8")
    assert "addopts=-p no:xdist --continue-on-collection-errors" in log, log


def _heuristica(vs_mod, guia, hid):
    root = Path(__file__).resolve().parents[3]
    return next(x for x in vs_mod.load_guide(root / "guides" / guia)["heuristics"] if x["id"] == hid)


def test_hn3_09_cria_alvo_sem_variavel_indefinida_e_repara_makefile_da_v2_6_0(vs_mod, tmp_path):
    import subprocess
    root = Path(__file__).resolve().parents[3]
    h = _heuristica(vs_mod, "ai-engineering/guia-construcao-harness.md", "HN3-09")
    mk = tmp_path / "Makefile"
    mk.write_text("test:\n\t@true\n", encoding="utf-8")
    assert vs_mod.sh(h["when"], tmp_path, root) and vs_mod.sh(h["do"], tmp_path, root)
    assert vs_mod.sh(h["verify"], tmp_path, root) and not vs_mod.sh(h["when"], tmp_path, root)
    dry = subprocess.run(["make", "-n", "setup-gemini-hook"], cwd=tmp_path, capture_output=True, encoding="utf-8")
    assert '".agents/ai-guides/templates/pre-commit-memory.sh"' in dry.stdout, dry.stdout
    mk.write_text(mk.read_text(encoding="utf-8").replace(".agents/ai-guides/templates", "$(AI_GUIDES_RUNTIME)/templates"), encoding="utf-8")
    assert vs_mod.sh(h["when"], tmp_path, root) and vs_mod.sh(h["do"], tmp_path, root)
    assert vs_mod.sh(h["verify"], tmp_path, root) and mk.read_text(encoding="utf-8").count("pull-memory:") == 1


def test_graph_06_nao_sobrescreve_curador_customizado(vs_mod, tmp_path):
    root = Path(__file__).resolve().parents[3]
    h = _heuristica(vs_mod, "essentials/guia-graph-engineering.md", "GRAPH-06")
    custom = tmp_path / ".claude" / "agents" / "knowledge-graph-curator.md"
    custom.parent.mkdir(parents=True)
    custom.write_text("---\nname: knowledge-graph-curator\n---\nregra do projeto\n", encoding="utf-8")
    assert vs_mod.sh(h["when"], tmp_path, root) and vs_mod.sh(h["do"], tmp_path, root)
    assert custom.read_text(encoding="utf-8").endswith("regra do projeto\n")
    assert (tmp_path / ".gemini" / "agents" / "knowledge-graph-curator.md").exists()
    assert vs_mod.sh(h["verify"], tmp_path, root)


def test_graph_smoke_exige_nos_na_resposta(tmp_path):
    import json
    import os
    bin_ = tmp_path / "bin"
    bin_.mkdir()
    fake = bin_ / "graphify"
    (tmp_path / "graphify-out").mkdir()
    (tmp_path / "graphify-out" / "graph.json").write_text(json.dumps({"nodes": [{"label": "main.py"}], "links": []}), encoding="utf-8")
    env = {"PATH": f"{bin_}{os.pathsep}{os.environ['PATH']}", "HOME": str(tmp_path)}  # HOME isola o graphify real
    fake.write_text('#!/bin/sh\necho "No matching nodes found."\n', encoding="utf-8")
    fake.chmod(0o755)
    assert _sh("graph_smoke.sh", cwd=tmp_path, env=env).returncode == 1
    fake.write_text('#!/bin/sh\necho "NODE $2 [src=x]"\n', encoding="utf-8")
    r = _sh("graph_smoke.sh", cwd=tmp_path, env=env)
    assert r.returncode == 0 and "NODE main.py" in r.stdout, r.stdout


@pytest.mark.parametrize("arquivos,rc", [
    ({"pyproject.toml": '[tool.ruff.lint]\nextend-select = ["E722"]\n'}, 1),
    ({"pyproject.toml": '[tool.ruff.lint]\nextend-select = ["E722"]\n[dependency-groups]\ndev = [\n  "ruff>=0.6",\n]\n'}, 0),
    ({"pyproject.toml": '[tool.ruff.lint]\nextend-select = ["E722"]\n', "requirements-dev.txt": "ruff==0.6.9\n"}, 0),
    ({"pyproject.toml": '[tool.ruff.lint]\nextend-select = ["E722"]\n',
      ".pre-commit-config.yaml": "repos:\n  - repo: https://github.com/astral-sh/ruff-pre-commit\n"}, 0),
])
def test_check_ruff_rules_declared_exige_ruff_nas_dependencias(tmp_path, arquivos, rc):
    import subprocess
    root = Path(__file__).resolve().parents[3]
    for nome, conteudo in arquivos.items():
        (tmp_path / nome).write_text(conteudo, encoding="utf-8")
    r = subprocess.run([sys.executable, str(root / "templates" / "architecture" / "check_ruff_rules.py"), "--declared", "E722"],
                       cwd=tmp_path, capture_output=True, encoding="utf-8")
    assert r.returncode == rc, r.stdout


def test_sub_skills_seguem_o_template_e_usam_apply():
    root = Path(__file__).resolve().parents[3]
    corpo = (root / "templates" / "setup-subskill.SKILL.md.template").read_text(encoding="utf-8").split("---\n", 2)[2]
    assert "verify_setup.py apply {{slug}}" in corpo
    divergentes = [p.parent.name for p in sorted((root / "skills" / "setup").glob("*/SKILL.md"))
                   if p.read_text(encoding="utf-8").split("---\n", 2)[2] != corpo.replace("{{slug}}", p.parent.name)]
    assert not divergentes, divergentes


def test_verify_hooks_normaliza_variaveis_entre_aspas_e_com_chaves(tmp_path):
    import json
    import os
    import subprocess
    script = Path(__file__).resolve().parents[3] / "templates" / "harness" / "verify_hooks.py"
    home, proj = tmp_path / "home", tmp_path / "proj"
    for base, rel in ((proj, ".claude/hooks/ok.sh"), (home, ".claude/ok.sh")):
        (base / rel).parent.mkdir(parents=True, exist_ok=True)
        (base / rel).write_text("#!/bin/sh\ntrue\n", encoding="utf-8")
        (base / rel).chmod(0o755)
    settings = proj / "settings.json"

    def run(cmd):
        settings.write_text(json.dumps({"hooks": {"PreToolUse": [{"hooks": [{"type": "command", "command": cmd}]}]}}), encoding="utf-8")
        return subprocess.run([sys.executable, str(script), str(settings)], cwd=proj, capture_output=True, encoding="utf-8",
                              env={**os.environ, "HOME": str(home)})

    for bom in ('"$CLAUDE_PROJECT_DIR"/.claude/hooks/ok.sh', '"$HOME"/.claude/ok.sh',   # padrão da doc do Claude Code
                "bash ${HOME}/.claude/ok.sh", "${CLAUDE_PROJECT_DIR}/.claude/hooks/ok.sh"):
        r = run(bom)
        assert r.returncode == 0, (bom, r.stdout)
    for ruim in ("python3 $HOME/.claude/hooks/nao-existe.py", "${HOME}/bin/nao-existe",
                 '"$CLAUDE_PROJECT_DIR"/.claude/hooks/nao-existe.sh'):
        r = run(ruim)
        assert r.returncode == 1 and "ausente" in r.stdout, (ruim, r.stdout)


def test_harness_16_atualiza_verify_hooks_desatualizado(vs_mod, tmp_path):
    root = Path(__file__).resolve().parents[3]
    h = _heuristica(vs_mod, "essentials/guia-completo-harness-commit-memoria.md", "HARNESS-16")
    copia = tmp_path / ".agents" / "scripts" / "harness" / "verify_hooks.py"
    copia.parent.mkdir(parents=True)
    copia.write_text("import sys\nsys.exit(0)  # cópia da v2.6.0: passa sem checar nada\n", encoding="utf-8")
    assert vs_mod.sh(h["when"], tmp_path, root), "cópia desatualizada tem de reaplicar"
    assert not vs_mod.sh(h["verify"], tmp_path, root), "verify não pode aceitar a cópia antiga"
    vs_mod.sh(h["do"], tmp_path, root)
    assert vs_mod.sh(h["verify"], tmp_path, root) and not vs_mod.sh(h["when"], tmp_path, root)


def test_harness_16_manda_pular_ou_perguntar_em_vez_de_editar_hooks(vs_mod, tmp_path):
    import json
    import os
    import subprocess
    root = Path(__file__).resolve().parents[3]
    h = _heuristica(vs_mod, "essentials/guia-completo-harness-commit-memoria.md", "HARNESS-16")
    (tmp_path / ".claude").mkdir()
    (tmp_path / ".claude" / "settings.json").write_text(json.dumps(
        {"hooks": {"PreToolUse": [{"hooks": [{"type": "command", "command": "/nao/existe/graphify hook-guard read"}]}]}}), encoding="utf-8")
    r = subprocess.run(["sh", "-c", h["do"]], cwd=tmp_path, capture_output=True, encoding="utf-8",
                       env={**os.environ, "AI_GUIDES_RUNTIME": str(root)})
    assert "--skip HARNESS-16" in r.stdout and "AskUserQuestion" in r.stdout, r.stdout
    assert "corrija os hooks" not in r.stdout, r.stdout


def test_harness_17_instala_mods_e_mescla_settings_mods(vs_mod, tmp_path):
    import json
    root = Path(__file__).resolve().parents[3]
    h = _heuristica(vs_mod, "ai-engineering/guia-mods-tui-observabilidade.md", "MODS-02")
    (tmp_path / ".claude").mkdir()
    (tmp_path / ".claude" / "settings.json").write_text(json.dumps({"hooks": {}}), encoding="utf-8")
    assert vs_mod.sh(h["when"], tmp_path, root), "quando mods/ ausente ou hooks não mesclados, when deve disparar"
    assert not vs_mod.sh(h["verify"], tmp_path, root), "verify não pode passar antes da instalação dos mods"
    vs_mod.sh(h["do"], tmp_path, root)
    assert (tmp_path / "mods" / "blast-radius").is_dir()
    assert (tmp_path / "mods" / "next-steps").is_dir()
    assert vs_mod.sh(h["verify"], tmp_path, root), "verify deve aprovar após do"
    assert not vs_mod.sh(h["when"], tmp_path, root), "when não deve mais disparar após instalação completa"


def test_setup_mods_skill_registrada_e_valida():
    import json
    root = Path(__file__).resolve().parents[3]
    skill_file = root / "skills" / "software-engineering" / "setup-mods" / "SKILL.md"
    assert skill_file.exists(), "skills/software-engineering/setup-mods/SKILL.md deve existir"
    content = skill_file.read_text(encoding="utf-8")
    assert "name: setup-mods" in content
    assert "/setup-mods" in content
    assert "MODS-01" in content or "MODS-02" in content or "guia-mods-tui-observabilidade" in content
    marketplace = json.loads((root / ".claude-plugin" / "marketplace.json").read_text(encoding="utf-8"))
    suite = next(p for p in marketplace["plugins"] if p["name"] == "ai-guides-suite")
    assert "./skills/software-engineering/setup-mods" in suite["skills"]



def test_sub_skills_nao_mandam_commitar_nem_consertar_a_mao():
    root = Path(__file__).resolve().parents[3]
    corpo = (root / "templates" / "setup-subskill.SKILL.md.template").read_text(encoding="utf-8")
    assert "commitad" not in corpo, "versionar .agents/ai-guides/ é do usuário, depois do G6"
    assert "não conserte à mão" in corpo and "AskUserQuestion" in corpo
    assert "commitados" not in (root / "skills" / "setup" / "scripts" / "verify_setup.py").read_text(encoding="utf-8")
    assert "git status --short" in (root / "skills" / "setup" / "SKILL.md").read_text(encoding="utf-8")


def test_apply_skip_pula_id_recusado_e_adia_dependentes(vs_mod, runtime, project, monkeypatch, capsys):
    g = vs_mod.index_guides(runtime)["piloto"]
    assert vs_mod.apply(g, project, runtime, skip=["PIL-01"]) == ({"PIL-01": "skip", "PIL-02": "adiado"}, [], "")
    assert not (project / "a").exists()
    monkeypatch.setenv("AI_GUIDES_HOME", str(runtime))
    assert vs_mod.main(["apply", "piloto", "--skip", "PIL-01", "--project", str(project)]) == 0
    assert "⏭️ PIL-01" in capsys.readouterr().out and not (project / "a").exists()


def test_test_baseline_ignora_cobertura_e_log_capturado_mas_pega_id_do_jest(tmp_path):
    root = Path(__file__).resolve().parents[3]
    env = {"AI_GUIDES_RUNTIME": str(root), "AI_GUIDES_BASELINE": str(tmp_path / "bl")}
    saida = tmp_path / "saida.txt"
    (tmp_path / "Makefile").write_text(f"test:\n\t@cat {saida.as_posix()}; exit 1\n", encoding="utf-8")  # sh: \ é escape
    antes = ("FAILED tests/test_a.py::test_x - e\n"
             "FAIL Required test coverage of 80% not reached. Total coverage: 45.00%\n"
             "ERROR    app.io:io.py:9 falhou em /tmp/pytest-of-u/pytest-41/x\n"
             "FAIL src/a.test.js\n")
    saida.write_text(antes, encoding="utf-8")
    assert _sh("test_baseline.sh", "save", cwd=tmp_path, env=env).returncode == 0
    saida.write_text(antes.replace("45.00%", "45.10%").replace("pytest-41", "pytest-42"), encoding="utf-8")
    r = _sh("test_baseline.sh", "check", cwd=tmp_path, env=env)
    assert r.returncode == 0 and "sem falha nova" in r.stdout, r.stdout
    saida.write_text(antes + "FAIL src/b.test.js\n", encoding="utf-8")
    r = _sh("test_baseline.sh", "check", cwd=tmp_path, env=env)
    assert r.returncode == 1 and "src/b.test.js" in r.stdout, r.stdout


def test_merge_hooks_replace_nao_apaga_entrada_que_nao_casou(tmp_path):
    import json
    root = Path(__file__).resolve().parents[3]
    gov = root / "templates" / "harness" / "governance-hooks.json"
    s = tmp_path / "settings.json"
    plano = {"type": "command", "command": "echo user-flat-hook"}  # fora do schema, mas é do usuário
    vazia = {"matcher": "Glob", "hooks": []}
    s.write_text(json.dumps({"hooks": {"PreToolUse": [plano, vazia]}}), encoding="utf-8")
    r = _merge_hooks(gov, s, "--event", "PreToolUse", "--matcher", "Read|Write|Edit|Grep", "--replace", "protect-secrets",
                     cwd=tmp_path)
    assert r.returncode == 0, r.stderr
    pre = json.loads(s.read_text(encoding="utf-8"))["hooks"]["PreToolUse"]
    assert plano in pre and vazia in pre, pre


def test_template_da_sub_skill_repassa_o_que_o_agent_manda_reportar_e_a_regra_de_docs_ai():
    root = Path(__file__).resolve().parents[3]
    corpo = (root / "templates" / "setup-subskill.SKILL.md.template").read_text(encoding="utf-8").split("---\n", 2)[2]
    passo7 = next(l for l in corpo.splitlines() if l.startswith("7. "))
    assert "AGENT" in passo7 and "conflitos" in passo7, passo7   # HARNESS-05/06 mandam listar conflitos na saída final
    assert "docs/ai/" in corpo


def test_setup_fase_2_respeita_limite_de_16_opcoes_por_chamada():
    root = Path(__file__).resolve().parents[3]
    fase2 = (root / "skills" / "setup" / "SKILL.md").read_text(encoding="utf-8").split("## Fase 2")[1].split("## Fase 3")[0]
    assert "16" in fase2 and "segunda chamada" in fase2, "4 perguntas × 4 opções: acima de 16 guias, outra chamada"


def test_guides_readme_documenta_o_contrato_do_do_shell():
    root = Path(__file__).resolve().parents[3]
    regras = (root / "guides" / "README.md").read_text(encoding="utf-8")
    for termo in ("verify_setup.py apply", "stdin", "900 s", "idempotente", "when → do → verify"):
        assert termo in regras, termo


def test_merge_hooks_check_nao_escreve_e_acusa_o_que_falta(tmp_path):
    root = Path(__file__).resolve().parents[3]
    tpl = root / "templates" / "settings.gemini.json"
    s = tmp_path / "settings.json"
    r = _merge_hooks(tpl, s, "--check", cwd=tmp_path)
    assert r.returncode == 1 and "falta: BeforeTool" in r.stderr and not s.exists()
    assert _merge_hooks(tpl, s, cwd=tmp_path).returncode == 0
    antes = s.read_text(encoding="utf-8")
    assert _merge_hooks(tpl, s, "--check", cwd=tmp_path).returncode == 0 and s.read_text(encoding="utf-8") == antes


def test_graph_04_troca_hook_legado_pelo_canonico_e_preserva_os_do_projeto(vs_mod, tmp_path):
    import json
    root = Path(__file__).resolve().parents[3]
    h = _heuristica(vs_mod, "essentials/guia-graph-engineering.md", "GRAPH-04")
    s = tmp_path / ".claude" / "settings.json"
    s.parent.mkdir(parents=True)
    s.write_text(json.dumps({"hooks": {
        "PreToolUse": [
            {"matcher": "Bash|Grep", "hooks": [
                {"type": "command", "command": "/Users/weles/.local/bin/graphify hook-guard search"}]},
            {"matcher": "Read|Write|Edit|Grep", "hooks": [
                {"type": "command", "command": "bash .claude/protect-secrets.sh"}]}],
        "PostToolUse": [{"matcher": "Write|Edit", "hooks": [
            {"type": "command", "command": "(jq -r '.tool_input.file_path' | grep -E '\\.py$' && graphify update .) || true"}]}]}}), encoding="utf-8")
    assert vs_mod.sh(h["when"], tmp_path, root), "hook-guard fora do template tem de reaplicar"
    assert not vs_mod.sh(h["verify"], tmp_path, root)
    assert vs_mod.sh(h["do"], tmp_path, root) and vs_mod.sh(h["verify"], tmp_path, root)
    assert not vs_mod.sh(h["when"], tmp_path, root)
    texto = s.read_text(encoding="utf-8")
    assert "/Users/weles" not in texto and "&& graphify update .) || true" not in texto
    assert "graphify hook-guard read --strict" in texto and "bash .claude/protect-secrets.sh" in texto
    assert vs_mod.sh(h["do"], tmp_path, root) and s.read_text(encoding="utf-8") == texto, "idempotente"


def test_merge_agent_md_tira_comandos_sem_alvo_e_check_acusa_os_que_sobraram(vs_mod, tmp_path):
    import subprocess
    root = Path(__file__).resolve().parents[3]
    script = root / "templates" / "harness" / "merge_agent_md.py"
    tpl = root / "templates" / "AGENTS.md.template"

    def run(alvo, *a):
        return subprocess.run([sys.executable, str(script), *a, str(tpl), str(alvo)], cwd=alvo.parent,
                              capture_output=True, encoding="utf-8")

    alvo = tmp_path / "AGENTS.md"
    (tmp_path / "Makefile").write_text("test:\n\t@true\ndev:\n\t@true\nVAR := 1\n", encoding="utf-8")
    assert run(alvo).stdout.strip() == "criado"
    texto = alvo.read_text(encoding="utf-8")
    assert sorted(l.split()[1] for l in texto.splitlines() if l.startswith("make ")) == [
        "dev", "pull-memory", "push-memory", "setup-gemini-hook", "test"]
    assert "# Execução e Docker" in texto and "# Ambiente e Dependências" not in texto, "grupo vazio sai"
    assert texto.startswith("# Diretrizes"), "heading fora do bloco de comandos fica"
    assert "1password" not in texto.lower(), "guia opcional entra pelo OP-05, não pelo template"
    assert run(alvo, "--check").returncode == 0

    lint = next(l for l in tpl.read_text(encoding="utf-8").splitlines() if l.startswith("make lint"))
    alvo.write_text(texto.replace("make test ", lint + "\nmake test ", 1), encoding="utf-8")
    _git(tmp_path, ["init", "-q"], ["add", "AGENTS.md"], GIT_COMMIT)
    r = run(alvo, "--check")
    assert r.returncode == 1 and "sem alvo no Makefile" in r.stderr and "make lint" in r.stderr
    alvo.write_text(texto, encoding="utf-8")  # a linha órfã foi apagada depois do commit
    assert run(alvo, "--check").returncode == 0, "linha que veio do template não é conteúdo perdido do projeto"

    sem_make = tmp_path / "sem_make"
    sem_make.mkdir()
    assert run(sem_make / "AGENTS.md").stdout.strip() == "criado"
    texto = (sem_make / "AGENTS.md").read_text(encoding="utf-8")
    assert not [l for l in texto.splitlines() if l.startswith("make ")]
    assert "# (sem alvo no Makefile" in texto and texto.count("```") % 2 == 0

    for hid in ("HARNESS-05",):
        do = _heuristica(vs_mod, "essentials/guia-completo-harness-commit-memoria.md", hid)["do"]
        assert "sem alvo no Makefile" in do, hid


@pytest.mark.parametrize("conteudo,ok", [
    (None, False),
    ('{"mcpServers": {}}', False),
    ('{"mcpServers": {"context7": {}}}', False),
    ('{"mcpServers": {"sequential_thinking": {}, "context7": {}}}', True),
    ('{"mcpServers": {"sequential-thinking": {}, "context7": {}}}', True),
])
def test_hn3_08_exige_os_dois_servidores_mcp(vs_mod, tmp_path, conteudo, ok):
    root = Path(__file__).resolve().parents[3]
    h = _heuristica(vs_mod, "ai-engineering/guia-construcao-harness.md", "HN3-08")
    if conteudo:
        (tmp_path / ".gemini").mkdir()
        (tmp_path / ".gemini" / "settings.json").write_text(conteudo, encoding="utf-8")
    assert vs_mod.sh(h["verify"], tmp_path, root) is ok
    assert vs_mod.sh(h["when"], tmp_path, root) is not ok


def test_testb_02_exige_pytest_xdist_como_o_titulo_promete(vs_mod, tmp_path):
    root = Path(__file__).resolve().parents[3]
    h = _heuristica(vs_mod, "testing/backend/README.md", "TESTB-02")
    py = tmp_path / "pyproject.toml"
    py.write_text('[project]\nname="app"\ndependencies=["fastapi"]\n[dependency-groups]\ndev=["pytest","pytest-cov"]\n', encoding="utf-8")
    assert vs_mod.sh(h["when"], tmp_path, root) and not vs_mod.sh(h["verify"], tmp_path, root)
    py.write_text(py.read_text(encoding="utf-8").replace('"pytest-cov"]', '"pytest-cov","pytest-xdist"]'), encoding="utf-8")
    assert vs_mod.sh(h["verify"], tmp_path, root) and not vs_mod.sh(h["when"], tmp_path, root)


def test_resil_03_exige_teste_que_chama_o_readyz(vs_mod, tmp_path):
    root = Path(__file__).resolve().parents[3]
    guia = "architecture/guia-padroes-resiliencia-defensiva.md"
    h = _heuristica(vs_mod, guia, "RESIL-03")
    _git(tmp_path, ["init", "-q"])
    (tmp_path / "pyproject.toml").write_text('[project]\nname="app"\ndependencies=["fastapi"]\n', encoding="utf-8")
    (tmp_path / "src").mkdir()
    (tmp_path / "src" / "main.py").write_text('@app.get("/livez")\n@app.get("/readyz")\n', encoding="utf-8")
    (tmp_path / "src" / "latest.py").write_text("# readyz\n", encoding="utf-8")  # "latest" não é arquivo de teste
    assert vs_mod.sh(h["when"], tmp_path, root) and not vs_mod.sh(h["verify"], tmp_path, root)
    assert _status(vs_mod, guia, "RESIL-03", tmp_path) == "fail", "probe sem teste não é ✅ nem ⏭️"
    (tmp_path / "tests").mkdir()
    (tmp_path / "tests" / "test_probes.py").write_text(
        'def test_readyz_503(client):\n    assert client.get("/readyz").status_code == 503\n', encoding="utf-8")
    assert vs_mod.sh(h["verify"], tmp_path, root) and not vs_mod.sh(h["when"], tmp_path, root)


@pytest.mark.parametrize("pasta", ["adr", "adrs"])
def test_arch_06_adr_de_divida_sem_saida_do_pre_flight_falha(vs_mod, tmp_path, pasta):
    guia = "architecture/guia-arquitetura-software-design-clean-code.md"
    py = tmp_path / "pyproject.toml"
    py.write_text('[project]\nname="app"\ndependencies=["fastapi"]\n', encoding="utf-8")
    adr = tmp_path / "docs" / pasta / "0002-debito-contrato-camadas-python.md"
    adr.parent.mkdir(parents=True)
    assert _status(vs_mod, guia, "ARCH-06", tmp_path) == "skip", "sem ADR de dívida não há o que provar"
    adr.write_text("# ADR 0002: Débito\nO fluxo Router -> Service -> Repository viola a regra.\n", encoding="utf-8")
    assert _status(vs_mod, guia, "ARCH-06", tmp_path) == "fail", "prosa com seta não é saída do pre-flight"
    adr.write_text(adr.read_text(encoding="utf-8") + "-   app.auth.repository -> app.auth.router (l.3)\n", encoding="utf-8")
    assert _status(vs_mod, guia, "ARCH-06", tmp_path) == "pass"
    adr.write_text("# ADR 0002: Rejeitada\n", encoding="utf-8")
    py.write_text(py.read_text(encoding="utf-8") + '[tool.importlinter]\nroot_packages=["app"]\n', encoding="utf-8")
    assert _status(vs_mod, guia, "ARCH-06", tmp_path) == "pass", "contrato ativo encerra a dívida"


def test_zt_04_vale_para_repo_no_github_sem_pasta_github(vs_mod, tmp_path):
    root = Path(__file__).resolve().parents[3]
    h = _heuristica(vs_mod, "architecture/guia-seguranca-defensiva-zero-trust.md", "ZT-04")
    (tmp_path / "pyproject.toml").write_text('[project]\nname="app"\ndependencies=["fastapi"]\n', encoding="utf-8")
    _git(tmp_path, ["init", "-q"])
    assert not vs_mod.sh(h["when"], tmp_path, root), "sem GitHub não há Dependabot"
    _git(tmp_path, ["remote", "add", "origin", "https://github.com/org/app.git"])
    assert vs_mod.sh(h["when"], tmp_path, root) and vs_mod.sh(h["do"], tmp_path, root)
    assert vs_mod.sh(h["verify"], tmp_path, root) and not vs_mod.sh(h["when"], tmp_path, root)
    assert "package-ecosystem: pip" in (tmp_path / ".github" / "dependabot.yml").read_text(encoding="utf-8")


def test_setup_g4_por_askuserquestion_e_relatorio_sem_commit_inventado():
    root = Path(__file__).resolve().parents[3]
    skill = (root / "skills" / "setup" / "SKILL.md").read_text(encoding="utf-8")
    fase3 = skill.split("## Fase 3")[1].split("## Fase 4")[0]
    assert "AskUserQuestion" in fase3 and "Aprovar e executar" in fase3 and "mensagem seguinte" in fase3
    assert "**commitados**" not in skill, "a proibição 1 não pode exigir commit que a 9 proíbe"
    assert "git ls-files .agents/ai-guides/VERSION" in skill
    fase4 = skill.split("## Fase 4")[1].split("## Fase 5")[0]
    assert "--skip HARNESS-16" in fase4 and "nunca remova" in fase4
    fase5 = skill.split("## Fase 5")[1]
    assert "apply <slug>" in fase5 and "à mão" in fase5


def test_graph_04_preserva_hook_composto_e_informa_o_que_substituiu(vs_mod, tmp_path):
    import json
    root = Path(__file__).resolve().parents[3]
    h = _heuristica(vs_mod, "essentials/guia-graph-engineering.md", "GRAPH-04")
    s = tmp_path / ".claude" / "settings.json"
    s.parent.mkdir(parents=True)
    composto = "FILE=$(jq -r '.tool_input.file_path'); ruff format \"$FILE\" && graphify update . || true"
    s.write_text(json.dumps({"hooks": {
        "PreToolUse": [{"matcher": "Bash|Grep", "hooks": [
            {"type": "command", "command": "/Users/weles/.local/bin/graphify hook-guard search"}]}],
        "PostToolUse": [{"matcher": "Write|Edit", "hooks": [{"type": "command", "command": composto}]}]}}), encoding="utf-8")
    rx = re.search(r"--replace '([^']+)'", h["do"]).group(1)
    r = _merge_hooks(root / "templates" / "settings.claude.json", s, "--replace", rx, cwd=tmp_path)
    assert r.returncode == 0 and "substituído: /Users/weles/.local/bin/graphify hook-guard search" in r.stdout, r.stdout
    cmds = [x["command"] for es in json.loads(s.read_text(encoding="utf-8"))["hooks"].values() for e in es for x in e["hooks"]]
    assert composto in cmds, "hook do projeto que só cita graphify update não é legado do guia"
    assert vs_mod.sh(h["verify"], tmp_path, root)


def _merge_md(tmp_path, *a):
    import subprocess
    root = Path(__file__).resolve().parents[3]
    return subprocess.run([sys.executable, str(root / "templates" / "harness" / "merge_agent_md.py"), *a,
                           str(root / "templates" / "AGENTS.md.template"), str(tmp_path / "AGENTS.md")],
                          cwd=tmp_path, capture_output=True, encoding="utf-8")


def _seed_run(tmp_path, tpl_text="# T\n\n## 🎯 A\nconteúdo A\n\n## 📂 B\nconteúdo B\n"):
    import subprocess
    script = Path(__file__).resolve().parents[3] / "templates" / "harness" / "merge_agent_md.py"
    tpl = tmp_path / "AGENTS.md.template"
    tpl.write_text(tpl_text, encoding="utf-8")
    return subprocess.run([sys.executable, str(script), str(tpl), str(tmp_path / "AGENTS.md")], cwd=tmp_path,
                          capture_output=True, encoding="utf-8")


def test_merge_agent_md_semeia_agents_com_primario_secundario_e_template(tmp_path):
    (tmp_path / "CLAUDE.md").write_text("# Proj\n\n## 🎯 A\nregra do claude\n\n## Deploy\nnunca rode make prod\n", encoding="utf-8")
    (tmp_path / "GEMINI.md").write_text("# Proj\n\n## Deploy\nduplicado\n\n## Gemini Only\nregra do gemini\n", encoding="utf-8")
    r = _seed_run(tmp_path)
    assert r.stdout.strip() == "migrado de CLAUDE.md, GEMINI.md", r.stderr
    texto = (tmp_path / "AGENTS.md").read_text(encoding="utf-8")
    assert texto.startswith((tmp_path / "CLAUDE.md").read_text(encoding="utf-8")), "primário verbatim no topo"
    assert "regra do gemini" in texto and "duplicado" not in texto, "do secundário só headings novos"
    assert "conteúdo B" in texto and "conteúdo A" not in texto, "do template só seções que faltam"
    assert [l for l in texto.splitlines() if l.startswith("## ")] == ["## 🎯 A", "## Deploy", "## Gemini Only", "## 📂 B"]


def test_merge_agent_md_semeia_so_com_gemini_que_vira_primario(tmp_path):
    (tmp_path / "GEMINI.md").write_text("# G\n\n## Regras\nregra g\n", encoding="utf-8")
    assert _seed_run(tmp_path).stdout.strip() == "migrado de GEMINI.md"
    assert (tmp_path / "AGENTS.md").read_text(encoding="utf-8").startswith("# G\n\n## Regras\nregra g\n")


def test_merge_agent_md_nao_semeia_o_stub_do_claude(tmp_path):
    (tmp_path / "CLAUDE.md").write_text("@AGENTS.md\n", encoding="utf-8")
    assert _seed_run(tmp_path).stdout.strip() == "criado"
    assert "@AGENTS.md" not in (tmp_path / "AGENTS.md").read_text(encoding="utf-8")


def test_merge_agent_md_semeia_sem_copiar_a_linha_do_stub(tmp_path):
    (tmp_path / "CLAUDE.md").write_text("# P\n@AGENTS.md\n\n## X\nx\n", encoding="utf-8")
    assert _seed_run(tmp_path).stdout.strip() == "migrado de CLAUDE.md"
    linhas = (tmp_path / "AGENTS.md").read_text(encoding="utf-8").splitlines()
    assert "## X" in linhas and "@AGENTS.md" not in linhas


@pytest.mark.parametrize("makefile,esperado", [
    ("include mk/dev.mk\ntest:\n\t@true\n", None),        # alvos em outro arquivo: não dá para saber
    ("%-cov:\n\t@true\ntest:\n\t@true\n", None),          # regra de padrão: idem
    ("lint test: ## dois alvos\n\t@true\n", ["lint", "pull-memory", "push-memory", "setup-gemini-hook", "test"]),
])
def test_merge_agent_md_so_poda_quando_conhece_os_alvos(tmp_path, makefile, esperado):
    root = Path(__file__).resolve().parents[3]
    (tmp_path / "makefile").write_text(makefile, encoding="utf-8")
    assert _merge_md(tmp_path).stdout.strip() == "criado"
    feitos = sorted(l.split()[1] for l in (tmp_path / "AGENTS.md").read_text(encoding="utf-8").splitlines() if l.startswith("make "))
    todos = sorted(l.split()[1] for l in (root / "templates" / "AGENTS.md.template").read_text(encoding="utf-8").splitlines()
                   if l.startswith("make "))
    assert feitos == (esperado or todos)
    assert _merge_md(tmp_path, "--check").returncode == 0


def test_merge_agent_md_check_acusa_linha_do_projeto_igual_a_do_template(tmp_path):
    (tmp_path / "Makefile").write_text("test:\n\t@true\n", encoding="utf-8")
    assert _merge_md(tmp_path).stdout.strip() == "criado"
    _git(tmp_path, ["init", "-q"], ["add", "AGENTS.md"], GIT_COMMIT)
    alvo = tmp_path / "AGENTS.md"
    alvo.write_text("".join(l for l in alvo.read_text(encoding="utf-8").splitlines(keepends=True) if "Zero Hardcoded Secrets" not in l), encoding="utf-8")
    r = _merge_md(tmp_path, "--check")
    assert r.returncode == 1 and "linha do projeto removida" in r.stderr and "Zero Hardcoded Secrets" in r.stderr


def test_merge_agent_md_mantem_os_comandos_que_o_hn3_09_cria_depois(vs_mod, tmp_path):
    root = Path(__file__).resolve().parents[3]
    (tmp_path / "Makefile").write_text("test:\n\t@true\n", encoding="utf-8")
    assert _merge_md(tmp_path).stdout.strip() == "criado"
    feitos = {l.split()[1] for l in (tmp_path / "AGENTS.md").read_text(encoding="utf-8").splitlines() if l.startswith("make ")}
    assert {"pull-memory", "push-memory", "setup-gemini-hook"} <= feitos, feitos
    h = _heuristica(vs_mod, "ai-engineering/guia-construcao-harness.md", "HN3-09")
    assert vs_mod.sh(h["when"], tmp_path, root) and vs_mod.sh(h["do"], tmp_path, root)
    assert _merge_md(tmp_path, "--check").returncode == 0, "depois do HN3-09 nenhum comando fica sem alvo"


@pytest.mark.parametrize("linha", [
    "-   app.domain.models -> sqlalchemy (l.1, l.2)\n",
    "-   app.domain.models -> app.infra.db (l.?)\n",
])
def test_arch_06_aceita_todos_os_formatos_de_linha_do_lint_imports(vs_mod, tmp_path, linha):
    guia = "architecture/guia-arquitetura-software-design-clean-code.md"
    (tmp_path / "pyproject.toml").write_text('[project]\nname="app"\ndependencies=["fastapi"]\n', encoding="utf-8")
    adr = tmp_path / "docs" / "adr" / "0002-debito-contrato-camadas-python.md"
    adr.parent.mkdir(parents=True)
    adr.write_text("# ADR 0002: Débito\n" + linha, encoding="utf-8")
    assert _status(vs_mod, guia, "ARCH-06", tmp_path) == "pass"


def test_resil_03_aceita_tests_py_do_django_e_ignora_testdata(vs_mod, tmp_path):
    root = Path(__file__).resolve().parents[3]
    h = _heuristica(vs_mod, "architecture/guia-padroes-resiliencia-defensiva.md", "RESIL-03")
    _git(tmp_path, ["init", "-q"])
    (tmp_path / "pyproject.toml").write_text('[project]\nname="app"\ndependencies=["django"]\n', encoding="utf-8")
    (tmp_path / "app").mkdir()
    (tmp_path / "app" / "views.py").write_text("path('livez')\npath('readyz')\n", encoding="utf-8")
    (tmp_path / "testdata").mkdir()
    (tmp_path / "testdata" / "openapi.json").write_text('{"paths": {"/readyz": {}}}\n', encoding="utf-8")
    assert not vs_mod.sh(h["verify"], tmp_path, root), "golden em testdata/ não é teste"
    (tmp_path / "app" / "tests.py").write_text("def test_readyz(client):\n    client.get('/readyz')\n", encoding="utf-8")
    assert vs_mod.sh(h["verify"], tmp_path, root), "tests.py do startapp do Django é teste"


def test_resil_03_ensina_text_do_sqlalchemy_e_teste_sem_mock_do_execute(vs_mod):
    do = _heuristica(vs_mod, "architecture/guia-padroes-resiliencia-defensiva.md", "RESIL-03")["do"]
    assert 'text("SELECT 1")' in do and "mock do `execute`" in do


def test_zt_04_nao_grava_dependabot_sem_ecossistema_mapeado(vs_mod, tmp_path):
    root = Path(__file__).resolve().parents[3]
    h = _heuristica(vs_mod, "architecture/guia-seguranca-defensiva-zero-trust.md", "ZT-04")
    (tmp_path / "pubspec.yaml").write_text("name: app\n", encoding="utf-8")
    _git(tmp_path, ["init", "-q"], ["remote", "add", "origin", "https://github.com/org/app.git"])
    assert not vs_mod.sh(h["when"], tmp_path, root), "sem ecossistema, o do gravaria updates: nulo (inválido)"


def test_setup_nao_manda_hook_notification_para_o_notif_02():
    root = Path(__file__).resolve().parents[3]
    fase4 = (root / "skills" / "setup" / "SKILL.md").read_text(encoding="utf-8").split("## Fase 4")[1].split("## Fase 5")[0]
    linha = next(l for l in fase4.splitlines() if "--skip HARNESS-16" in l)
    assert "NOTIF-02" not in linha, "NOTIF-02 não reescreve hook Notification existente (merge sem --replace)"


# ---------- todo script do repositório (Linux, Windows e o macOS local) ----------

_RAIZ = Path(__file__).resolve().parents[3]


def _rastreados(*padroes):
    import subprocess
    r = subprocess.run(["git", "ls-files", *padroes], cwd=_RAIZ, capture_output=True, encoding="utf-8", check=True)
    return [_RAIZ / p for p in r.stdout.split()]


def test_todo_script_shell_do_repositorio_tem_sintaxe_valida():
    import subprocess
    ruins = []
    for p in _rastreados("*.sh"):
        shell = _BASH if "bash" in p.read_text(encoding="utf-8").splitlines()[0] else "sh"
        r = subprocess.run([shell, "-n", str(p)], capture_output=True)
        if r.returncode:
            ruins.append(f"{p.relative_to(_RAIZ)}: {r.stderr.decode('utf-8', 'replace').strip()}")
    assert not ruins, ruins


def test_shell_das_heuristicas_tem_sintaxe_valida(vs_mod):
    import subprocess
    ruins = []
    for guia in sorted(_rastreados("guides/*.md")):
        if not vs_mod.BLOCK_RE.search(guia.read_text(encoding="utf-8")):  # o guides/README.md só cita o bloco
            continue
        partes = [(f"{h['id']}.{c}", h[c]) for h in vs_mod.load_guide(guia)["heuristics"] for c in ("when", "verify", "do")
                  if h.get(c) and not h[c].lstrip().startswith("agent:")]
        # um sh por guia (minutagem); só na falha, um por trecho, para apontar o id
        lote = "".join(f"h{i}() {{\n{cod}\n}}\n" for i, (_, cod) in enumerate(partes)).encode("utf-8")
        if subprocess.run(["sh", "-n"], input=lote, capture_output=True).returncode == 0:
            continue
        for nome, cod in partes:
            r = subprocess.run(["sh", "-n", "-c", cod], capture_output=True)
            if r.returncode:
                ruins.append(f"{guia.relative_to(_RAIZ)} {nome}: {r.stderr.decode('utf-8', 'replace').strip()}")
    assert not ruins, ruins


def test_todo_script_python_compila_e_so_importa_o_que_o_so_tem():
    import ast
    import importlib.util
    ruins = []
    for p in _rastreados("*.py"):
        try:
            arvore = ast.parse(p.read_text(encoding="utf-8"), filename=str(p))
        except SyntaxError as e:
            ruins.append(f"{p.relative_to(_RAIZ)}: {e}")
            continue
        for no in arvore.body:  # só o nível do módulo: import dentro de try/if/def já trata o SO que não o tem
            mods = ([a.name for a in no.names] if isinstance(no, ast.Import)
                    else [no.module] if isinstance(no, ast.ImportFrom) and no.module and not no.level else [])
            for m in mods:
                topo = m.split(".")[0]
                if topo in sys.stdlib_module_names and importlib.util.find_spec(topo) is None:
                    ruins.append(f"{p.relative_to(_RAIZ)}: {topo} não existe neste SO")
    assert not ruins, ruins


def test_todos_os_guias_com_heuristicas_passam_no_lint(vs_mod):
    guias = [str(p) for p in _rastreados("guides/*.md") if vs_mod.BLOCK_RE.search(p.read_text(encoding="utf-8"))]
    assert len(guias) >= 24 and vs_mod.main(["--lint", *guias]) == 0


def test_todo_script_do_runtime_e_das_ferramentas_tem_teste():
    corpus = "".join(p.read_text(encoding="utf-8") for p in (_RAIZ / "skills" / "setup" / "tests").glob("*.py"))
    sem_teste = [str(p.relative_to(_RAIZ)) for p in
                 _rastreados("templates/*.sh", "templates/*.py", "skills/setup/scripts/*.py", "scripts/*", "hooks/*.py", "skills/*/*/scripts/*.py")
                 if p.name not in corpus]
    assert not sem_teste, sem_teste


@pytest.mark.parametrize("msg,ok", [
    ("feat(api): adicionar login", True), ("fix!: quebra de contrato", True), ("Merge branch 'x'", True),
    ("atualiza coisas", False), ("feat: ", False),
])
def test_commit_msg_conventional_aceita_so_conventional_commits(tmp_path, msg, ok):
    (tmp_path / "MSG").write_text(msg + "\n", encoding="utf-8")
    assert (_sh("commit-msg-conventional.sh", str(tmp_path / "MSG")).returncode == 0) is ok


@pytest.mark.parametrize("script,harness", [("sync-claude-memory.sh", ".claude"), ("sync-memory.sh", ".gemini")])
def test_sync_de_memoria_copia_so_md_sem_rsync(tmp_path, script, harness):
    import os
    import shutil
    import subprocess
    repo, home, bin_ = tmp_path / "repo", tmp_path / "home", tmp_path / "bin"
    repo.mkdir()
    bin_.mkdir()
    _git(repo, ["init", "-q"])
    (bin_ / "rsync").write_text("#!/bin/sh\necho 'rsync: command not found' >&2\nexit 127\n", encoding="utf-8")  # como no Git Bash
    (bin_ / "rsync").chmod(0o755)
    env = {**os.environ, "HOME": str(home), "PATH": f"{bin_}{os.pathsep}{os.environ['PATH']}"}
    local = repo / harness / "memory"
    (local / "sub").mkdir(parents=True)
    (local / "sub" / "nota.md").write_text("x\n", encoding="utf-8")
    (local / "rascunho.tmp").write_text("y\n", encoding="utf-8")
    roda = lambda modo: subprocess.run([_BASH, str(_RAIZ / "templates" / script), modo], cwd=repo, env=env,
                                       capture_output=True)
    r = roda("push")
    assert r.returncode == 0, r.stderr
    assert [p.name for p in home.rglob("*") if p.is_file()] == ["nota.md"]
    shutil.rmtree(local)
    r = roda("pull")
    assert r.returncode == 0 and (local / "sub" / "nota.md").read_text(encoding="utf-8") == "x\n", r.stderr


@pytest.mark.parametrize("arquivos,rc", [
    ({"VERSION": "1.2.3\n"}, 0), ({"VERSION": "1.2\n"}, 1), ({"package.json": '{"version": "2.0.0-rc.1"}'}, 0),
    ({"pyproject.toml": '[project]\nname = "a"\nversion = "0.1.0"\n'}, 0), ({"README.md": "x\n"}, 2),
])
def test_semver_check_le_a_versao_do_manifesto(tmp_path, arquivos, rc):
    import subprocess
    for nome, texto in arquivos.items():
        (tmp_path / nome).write_text(texto, encoding="utf-8")
    r = subprocess.run([sys.executable, str(_RAIZ / "templates" / "semver_check.py")], cwd=tmp_path, capture_output=True)
    assert r.returncode == rc, r.stdout + r.stderr


def test_check_toml_reprova_toml_invalido(tmp_path):
    import subprocess
    s = str(_RAIZ / "templates" / "testing" / "check_toml.py")
    (tmp_path / "ok.toml").write_text("a = 1\n", encoding="utf-8")
    (tmp_path / "ruim.toml").write_text("a = \n", encoding="utf-8")
    rc = lambda f: subprocess.run([sys.executable, s, f], cwd=tmp_path, capture_output=True).returncode
    assert (rc("ok.toml"), rc("ruim.toml"), rc("nao-existe.toml")) == (0, 1, 1)


def test_npm_dep_e_npm_script_leem_o_package_json(tmp_path):
    import subprocess
    t = _RAIZ / "templates" / "testing"
    rc = lambda s, *a: subprocess.run([sys.executable, str(t / s), *a], cwd=tmp_path, capture_output=True).returncode
    assert (rc("npm_script.py", "test"), rc("npm_dep.py", "vitest")) == (2, 2)      # sem package.json
    (tmp_path / "package.json").write_text(
        '{"scripts": {"test": "vitest", "lint": ""}, "devDependencies": {"vitest": "^2"}}', encoding="utf-8")
    assert (rc("npm_script.py", "test"), rc("npm_script.py", "lint"), rc("npm_script.py", "build")) == (0, 1, 1)
    assert (rc("npm_dep.py", "jest", "vitest"), rc("npm_dep.py", "jest")) == (0, 1)


def test_validate_domains_exige_os_tres_documentos_com_as_secoes(tmp_path):
    import shutil
    import subprocess
    s = str(_RAIZ / "templates" / "architecture" / "validate_domains.py")
    rc = lambda: subprocess.run([sys.executable, s], cwd=tmp_path, capture_output=True).returncode
    assert rc() == 1                                                   # sem docs/domains
    dom = tmp_path / "docs" / "domains" / "vendas"
    dom.mkdir(parents=True)
    for doc in ("overview.md", "business-rules.md", "tech-design.md"):
        shutil.copy(_RAIZ / "templates" / "architecture" / "domains" / doc, dom / doc)
    assert rc() == 0
    (dom / "tech-design.md").unlink()
    assert rc() == 1


def test_ferramentas_do_repositorio_rodam(tmp_path):
    import subprocess
    s = _RAIZ / "scripts"
    roda = lambda *a: subprocess.run(list(a), cwd=_RAIZ, capture_output=True)
    r = roda(sys.executable, str(s / "skills_health.py"))
    assert r.returncode == 0, r.stdout[-2000:]
    r = roda(sys.executable, str(s / "consult.py"), "testes de backend")
    assert r.returncode == 0 and r.stdout.strip(), r.stderr
    r = roda(sys.executable, str(s / "worktree_manager.py"), "list")
    assert r.returncode == 0, r.stderr
    r = roda(sys.executable, str(s / "doctor.py"))
    assert r.returncode in (0, 1) and b"Traceback" not in r.stderr, r.stderr   # 1 = falta graphify/op na máquina
    r = roda("sh", str(s / "install_skills.sh"), str(tmp_path / "dest"))
    assert r.returncode == 0 and (tmp_path / "dest" / "setup" / "scripts" / "verify_setup.py").exists(), r.stderr


_SPRING_WEB = "<dependency><artifactId>spring-boot-starter-web</artifactId></dependency>"
_PHP = '{"require": {"php": "%s", "laravel/framework": "%s"}}\n'


@pytest.mark.parametrize("arquivos,esperado", [
    pytest.param({"build.gradle": "plugins { id 'org.springframework.boot' version '3.3.0' }\n"
                                  "java { sourceCompatibility = JavaVersion.VERSION_17 }\n"
                                  "dependencies { implementation 'org.springframework.boot:spring-boot-starter-web' }\n"},
                 {"java": ["."], "backend": ["."], "api": ["."], "mobile": [], "legacy": []}, id="spring-gradle-17"),
    pytest.param({"build.gradle.kts": 'plugins { id("org.springframework.boot") version "3.3.0" }\n'
                                      "java { toolchain { languageVersion = JavaLanguageVersion.of(21) } }\n"
                                      'dependencies { implementation("org.springframework.boot:spring-boot-starter-webflux") }\n'},
                 {"java": ["."], "backend": ["."], "api": ["."], "mobile": [], "legacy": []}, id="spring-kts-21"),
    pytest.param({"pom.xml": "<project><parent><artifactId>spring-boot-starter-parent</artifactId><version>2.7.18</version></parent>\n"
                             "<packaging>war</packaging>\n<properties><java.version>1.8</java.version></properties>\n"
                             f"<dependencies>{_SPRING_WEB}</dependencies></project>\n"},
                 {"java": [], "backend": [], "api": [], "mobile": [], "legacy": ["."]}, id="maven-java-1.8"),
    pytest.param({"pom.xml": "<project><properties><maven.compiler.release>17</maven.compiler.release></properties>\n"
                             f"<dependencies>{_SPRING_WEB}</dependencies></project>\n"},
                 {"java": ["."], "backend": ["."], "api": ["."], "legacy": []}, id="maven-release-17"),
    pytest.param({"pom.xml": "<project><packaging>war</packaging>\n"
                             "<dependencies><dependency><groupId>javax.servlet</groupId></dependency></dependencies></project>\n"},
                 {"java": [], "backend": [], "legacy": ["."]}, id="maven-sem-versao"),
    pytest.param({"pom.xml": "<project><modules><module>web</module></modules>\n"
                             "<properties><java.version>17</java.version></properties></project>\n",
                  "web/pom.xml": f"<project><dependencies>{_SPRING_WEB}</dependencies></project>\n"},
                 {"java": [".", "./web"], "backend": ["./web"], "api": ["./web"], "legacy": []}, id="maven-multimodulo"),
    pytest.param({"build.xml": '<project name="gip"><target name="compile"><javac srcdir="src" source="1.6"/></target></project>\n'},
                 {"java": [], "backend": [], "legacy": ["."]}, id="ant"),
    pytest.param({"build.gradle.kts": 'plugins { id("com.android.application") version "8.5.0" apply false }\n',
                  "app/build.gradle.kts": 'plugins { id("com.android.application") }\n'
                                          "android { compileOptions { sourceCompatibility = JavaVersion.VERSION_11 } }\n"},
                 {"mobile": [".", "./app"], "java": [], "backend": [], "legacy": []}, id="android-kts"),
    pytest.param({"build.gradle": "buildscript { dependencies { classpath 'com.android.tools.build:gradle:4.2.2' } }\n",
                  "app/build.gradle": "apply plugin: 'com.android.application'\n"
                                      "android { compileOptions { sourceCompatibility JavaVersion.VERSION_1_8 } }\n"},
                 {"mobile": [".", "./app"], "java": [], "legacy": []}, id="android-antigo"),
    pytest.param({"App.xcodeproj/project.pbxproj": "// !$*UTF8*$!\n"},
                 {"mobile": ["."], "legacy": []}, id="ios-xcode"),
    pytest.param({"composer.json": _PHP % (">=5.5.9", "5.2.*")},
                 {"php": [], "backend": [], "api": [], "legacy": ["."]}, id="php-5"),
    pytest.param({"composer.json": _PHP % ("^7.4|^8.0", "^8.0")},
                 {"php": ["."], "backend": ["."], "legacy": []}, id="php-7-ou-8"),
    pytest.param({"index.php": "<?php include 'header.php';\n", "header.php": "<?php\n"},
                 {"php": [], "legacy": ["."]}, id="php-sem-composer"),
    pytest.param({"composer.json": _PHP % ("^8.2", "^12.0"), "public/index.php": "<?php\n"},
                 {"php": ["."], "backend": ["."], "api": ["."], "legacy": []}, id="laravel-12"),
    pytest.param({"Source/GSF.dpr": "program GSF;\nbegin\nend.\n", "Source/Principal.pas": "unit Principal;\n"},
                 {"legacy": ["./Source"], "backend": [], "mobile": []}, id="delphi"),
    pytest.param({"legado/pom.xml": "<project><properties><java.version>1.8</java.version></properties></project>\n",
                  "api/pyproject.toml": '[project]\nname="api"\ndependencies=["fastapi"]\n'},
                 {"legacy": ["./legado"], "backend": ["./api"], "java": [], "python": ["./api"]}, id="monorepo-misto"),
    pytest.param({"build.gradle.kts": "plugins { alias(libs.plugins.android.application) apply false }\n",
                  "app/build.gradle.kts": 'plugins { alias(libs.plugins.android.application) }\n'
                                          'android { namespace = "br.com.x"; compileOptions { sourceCompatibility = JavaVersion.VERSION_1_8 } }\n'},
                 {"mobile": [".", "./app"], "java": [], "legacy": []}, id="android-catalogo"),
    pytest.param({"composer.json": _PHP % (">=5.5.9", "5.2.*"),
                  "webroot/bower_components/jquery/package.json": '{"name": "jquery"}\n'},
                 {"node": [], "legacy": ["."]}, id="bower-no-legado"),
])
def test_detect_stack_separa_jvm_moderna_mobile_e_legado(tmp_path, arquivos, esperado):
    for nome, texto in arquivos.items():
        (tmp_path / nome).parent.mkdir(parents=True, exist_ok=True)
        (tmp_path / nome).write_text(texto, encoding="utf-8")
    for alvo, dirs in esperado.items():
        r = _sh("detect_stack.sh", alvo, "--list", cwd=tmp_path)
        assert sorted(r.stdout.split()) == dirs, (alvo, r.stdout, r.stderr)
        assert r.returncode == (0 if dirs else 1), (alvo, r.returncode)


def test_in_each_nao_roda_heuristica_moderna_em_subprojeto_legado(tmp_path):
    env = {"AI_GUIDES_RUNTIME": str(_RAIZ)}
    (tmp_path / "loja").mkdir()
    (tmp_path / "loja" / "composer.json").write_text('{"require": {"php": ">=5.5.9"}}\n', encoding="utf-8")
    (tmp_path / "api").mkdir()
    (tmp_path / "api" / "pyproject.toml").write_text('[project]\nname="api"\ndependencies=["fastapi"]\n', encoding="utf-8")
    assert _sh("in_each.sh", "--any", "php", "true", cwd=tmp_path, env=env).returncode == 1
    assert _sh("in_each.sh", "--any", "python", "true", cwd=tmp_path, env=env).returncode == 0


def test_fase_0_do_setup_lista_todos_os_alvos_do_detect_stack():
    alvos = re.search(r"^# Alvos: (.+)$", (_RAIZ / "templates" / "detect_stack.sh").read_text(encoding="utf-8"),
                      re.M).group(1).split()
    skill = (_RAIZ / "skills" / "setup" / "SKILL.md").read_text(encoding="utf-8")
    laco = re.search(r"for alvo in ([a-z ]+); do", skill).group(1).split()
    assert sorted(laco) == sorted(alvos)


def test_projeto_legado_recebe_so_os_guias_de_harness_e_graphify():
    skill = (_RAIZ / "skills" / "setup" / "SKILL.md").read_text(encoding="utf-8")
    regra = next((p for p in skill.split("\n\n") if p.startswith("**Projeto legado**")), "")
    assert "`harness-commit-memoria`, `graph-engineering` e `construcao-harness`" in regra, regra
    assert "`semver-versioning`, que o `construcao-harness` exige" in regra, regra
    assert "nenhum outro alvo de stack (`python`, `node`, `php`, `go`, `rust`, `java`, `backend`, `frontend`, `api`, `mobile`)" in regra, regra
    assert "stack legada" in regra and "`/setup --only <slug>`" in regra and "Seguir só com harness e Graphify" in regra
    for doc in ("README.md", "skills/setup/README.md"):
        assert "stack legada" in (_RAIZ / doc).read_text(encoding="utf-8"), doc


def _ruff_falso(tmp_path, corpo):
    import os
    bin_ = tmp_path / "bin"
    bin_.mkdir()
    (bin_ / "ruff").write_text("#!/bin/sh\n" + corpo, encoding="utf-8")
    (bin_ / "ruff").chmod(0o755)
    return f"{bin_}{os.pathsep}{os.environ['PATH']}"


def test_test_baseline_acusa_lint_verde_que_o_setup_deixou_vermelho(tmp_path):
    path = _ruff_falso(tmp_path, 'if grep -q extend-select pyproject.toml; then echo "Found 3 errors."; exit 1; fi\n'
                                 'echo "All checks passed!"\n')
    env = {"AI_GUIDES_RUNTIME": str(_RAIZ), "AI_GUIDES_BASELINE": str(tmp_path / "bl"), "PATH": path}
    proj = tmp_path / "proj"
    proj.mkdir()
    py = proj / "pyproject.toml"
    py.write_text('[project]\nname="app"\n[tool.ruff]\nline-length = 100\n', encoding="utf-8")
    (proj / "Makefile").write_text("lint:\n\truff check --fix .\n", encoding="utf-8")   # reescreve arquivo: o baseline não usa
    r = _sh("test_baseline.sh", "save", cwd=proj, env=env)
    assert "lint .: verde (ruff check --no-fix .)" in r.stdout and "make lint" not in r.stdout, r.stdout
    assert _sh("test_baseline.sh", "check", cwd=proj, env=env).returncode == 0
    py.write_text(py.read_text(encoding="utf-8") + '[tool.ruff.lint]\nextend-select = ["S113"]\n', encoding="utf-8")
    r = _sh("test_baseline.sh", "check", cwd=proj, env=env)
    assert r.returncode == 1 and "❌ .: ruff check --no-fix . passava antes do setup" in r.stdout, r.stdout


def test_test_baseline_nao_bloqueia_lint_que_ja_falhava_e_prefere_o_make_lint(tmp_path):
    path = _ruff_falso(tmp_path, 'n=2; grep -q extend-select pyproject.toml && n=5\necho "Found $n errors."; exit 1\n')
    env = {"AI_GUIDES_RUNTIME": str(_RAIZ), "AI_GUIDES_BASELINE": str(tmp_path / "bl"), "PATH": path}
    proj = tmp_path / "proj"
    proj.mkdir()
    py = proj / "pyproject.toml"
    py.write_text('[project]\nname="app"\n[tool.ruff]\nline-length = 100\n', encoding="utf-8")
    (proj / "Makefile").write_text("lint:\n\truff check src\n", encoding="utf-8")   # só lê: é o que o CI do projeto roda
    r = _sh("test_baseline.sh", "save", cwd=proj, env=env)
    assert "lint .: VERMELHO (make lint)" in r.stdout, r.stdout
    py.write_text(py.read_text(encoding="utf-8") + '[tool.ruff.lint]\nextend-select = ["S"]\n', encoding="utf-8")
    r = _sh("test_baseline.sh", "check", cwd=proj, env=env)
    assert r.returncode == 0 and "⚠️ .: make lint já falhava antes do setup" in r.stdout and "2 → 5" in r.stdout, r.stdout


@pytest.mark.parametrize("guia,hid,codigos", [
    ("architecture/guia-arquitetura-software-design-clean-code.md", "ARCH-02", "E722,BLE001,S110,C901"),
    ("architecture/guia-padroes-resiliencia-defensiva.md", "RESIL-02", "S113"),
    ("architecture/guia-seguranca-defensiva-zero-trust.md", "ZT-06", "S"),
])
def test_regra_do_ruff_nao_e_ligada_sobre_lint_verde_com_violacao(vs_mod, guia, hid, codigos):
    h = _heuristica(vs_mod, guia, hid)
    assert h.get("optional") is True, "sem ligar, o id fica ⚠️ com motivo, nunca ❌"
    do = " ".join(h["do"].split())
    assert f"ruff check --no-fix --select {codigos} ." in do and "`lint <dir>: verde`" in do, do
    assert "não ligue" in do and f"⚠️ {hid}: N violações pré-existentes" in do, do


def test_testb_04_catraca_abaixo_de_80_fica_aviso_e_80_passa(vs_mod, tmp_path):
    guia = "testing/backend/README.md"
    h = _heuristica(vs_mod, guia, "TESTB-04")
    assert h.get("optional") is True, "catraca abaixo de 80% é ⚠️ com motivo, não ❌"
    do = " ".join(h["do"].split())
    assert "catraca" in do and "⚠️ TESTB-04: cobertura atual X%" in do and "nunca desce" in do, do
    py = tmp_path / "pyproject.toml"
    py.write_text('[project]\nname="app"\n[tool.coverage.report]\nfail_under = 62\n', encoding="utf-8")
    assert _status(vs_mod, guia, "TESTB-04", tmp_path) == "warn"
    py.write_text(py.read_text(encoding="utf-8").replace("62", "80.0"), encoding="utf-8")
    assert _status(vs_mod, guia, "TESTB-04", tmp_path) == "pass"


def test_testf_04_usa_catraca_abaixo_de_80(vs_mod):
    do = " ".join(_heuristica(vs_mod, "testing/frontend/README.md", "TESTF-04")["do"].split())
    assert "catraca" in do and "⚠️ TESTF-04: cobertura atual X%" in do and "nunca desce" in do, do


def test_testb_06_nao_duplica_o_alvo_test_do_projeto(vs_mod, tmp_path):
    import subprocess
    h = _heuristica(vs_mod, "testing/backend/README.md", "TESTB-06")
    (tmp_path / "pyproject.toml").write_text('[project]\nname="app"\n', encoding="utf-8")
    mk = tmp_path / "Makefile"
    mk.write_text("test:\n\t@echo suite-do-projeto\n", encoding="utf-8")
    assert vs_mod.sh(h["when"], tmp_path, _RAIZ) and vs_mod.sh(h["do"], tmp_path, _RAIZ)
    assert vs_mod.sh(h["verify"], tmp_path, _RAIZ)
    assert re.findall(r"^test:", mk.read_text(encoding="utf-8"), re.M) == ["test:"], mk.read_text(encoding="utf-8")
    r = subprocess.run(["make", "-n", "test"], cwd=tmp_path, capture_output=True)
    assert b"suite-do-projeto" in r.stdout, r.stdout


def test_setup_termina_no_relatorio_sem_oferecer_commit():
    texto = (_RAIZ / "skills" / "setup" / "SKILL.md").read_text(encoding="utf-8")
    assert "deve ser **commitado**" not in texto and "commitando `.agents/ai-guides/`" not in texto
    assert "sem AskUserQuestion de próximo passo" in texto and "revisar o `git diff`" in texto
    assert "nunca como opção `(Recomendado)`" in texto


def test_versao_do_setup_e_a_mesma_no_plugin_e_no_marketplace():
    import json
    v = (_RAIZ / "skills" / "setup" / "VERSION").read_text(encoding="utf-8").strip()
    plugin = json.loads((_RAIZ / ".claude-plugin" / "plugin.json").read_text(encoding="utf-8"))["version"]
    mk = json.loads((_RAIZ / ".claude-plugin" / "marketplace.json").read_text(encoding="utf-8"))
    suite = next(p["version"] for p in mk["plugins"] if p["name"] == "ai-guides-suite")
    assert v == plugin == mk["metadata"]["version"] == suite, (v, plugin, mk["metadata"]["version"], suite)


# ---------- saída em UTF-8 também no Windows (pipe em cp1252) ----------

def test_script_python_que_imprime_acento_forca_utf8_na_saida():
    # no Windows, print para pipe usa cp1252, que não tem ✅/⚠️/→: o script quebra com UnicodeEncodeError
    sem = [str(p.relative_to(_RAIZ)) for p in _rastreados("templates/*.py", "skills/setup/scripts/*.py", "scripts/*.py",
                                                             "skills/software-engineering/forensic-adr-recovery/scripts/*.py")
           if ("print(" in (s := p.read_text(encoding="utf-8")) or "sys.stdout.write" in s)
           and any(ord(c) > 127 for c in s) and 'reconfigure(encoding="utf-8")' not in s]
    assert not sem, sem


def test_script_python_le_saida_de_subprocesso_em_utf8():
    # text=True decodifica com o locale (cp1252 no Windows): saída UTF-8 de git/sh/do vira UnicodeDecodeError
    locais = [str(p.relative_to(_RAIZ)) for p in _rastreados("templates/*.py", "skills/setup/scripts/*.py", "scripts/*.py")
              if "text=True" in p.read_text(encoding="utf-8")]
    assert not locais, locais


def test_semver_check_roda_com_saida_cp1252_como_no_windows(tmp_path):
    import os
    import subprocess
    (tmp_path / "VERSION").write_text("1.2.3\n", encoding="utf-8")
    r = subprocess.run([sys.executable, str(_RAIZ / "templates" / "semver_check.py")], cwd=tmp_path, capture_output=True,
                       env={**os.environ, "PYTHONIOENCODING": "cp1252"})
    assert r.returncode == 0 and b"Traceback" not in r.stderr, r.stderr


def test_apply_le_a_saida_do_do_em_utf8(vs_mod, tmp_path, project):
    rt = tmp_path / "rt-utf8"
    make_guide(rt, GUIDE_OK.replace('do: "mkdir -p a"', 'do: "echo ⚠️ falhou; exit 1"'))
    g = vs_mod.index_guides(rt)["piloto"]
    assert "⚠️ falhou" in vs_mod.apply(g, project, rt)[2]


def test_test_baseline_nunca_reescreve_arquivo_do_projeto_nem_com_fix_true(tmp_path):
    path = _ruff_falso(tmp_path, 'case " $* " in *" --no-fix "*) ;; *) grep -q "fix = true" pyproject.toml && : >a.py ;; esac\n'
                                 'echo "All checks passed!"\n')
    env = {"AI_GUIDES_RUNTIME": str(_RAIZ), "AI_GUIDES_BASELINE": str(tmp_path / "bl"), "PATH": path}
    proj = tmp_path / "proj"
    proj.mkdir()
    (proj / "pyproject.toml").write_text('[project]\nname="app"\n[tool.ruff]\nfix = true\n', encoding="utf-8")
    (proj / "a.py").write_text("import os\n", encoding="utf-8")
    _sh("test_baseline.sh", "save", cwd=proj, env=env)
    assert (proj / "a.py").read_text(encoding="utf-8") == "import os\n"


@pytest.mark.parametrize("receita", ["pre-commit run --all-files", "ruff check --fix . && ruff format --check ."])
def test_test_baseline_nao_usa_make_lint_que_pode_reescrever(tmp_path, receita):
    path = _ruff_falso(tmp_path, 'echo "All checks passed!"\n')
    env = {"AI_GUIDES_RUNTIME": str(_RAIZ), "AI_GUIDES_BASELINE": str(tmp_path / "bl"), "PATH": path}
    proj = tmp_path / "proj"
    proj.mkdir()
    (proj / "pyproject.toml").write_text('[project]\nname="app"\n[tool.ruff]\nline-length = 100\n', encoding="utf-8")
    (proj / "Makefile").write_text(f"lint:\n\t{receita}\n", encoding="utf-8")
    r = _sh("test_baseline.sh", "save", cwd=proj, env=env)
    assert "lint .: verde (ruff check --no-fix .)" in r.stdout and "make lint" not in r.stdout, r.stdout


def test_setup_oferece_migrar_docs_adr_para_docs_adrs(tmp_path):
    import subprocess
    texto = (_RAIZ / "skills" / "setup" / "SKILL.md").read_text(encoding="utf-8")
    f1, f3, f4, f5 = (texto.split(f"## Fase {n}")[1].split("\n## ")[0] for n in (1, 3, 4, 5))
    assert "ADRs em docs/adr/ (padrão antigo)" in f1
    assert "Migrar para `docs/adrs/` (Recomendado)" in f3 and "Manter `docs/adr/`" in f3 and "mesma chamada" in f3
    assert f4.index("git mv docs/adr docs/adrs") < f4.index("Para cada slug aprovado")
    assert "migração de ADRs" in f5
    # o comando da Fase 4 funciona sem git e com git (rename registrado)
    cmd = next(l for l in f4.splitlines() if l.startswith("git mv docs/adr docs/adrs"))
    for com_git in (False, True):
        proj = tmp_path / str(com_git)
        (proj / "docs" / "adr").mkdir(parents=True)
        (proj / "docs" / "adr" / "0001-x.md").write_text("# ADR 0001: X\n", encoding="utf-8")
        if com_git:
            _git(proj, ["init", "-q"], ["add", "."], GIT_COMMIT)
        assert subprocess.run(["sh", "-c", cmd], cwd=proj).returncode == 0
        assert (proj / "docs" / "adrs" / "0001-x.md").exists() and not (proj / "docs" / "adr").exists()
        if com_git:
            st = subprocess.run(["git", "status", "--porcelain"], cwd=proj, capture_output=True, encoding="utf-8").stdout
            assert "R  docs/adr/0001-x.md -> docs/adrs/0001-x.md" in st, st


def test_nenhuma_heuristica_verifica_claude_ou_gemini_md_exceto_a_migracao(vs_mod):
    root = Path(__file__).resolve().parents[3]
    ruins = []
    for guia in sorted((root / "guides").rglob("*.md")):
        try:
            g = vs_mod.load_guide(guia)
        except ValueError:
            continue
        for h in g["heuristics"]:
            if h["id"] == "HARNESS-06":
                continue
            for campo in ("when", "verify", "do"):
                if re.search(r"(?<![./\w])(CLAUDE|GEMINI)\.md(?!\.template)", h.get(campo, "")) and not (h["id"] == "HARNESS-05" and campo == "do"):
                    ruins.append(f"{guia.relative_to(root)} {h['id']}.{campo}")
    assert not ruins, ruins


def test_adr_08_pergunta_migracao_ate_o_projeto_escolher(vs_mod, tmp_path):
    guia = "essentials/guia-padrao-criacao-adrs.md"
    root = Path(__file__).resolve().parents[3]
    h = _heuristica(vs_mod, guia, "ADR-08")
    assert h["do"].startswith("agent:") and "AskUserQuestion" in h["do"] and "Fase 3" in h["do"]
    fase4 = (root / "skills" / "setup" / "SKILL.md").read_text(encoding="utf-8").split("## Fase 4")[1]
    mv = next(l for l in fase4.splitlines() if l.startswith("git mv docs/adr")).split("   #")[0]
    assert f"`{mv}`" in h["do"], "mesmo comando de migração do /setup"
    (tmp_path / "docs" / "adr").mkdir(parents=True)
    claude = tmp_path / "AGENTS.md"
    claude.write_text("- **Decisões Arquiteturais (ADRs):** guia-padrao-criacao-adrs\n", encoding="utf-8")
    assert _status(vs_mod, guia, "ADR-08", tmp_path) == "warn", "sem escolha: pergunta pendente"
    claude.write_text(claude.read_text(encoding="utf-8") + "- ADRs mantidas em docs/adr/ (o projeto optou por não migrar para docs/adrs/).\n",
                      encoding="utf-8")
    assert _status(vs_mod, guia, "ADR-08", tmp_path) == "pass" and not vs_mod.sh(h["when"], tmp_path, root)
    (tmp_path / "docs" / "adr").rename(tmp_path / "docs" / "adrs")
    claude.write_text("", encoding="utf-8")
    assert _status(vs_mod, guia, "ADR-08", tmp_path) == "pass", "migrado"


def _migrate(tmp_path, *a):
    import subprocess
    root = Path(__file__).resolve().parents[3]
    stub = tmp_path / "CLAUDE.md.template"
    if not stub.exists():
        stub.write_text("<!-- ai-guides: instruções em AGENTS.md -->\n@AGENTS.md\n", encoding="utf-8")
    return subprocess.run([sys.executable, str(root / "templates" / "harness" / "merge_agent_md.py"), "--migrate", *a,
                           str(stub), str(tmp_path / "AGENTS.md")], cwd=tmp_path, capture_output=True, encoding="utf-8")


def _proj_legado(tmp_path, git=True):
    (tmp_path / "CLAUDE.md").write_text("# P\n\n## Deploy\nnunca rode make prod\n", encoding="utf-8")
    (tmp_path / "GEMINI.md").write_text("# P\n\n## Implantação\nnão rode make prod\n", encoding="utf-8")
    if git:
        _git(tmp_path, ["init", "-q"], ["add", "-A"], GIT_COMMIT)


def test_migrate_recusa_sem_tocar_quando_falta_linha_do_primario_ou_heading_do_secundario(tmp_path):
    _proj_legado(tmp_path)
    (tmp_path / "AGENTS.md").write_text("# P\n\n## Deploy\n\n## Implantação\nVer seção \"Deploy\".\n", encoding="utf-8")
    r = _migrate(tmp_path)
    assert r.returncode == 1 and "nunca rode make prod" in r.stderr
    (tmp_path / "AGENTS.md").write_text("# P\n\n## Deploy\nnunca rode make prod\n", encoding="utf-8")
    r = _migrate(tmp_path)
    assert r.returncode == 1 and "## Implantação" in r.stderr
    assert (tmp_path / "GEMINI.md").exists() and "nunca rode" in (tmp_path / "CLAUDE.md").read_text(encoding="utf-8")


def test_migrate_gera_stub_remove_gemini_e_check_passa_antes_e_depois_do_commit(tmp_path):
    _proj_legado(tmp_path)
    (tmp_path / "AGENTS.md").write_text("# P\n\n## Deploy\nnunca rode make prod\n\n## Implantação\nVer seção \"Deploy\".\n", encoding="utf-8")
    assert _migrate(tmp_path, "--check").returncode == 1
    assert _migrate(tmp_path).stdout.strip() == "migrado"
    assert "@AGENTS.md" in (tmp_path / "CLAUDE.md").read_text(encoding="utf-8").splitlines()
    assert not (tmp_path / "GEMINI.md").exists()
    assert _migrate(tmp_path, "--check").returncode == 0, "antes do commit"
    _git(tmp_path, ["add", "-A"], GIT_COMMIT)
    assert _migrate(tmp_path, "--check").returncode == 0, "depois do commit"
    assert _migrate(tmp_path).stdout.strip() == "completo", "idempotente"


def test_migrate_sem_git_e_sem_arquivos_legados(tmp_path):
    _proj_legado(tmp_path, git=False)
    (tmp_path / "AGENTS.md").write_text("# P\n\n## Deploy\nnunca rode make prod\n\n## Implantação\nx\n", encoding="utf-8")
    r = _migrate(tmp_path)  # GEMINI.md fora do git: a linha sob heading já presente também é exigida
    assert r.returncode == 1 and "não rode make prod" in r.stderr and (tmp_path / "GEMINI.md").exists()
    (tmp_path / "AGENTS.md").write_text("# P\n\n## Deploy\nnunca rode make prod\n\n## Implantação\nnão rode make prod\n", encoding="utf-8")
    assert _migrate(tmp_path).stdout.strip() == "migrado" and not (tmp_path / "GEMINI.md").exists()
    assert _migrate(tmp_path, "--check").returncode == 0
    vazio = tmp_path / "novo"
    vazio.mkdir()
    (vazio / "AGENTS.md").write_text("# A\n", encoding="utf-8")
    assert _migrate(vazio).stdout.strip() == "migrado"
    assert (vazio / "CLAUDE.md").read_text(encoding="utf-8").strip().endswith("@AGENTS.md")


@pytest.mark.parametrize("git", [True, False])
def test_migrate_check_usa_claude_md_da_arvore_de_trabalho_nao_versionado(vs_mod, tmp_path, git):
    import subprocess
    root = Path(__file__).resolve().parents[3]
    merge = root / "templates" / "harness" / "merge_agent_md.py"
    subprocess.run([sys.executable, str(merge), str(root / "templates" / "AGENTS.md.template"), "AGENTS.md"],
                   cwd=tmp_path, check=True, capture_output=True)
    if git:
        _git(tmp_path, ["init", "-q"], ["add", "AGENTS.md"], GIT_COMMIT)
    (tmp_path / "CLAUDE.md").write_text("# P\n\n## Deploy\nnunca rode make prod\n", encoding="utf-8")  # não versionado
    h = _heuristica(vs_mod, "essentials/guia-completo-harness-commit-memoria.md", "HARNESS-05")
    r = _migrate(tmp_path, "--check")
    assert r.returncode == 1 and "falta no AGENTS.md: nunca rode make prod" in r.stderr
    assert vs_mod.sh(h["when"], tmp_path, root), "o gatilho do HARNESS-05 dispara"


def test_migrate_retoma_quando_claude_ja_e_o_stub_e_gemini_voltou(tmp_path):
    (tmp_path / "CLAUDE.md").write_text("<!-- ai-guides: instruções em AGENTS.md -->\n@AGENTS.md\n", encoding="utf-8")
    (tmp_path / "GEMINI.md").write_text("# P\n\n## Y\ny\n", encoding="utf-8")
    (tmp_path / "AGENTS.md").write_text("# P\n\n## X\nx\n", encoding="utf-8")
    r = _migrate(tmp_path)
    assert r.returncode == 1 and "## Y" in r.stderr and (tmp_path / "GEMINI.md").exists()
    (tmp_path / "AGENTS.md").write_text("# P\n\n## X\nx\n\n## Y\ny\n", encoding="utf-8")
    assert _migrate(tmp_path).stdout.strip() == "migrado" and not (tmp_path / "GEMINI.md").exists()
    assert _migrate(tmp_path, "--check").returncode == 0


def test_migrate_gemini_versionado_com_edicao_local_exige_o_arquivo_inteiro(tmp_path):
    _proj_legado(tmp_path)
    (tmp_path / "GEMINI.md").write_text("# P\n\n## Implantação\nnão rode make prod\nregra só local\n", encoding="utf-8")
    (tmp_path / "AGENTS.md").write_text("# P\n\n## Deploy\nnunca rode make prod\n\n## Implantação\nnão rode make prod\n", encoding="utf-8")
    r = _migrate(tmp_path)
    assert r.returncode == 1 and "regra só local" in r.stderr and (tmp_path / "GEMINI.md").exists()


def test_migrate_preserva_linhas_exclusivas_do_claude_abaixo_do_stub(tmp_path):
    (tmp_path / "CLAUDE.md").write_text("<!-- ai-guides: instruções em AGENTS.md -->\n@AGENTS.md\n- use /fast\n", encoding="utf-8")
    (tmp_path / "GEMINI.md").write_text("## Y\ny\n", encoding="utf-8")
    (tmp_path / "AGENTS.md").write_text("# A\n\n## Y\ny\n", encoding="utf-8")
    assert _migrate(tmp_path, "--check").stderr.count("falta no AGENTS.md") == 0
    assert _migrate(tmp_path).stdout.strip() == "migrado" and not (tmp_path / "GEMINI.md").exists()
    assert "- use /fast" in (tmp_path / "CLAUDE.md").read_text(encoding="utf-8")
    assert _migrate(tmp_path, "--check").returncode == 0


def test_migrate_ignora_titulo_do_legado_e_explica_agents_ausente(tmp_path):
    _proj_legado(tmp_path)
    r = _migrate(tmp_path)
    assert r.returncode == 1 and "AGENTS.md ausente (rode a HARNESS-05 antes)" in r.stderr and "falta no" not in r.stderr
    (tmp_path / "AGENTS.md").write_text("# Diretrizes\n\n## Deploy\nnunca rode make prod\n\n## Implantação\n", encoding="utf-8")
    assert "falta no AGENTS.md: # P" not in _migrate(tmp_path, "--check").stderr
    assert _migrate(tmp_path).stdout.strip() == "migrado"


def test_harness_08_aceita_settings_com_bom(tmp_path):
    import subprocess
    root = Path(__file__).resolve().parents[3]
    s = tmp_path / "settings.json"
    s.write_bytes(b"\xef\xbb\xbf" + b'{"hooks": {}, "context": {"fileName": ["AGENTS.md"]}}')
    r = subprocess.run([sys.executable, str(root / "templates" / "harness" / "gemini_context.py"), "--check", str(s),
                        str(root / "templates" / "settings.gemini.json")], capture_output=True, encoding="utf-8")
    assert r.returncode == 0, r.stderr


@pytest.mark.parametrize("inicial,esperado", [
    (None, ["AGENTS.md", "GEMINI.md"]),
    ('{"hooks": {"BeforeTool": []}, "mcpServers": {"context7": {}}}', ["AGENTS.md", "GEMINI.md"]),
    ('{"hooks": {}, "context": {"fileName": "GEMINI.md"}}', ["GEMINI.md", "AGENTS.md"]),
    ('{"hooks": {}, "context": {"fileName": ["CONTEXT.md"], "x": 1}}', ["CONTEXT.md", "AGENTS.md", "GEMINI.md"]),
    ('{"mcpServers": {"context7": {}}}', ["AGENTS.md", "GEMINI.md"]),  # sem hooks: vêm do template
    ('{"context": {"fileName": ["AGENTS.md", "GEMINI.md"]}, "mcpServers": {"context7": {}}}', ["AGENTS.md", "GEMINI.md"]),  # fileName ok, hooks faltando
])
def test_harness_08_aponta_gemini_para_agents_preservando_o_resto(vs_mod, tmp_path, inicial, esperado):
    import json
    root = Path(__file__).resolve().parents[3]
    h = _heuristica(vs_mod, "essentials/guia-completo-harness-commit-memoria.md", "HARNESS-08")
    s = tmp_path / ".gemini" / "settings.json"
    s.parent.mkdir()
    if inicial:
        s.write_text(inicial, encoding="utf-8")
    assert vs_mod.sh(h["when"], tmp_path, root) and vs_mod.sh(h["do"], tmp_path, root)
    d = json.loads(s.read_text(encoding="utf-8"))
    assert d["context"]["fileName"] == esperado and "hooks" in d
    if inicial and "mcpServers" in inicial:
        assert d["mcpServers"] == {"context7": {}}
    if inicial and '"x"' in inicial:
        assert d["context"]["x"] == 1
    assert vs_mod.sh(h["verify"], tmp_path, root) and not vs_mod.sh(h["when"], tmp_path, root)
    antes = s.read_text(encoding="utf-8")
    assert vs_mod.sh(h["do"], tmp_path, root) and s.read_text(encoding="utf-8") == antes, "idempotente"


def test_harness_05_06_migram_projeto_legado_ponta_a_ponta(vs_mod, tmp_path):
    root = Path(__file__).resolve().parents[3]
    guia = "essentials/guia-completo-harness-commit-memoria.md"
    _proj_legado(tmp_path)
    h05, h06 = (_heuristica(vs_mod, guia, i) for i in ("HARNESS-05", "HARNESS-06"))
    assert h06["depends_on"] == ["HARNESS-05"] and h05["do"].startswith("agent:")
    assert "--migrate --check" in h05["do"], "AGENTS.md pré-existente: o agente fecha o que o --migrate recusaria"
    import subprocess
    r = subprocess.run([sys.executable, str(root / "templates/harness/merge_agent_md.py"),
                        str(root / "templates/AGENTS.md.template"), "AGENTS.md"], cwd=tmp_path, capture_output=True, encoding="utf-8")
    assert r.stdout.strip() == "migrado de CLAUDE.md, GEMINI.md"
    assert vs_mod.sh(h06["when"], tmp_path, root), "ainda não enxugado"
    assert vs_mod.sh(h06["do"], tmp_path, root) and vs_mod.sh(h06["verify"], tmp_path, root)
    assert not (tmp_path / "GEMINI.md").exists()


@pytest.mark.parametrize("conteudo", ["{nao e json", "[1, 2]", '{"context": "x"}', '{"context": {"fileName": 3}}'])
def test_harness_08_settings_invalido_falha_sem_traceback_e_sem_escrever(vs_mod, tmp_path, conteudo):
    import subprocess
    root = Path(__file__).resolve().parents[3]
    s = tmp_path / "settings.json"
    s.write_text(conteudo, encoding="utf-8")
    for extra in ([], ["--check"]):
        r = subprocess.run([sys.executable, str(root / "templates/harness/gemini_context.py"), *extra, str(s),
                            str(root / "templates/settings.gemini.json")], capture_output=True, encoding="utf-8")
        assert r.returncode == 1 and "Traceback" not in r.stderr and str(s) in r.stderr, r.stderr
    assert s.read_text(encoding="utf-8") == conteudo


def test_harness_05_when_dispara_quando_claude_md_tem_conteudo_que_falta_no_agents_md(vs_mod, tmp_path):
    import subprocess
    root = Path(__file__).resolve().parents[3]
    guia = "essentials/guia-completo-harness-commit-memoria.md"
    h = _heuristica(vs_mod, guia, "HARNESS-05")
    r = subprocess.run([sys.executable, str(root / "templates/harness/merge_agent_md.py"),
                        str(root / "templates/AGENTS.md.template"), "AGENTS.md"], cwd=tmp_path, capture_output=True, encoding="utf-8")
    assert r.returncode == 0, r.stderr
    (tmp_path / "CLAUDE.md").write_text("@AGENTS.md\n", encoding="utf-8")
    assert not vs_mod.sh(h["when"], tmp_path, root) and vs_mod.sh(h["verify"], tmp_path, root)
    (tmp_path / "CLAUDE.md").write_text("# P\n\n## Deploy\nnunca rode make prod\n", encoding="utf-8")
    _git(tmp_path, ["init", "-q"], ["add", "-A"], GIT_COMMIT)  # o --check compara com HEAD
    assert vs_mod.sh(h["when"], tmp_path, root), "o HARNESS-06 recusaria para sempre sem o agente do HARNESS-05"
    assert not vs_mod.sh(h["verify"], tmp_path, root)
    with (tmp_path / "AGENTS.md").open("a", encoding="utf-8") as f:
        f.write("\n# P\n\n## Deploy\nnunca rode make prod\n")
    assert not vs_mod.sh(h["when"], tmp_path, root) and vs_mod.sh(h["verify"], tmp_path, root)


def _doctor(repo):
    import os
    import subprocess
    root = Path(__file__).resolve().parents[3]
    return subprocess.run([sys.executable, str(root / "scripts" / "doctor.py")], cwd=repo, capture_output=True,
                          encoding="utf-8", env={**os.environ, "DOCTOR_REPO_ROOT": str(repo)})


def test_doctor_checa_agents_md_stub_e_contexto_do_gemini(tmp_path):
    (tmp_path / "AGENTS.md").write_text("# A\n", encoding="utf-8")
    (tmp_path / "CLAUDE.md").write_text("@AGENTS.md\n", encoding="utf-8")
    (tmp_path / ".gemini").mkdir()
    s = tmp_path / ".gemini" / "settings.json"
    s.write_text('{"context": {"fileName": ["AGENTS.md", "GEMINI.md"]}}', encoding="utf-8")
    out = _doctor(tmp_path).stdout
    assert "AGENTS.md presente" in out and "CLAUDE.md importa @AGENTS.md" in out and "GEMINI.md presente" not in out
    assert "contextFileName" not in out
    s.write_text('{"contextFileName": "GEMINI.md"}', encoding="utf-8")
    assert "contextFileName" in _doctor(tmp_path).stdout, "settings v1: aviso de Gemini CLI antigo"


def test_doctor_tolera_settings_do_gemini_malformado(tmp_path):
    (tmp_path / ".gemini").mkdir()
    s = tmp_path / ".gemini" / "settings.json"
    for conteudo in (b"[1]", b'{"context": "x"}', b'{"context": {"fileName": 3}}', b"\xff\xfe\x00"):
        s.write_bytes(conteudo)
        r = _doctor(tmp_path)
        assert "Traceback" not in r.stderr + r.stdout and "verificações aprovadas" in r.stdout
        assert any("FALHOU" in l and "Gemini lê AGENTS.md" in l for l in r.stdout.splitlines())
    s.unlink()
    s.mkdir()  # settings.json que é diretório
    assert "Traceback" not in _doctor(tmp_path).stderr


# ---------- 2.8.1: regressões do /setup 2.8.0 no cpb-conversas-fullstack ----------

def test_verify_all_manifest_verifica_a_selecao_da_rodada_e_regrava_versao_e_respostas(vs_mod, runtime, project, monkeypatch, capsys):
    monkeypatch.setenv("AI_GUIDES_HOME", str(runtime))
    vs_mod.write_manifest(project, {"ai_guides_version": "0.0.1", "project": {"purpose": "antigo", "stack": ["x"]},
                                    "guides": {"piloto": {"status": "skipped"}}})
    (project / "a").mkdir()
    (project / "a" / "b").touch()
    assert vs_mod.main(["verify", "--all", "--manifest", "--project", str(project), "--set", "purpose=novo", "--set", "stack=a,b"]) == 0
    assert "== piloto ==" in capsys.readouterr().out, "skipped da rodada antiga não esconde o guia aplicado agora"
    m = vs_mod.read_manifest(project)
    assert m["guides"]["piloto"]["status"] == "pass" and m["ai_guides_version"] == vs_mod.own_version()
    assert m["project"] == {"purpose": "novo", "stack": ["a", "b"]}
    assert vs_mod.main(["verify", "--all", "--manifest", "--project", str(project), "--skip", "piloto"]) == 0
    assert "== piloto ==" not in capsys.readouterr().out, "--skip vale também para guia que estava pass"
    assert vs_mod.read_manifest(project)["guides"]["piloto"] == {"status": "skipped"}


def test_project_padrao_e_a_raiz_do_git_mesmo_com_cd_num_subdiretorio(vs_mod, runtime, project, monkeypatch):
    monkeypatch.setenv("AI_GUIDES_HOME", str(runtime))
    _git(project, ["init", "-q"])
    (project / "a").mkdir()
    (project / "a" / "b").touch()
    (project / "app" / "frontend").mkdir(parents=True)
    monkeypatch.chdir(project / "app" / "frontend")
    assert vs_mod.main(["verify", "piloto", "--manifest"]) == 0
    assert (project / vs_mod.MANIFEST_PATH).exists() and not (project / "app" / "frontend" / "docs").exists()
    sem_git = project.parent / "sem-git"
    sem_git.mkdir()
    monkeypatch.chdir(sem_git)
    assert vs_mod.git_root().resolve() == sem_git.resolve()


@pytest.mark.parametrize("raiz", [False, True])
def test_testf_06_so_acrescenta_alvos_que_faltam_e_roda_no_app_node(vs_mod, tmp_path, raiz):
    import subprocess
    root = Path(__file__).resolve().parents[3]
    h = _heuristica(vs_mod, "testing/frontend/README.md", "TESTF-06")
    app = tmp_path if raiz else tmp_path / "app" / "frontend"
    app.mkdir(parents=True, exist_ok=True)
    (app / "package.json").write_text('{"dependencies":{"@angular/core":"22"}}', encoding="utf-8")
    mk = tmp_path / "Makefile"
    mk.write_text("test: ## do projeto\n\tmake -C api test\n", encoding="utf-8")
    assert vs_mod.sh(h["when"], tmp_path, root) and vs_mod.sh(h["do"], tmp_path, root)
    assert vs_mod.sh(h["verify"], tmp_path, root) and not vs_mod.sh(h["when"], tmp_path, root)
    texto = mk.read_text(encoding="utf-8")
    assert texto.count("\ntest:") + texto.startswith("test:") == 1 and "make -C api test" in texto
    cd = "" if raiz else "cd ./app/frontend && "
    dry = subprocess.run(["make", "-n", "test-cov", "test-e2e"], cwd=tmp_path, capture_output=True, encoding="utf-8")
    assert dry.returncode == 0 and "warning" not in dry.stderr, dry.stderr
    assert dry.stdout.splitlines() == [f"{cd}npm run test:ci", f"{cd}npx playwright test"]


def test_testf_06_sem_makefile_com_app_em_subdiretorio_nao_copia_o_template_da_raiz(vs_mod, tmp_path):
    root = Path(__file__).resolve().parents[3]
    h = _heuristica(vs_mod, "testing/frontend/README.md", "TESTF-06")
    (tmp_path / "web").mkdir()
    (tmp_path / "web" / "package.json").write_text("{}", encoding="utf-8")
    assert vs_mod.sh(h["do"], tmp_path, root) and vs_mod.sh(h["verify"], tmp_path, root)
    assert "\tcd ./web && npm test" in (tmp_path / "Makefile").read_text(encoding="utf-8")


def test_testf_02_e_04_cobrem_o_builder_vitest_do_angular(vs_mod):
    assert "ng test --watch=false --coverage" in _heuristica(vs_mod, "testing/frontend/README.md", "TESTF-02")["do"]
    h4 = _heuristica(vs_mod, "testing/frontend/README.md", "TESTF-04")
    assert "coverageThresholds" in h4["do"] and "angular.json" in h4["verify"] and "angular.json" in h4["when"]


def test_check_e_migrate_aceitam_a_migracao_docs_adr_para_docs_adrs(tmp_path):
    (tmp_path / "CLAUDE.md").write_text("# P\n\n## ADRs\n- ADRs em `docs/adr/`\n", encoding="utf-8")
    (tmp_path / "AGENTS.md").write_text("# P\n\n## ADRs\n- ADRs em `docs/adr/`\n", encoding="utf-8")
    _git(tmp_path, ["init", "-q"], ["add", "-A"], GIT_COMMIT)
    for f in ("CLAUDE.md", "AGENTS.md"):  # Fase 4: migração de ADRs reescreve as referências vivas
        p = tmp_path / f
        p.write_text(p.read_text(encoding="utf-8").replace("docs/adr/", "docs/adrs/"), encoding="utf-8")
    assert "docs/adr" not in _merge_md(tmp_path, "--check").stderr
    assert _migrate(tmp_path).stdout.strip() == "migrado"
    r = _migrate(tmp_path, "--check")
    assert r.returncode == 0, r.stderr
    (tmp_path / "AGENTS.md").write_text("# P\n\n## ADRs\n", encoding="utf-8")
    assert "falta no AGENTS.md: - ADRs em `docs/adr/`" in _migrate(tmp_path, "--check").stderr, "perda real continua acusada"


def test_arch_04_gera_a_config_do_depcruise_sem_prompt_interativo(vs_mod):
    assert "depcruise --init oneshot" in _heuristica(vs_mod, "architecture/guia-arquitetura-software-design-clean-code.md", "ARCH-04")["do"]
