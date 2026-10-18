#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["pyyaml>=6"]
# ///
"""AI Guides — verify_setup: lint, plano, aplicação, verificação, manifesto e runtime das heurísticas dos guias.

`apply` executa os `do` shell (nunca os `agent:`) e prova cada um com o `verify` da heurística; os demais
comandos só leem. Rode com `uv run verify_setup.py …` (resolve o pyyaml) ou `python3 verify_setup.py …`
com pyyaml instalado.
"""
from __future__ import annotations

import argparse
import datetime as dt
import io
import json
import os
import re
import shutil
import subprocess
import sys
import tarfile
import urllib.error
import urllib.request
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("pyyaml ausente: use `uv run verify_setup.py …` ou `pip install pyyaml`.")

REPO = "Casa-Publicadora-Brasileira/ai-guides"
SKILL_DIR = Path(__file__).resolve().parent.parent  # skills/setup/
RUNTIME_DIRNAME = Path(".agents/ai-guides")
MANIFEST_PATH = Path("docs/ai/setup-manifest.yaml")
BLOCK_RE = re.compile(r"^```yaml heuristics[ \t]*\n(.*?)^```[ \t]*$", re.M | re.S)
ID_RE = re.compile(r"^[A-Z][A-Z0-9]*-\d{2,}$")
REQUIRED_FIELDS = ("id", "title", "when", "do", "verify")
ICON = {"pass": "✅", "fail": "❌", "warn": "⚠️", "skip": "⏭️", "adiado": "⏸️"}


# ---------- parsing & lint ----------

def extract_block(text: str) -> str:
    blocks = BLOCK_RE.findall(text)
    if len(blocks) != 1:
        raise ValueError(f"esperado exatamente 1 bloco ```yaml heuristics, encontrado {len(blocks)}")
    return blocks[0]


def load_guide(path: Path) -> dict:
    data = yaml.safe_load(extract_block(path.read_text(encoding="utf-8")))
    if not isinstance(data, dict):
        raise ValueError("bloco heuristics não é um mapeamento YAML")
    data["path"] = path
    return data


def topo(nodes: dict[str, list[str]]) -> list[str]:
    """Ordem estável por dependências. ValueError em ciclo ou dependência desconhecida."""
    unknown = {d for deps in nodes.values() for d in deps} - nodes.keys()
    if unknown:
        raise ValueError(f"dependências desconhecidas: {sorted(unknown)}")
    order: list[str] = []
    done: set[str] = set()
    while len(order) < len(nodes):  # ponytail: O(n²), n < 100 heurísticas por guia
        ready = [n for n in nodes if n not in done and set(nodes[n]) <= done]
        if not ready:
            raise ValueError("ciclo de dependências detectado")
        order.append(ready[0])
        done.add(ready[0])
    return order


def lint(guide: dict) -> list[str]:
    errs: list[str] = []
    slug = guide.get("guide")
    if not isinstance(slug, str) or not re.fullmatch(r"[a-z0-9-]+", slug):
        errs.append("campo 'guide' deve ser slug kebab-case")
    if not isinstance(guide.get("version"), int):
        errs.append("campo 'version' deve ser inteiro")
    if not isinstance(guide.get("requires", []), list):
        errs.append("campo 'requires' deve ser lista")
    hs = guide.get("heuristics")
    if not isinstance(hs, list) or not hs:
        return errs + ["campo 'heuristics' deve ser lista não vazia"]
    ids: list[str] = []
    for i, h in enumerate(hs):
        if not isinstance(h, dict):
            errs.append(f"#{i}: heurística deve ser mapeamento")
            continue
        tag = str(h.get("id", f"#{i}"))
        for f in REQUIRED_FIELDS:
            if not isinstance(h.get(f), str) or not h[f].strip():
                errs.append(f"{tag}: campo '{f}' obrigatório (string não vazia)")
        hid = h.get("id")
        if isinstance(hid, str):
            if not ID_RE.match(hid):
                errs.append(f"{tag}: id fora do padrão PREFIXO-NN")
            if hid in ids:
                errs.append(f"{tag}: id duplicado")
            ids.append(hid)
        do = h.get("do", "")
        if isinstance(do, str) and "agent:" in do and not do.lstrip().startswith("agent:"):
            errs.append(f"{tag}: 'do' misto — ou shell ou começa com 'agent:'")
        if not isinstance(h.get("depends_on", []), list):
            errs.append(f"{tag}: 'depends_on' deve ser lista")
        if not isinstance(h.get("optional", False), bool):
            errs.append(f"{tag}: 'optional' deve ser booleano")
    prefixes = {i.split("-")[0] for i in ids}
    if len(prefixes) > 1:
        errs.append(f"prefixos de id divergentes no mesmo guia: {sorted(prefixes)}")
    if not errs:
        try:
            topo({h["id"]: list(h.get("depends_on", [])) for h in hs})
        except ValueError as e:
            errs.append(f"depends_on: {e}")
    return errs


# ---------- runtime & índice ----------

def resolve_runtime(project: Path) -> tuple[Path | None, str]:
    """(caminho, origem) com origem em env | projeto | plugin | ausente.

    `plugin` é apenas FONTE para `fetch`: o runtime de trabalho tem de estar materializado
    (e commitado) em `.agents/ai-guides/` do projeto, senão CI e colegas não verificam nada.
    """
    for value, origin in ((os.environ.get("AI_GUIDES_HOME"), "env"), (project / RUNTIME_DIRNAME, "projeto"),
                          (os.environ.get("CLAUDE_PLUGIN_ROOT"), "plugin")):
        if value and (Path(value) / "guides").is_dir():
            return Path(value).resolve(), origin
    return None, "ausente"


def find_runtime(project: Path, allow_plugin: bool = False) -> Path:
    runtime, origin = resolve_runtime(project)
    if runtime and (origin != "plugin" or allow_plugin):
        return runtime
    if origin == "plugin":
        raise RuntimeError(
            f"runtime encontrado apenas no plugin ({runtime}) — isso NÃO serve para trabalhar no projeto: "
            f"os guias precisam estar materializados em {RUNTIME_DIRNAME}/ do projeto. "
            "Rode PRIMEIRO: verify_setup.py fetch"
        )
    raise RuntimeError(
        "runtime ai-guides não encontrado (AI_GUIDES_HOME, .agents/ai-guides ou CLAUDE_PLUGIN_ROOT). "
        "Rode: verify_setup.py fetch"
    )


def index_guides(runtime: Path) -> dict[str, dict]:
    idx: dict[str, dict] = {}
    for md in sorted((runtime / "guides").rglob("*.md")):
        if not BLOCK_RE.search(md.read_text(encoding="utf-8")):
            continue
        g = load_guide(md)
        slug = g["guide"]
        if slug in idx:
            raise ValueError(f"slug duplicado '{slug}': {idx[slug]['path']} e {md}")
        idx[slug] = g
    return idx


def ordered_heuristics(guide: dict) -> list[dict]:
    by_id = {h["id"]: h for h in guide["heuristics"]}
    return [by_id[i] for i in topo({h["id"]: list(h.get("depends_on", [])) for h in guide["heuristics"]})]


def ordered_guides(idx: dict[str, dict], slugs: list[str]) -> list[str]:
    return [s for s in topo({s: list(g.get("requires", [])) for s, g in idx.items()}) if s in slugs]


# ---------- execução (when/verify sempre; do shell só no apply) ----------

def sh(cmd: str, project: Path, runtime: Path) -> bool:
    env = {**os.environ, "AI_GUIDES_RUNTIME": str(runtime)}
    try:
        return subprocess.run(["sh", "-c", cmd], cwd=project, env=env, capture_output=True, timeout=60).returncode == 0
    except subprocess.TimeoutExpired:
        return False


def plan(guide: dict, project: Path, runtime: Path) -> list[dict]:
    return [h for h in ordered_heuristics(guide) if sh(h["when"], project, runtime)]


def verify(guide: dict, project: Path, runtime: Path) -> dict[str, str]:
    results: dict[str, str] = {}
    for h in ordered_heuristics(guide):
        if sh(h["verify"], project, runtime):
            results[h["id"]] = "pass"
        elif not sh(h["when"], project, runtime):
            results[h["id"]] = "skip"
        else:
            results[h["id"]] = "warn" if h.get("optional") else "fail"
    return results


DO_TIMEOUT = 900  # ponytail: teto fixo; `graphify extract` num monorepo grande é o `do` mais lento conhecido


def apply(guide: dict, project: Path, runtime: Path, skip=()) -> tuple[dict[str, str], list[dict], str]:
    """Executa, na ordem, os `do` shell cujo `when` ainda vale e prova cada um com o `verify`.

    Retorna (status por id, heurísticas `agent:` pendentes, saída do `do` que falhou). O `when` é reavaliado a
    cada passo (um `do` anterior pode satisfazê-lo); `do` que depende de um `agent:` pendente, direta ou
    indiretamente, fica `adiado`; o primeiro `fail` interrompe o guia. stdin fechado: `do` que pergunta falha
    em vez de travar. Id em `skip` (instalação recusada pelo usuário) não roda e também adia os dependentes.
    """
    results: dict[str, str] = {}
    pendentes: list[dict] = []
    bloqueados: set[str] = set()
    env = {**os.environ, "AI_GUIDES_RUNTIME": str(runtime)}
    for h in ordered_heuristics(guide):
        if not sh(h["when"], project, runtime):
            continue
        if h["id"] in skip:
            results[h["id"]] = "skip"
            bloqueados.add(h["id"])
            continue
        if h["do"].lstrip().startswith("agent:"):
            pendentes.append(h)
            bloqueados.add(h["id"])
            continue
        if bloqueados & set(h.get("depends_on", [])):
            results[h["id"]] = "adiado"
            bloqueados.add(h["id"])
            continue
        try:
            r = subprocess.run(["sh", "-c", h["do"]], cwd=project, env=env, stdin=subprocess.DEVNULL,
                               capture_output=True, encoding="utf-8", errors="replace", timeout=DO_TIMEOUT)
            saida = (r.stdout + r.stderr).strip()
        except subprocess.TimeoutExpired:
            saida = f"timeout: o do passou de {DO_TIMEOUT}s"
        if sh(h["verify"], project, runtime):
            results[h["id"]] = "pass"
        elif h.get("optional"):
            results[h["id"]] = "warn"
        else:
            results[h["id"]] = "fail"
            return results, pendentes, saida[-4000:]
    return results, pendentes, ""


def guide_status(results: dict[str, str]) -> str:
    vals = set(results.values())
    if "fail" not in vals:
        return "pass"
    return "partial" if "pass" in vals else "fail"


# ---------- manifesto ----------

def read_manifest(project: Path) -> dict:
    p = project / MANIFEST_PATH
    return (yaml.safe_load(p.read_text(encoding="utf-8")) or {}) if p.exists() else {}


def write_manifest(project: Path, data: dict) -> None:
    p = project / MANIFEST_PATH
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(yaml.safe_dump(data, allow_unicode=True, sort_keys=False), encoding="utf-8")


def own_version() -> str:
    v = SKILL_DIR / "VERSION"
    return v.read_text(encoding="utf-8").strip() if v.exists() else "0.0.0"


def update_manifest(project: Path, guide: dict | None, results: dict[str, str], sets: dict[str, str], skips: list[str]) -> dict:
    m = read_manifest(project)
    m["ai_guides_version"] = own_version()  # o manifesto descreve a última rodada, não a primeira
    proj = m.setdefault("project", {})
    for k, v in sets.items():
        proj[k] = v.split(",") if k in ("stack", "priorities") else v
    guides = m.setdefault("guides", {})
    if guide is not None:
        guides[guide["guide"]] = {
            "version": guide["version"],
            "applied_at": dt.datetime.now().replace(microsecond=0).isoformat(),
            "status": guide_status(results),
            "heuristics": dict(results),
        }
    for s in skips:
        guides[s] = {"status": "skipped"}
    write_manifest(project, m)
    return m


# ---------- fetch ----------

def github_token() -> str | None:
    tok = os.environ.get("GITHUB_TOKEN")
    if tok:
        return tok
    try:
        return subprocess.run(["gh", "auth", "token"], capture_output=True, encoding="utf-8", errors="replace", timeout=10).stdout.strip() or None
    except (OSError, subprocess.TimeoutExpired):
        return None


def _github(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "ai-guides-setup"})
    tok = github_token()
    if tok:
        req.add_header("Authorization", f"Bearer {tok}")
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def download_tarball(ref: str) -> bytes:
    return _github(f"https://api.github.com/repos/{REPO}/tarball/{ref}")


def latest_tag() -> str:
    return json.loads(_github(f"https://api.github.com/repos/{REPO}/releases/latest"))["tag_name"]


def extract_runtime(tar_bytes: bytes, dest: Path) -> None:
    dest_resolved = dest.resolve()
    with tarfile.open(fileobj=io.BytesIO(tar_bytes), mode="r:gz") as tar:
        for m in tar.getmembers():
            parts = Path(m.name).parts[1:]  # remove <org>-<repo>-<sha>/
            if parts and parts[0] in ("guides", "templates", "mods") and m.isfile():
                target = dest.joinpath(*parts)
                if not target.resolve().is_relative_to(dest_resolved):
                    continue
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(tar.extractfile(m).read())  # type: ignore[union-attr]
                if (parts[0] == "templates" and m.name.endswith(".sh")) or (
                    parts[0] == "mods" and ("/bin/" in m.name or m.name.endswith(".sh"))
                ):
                    target.chmod(0o755)


def local_source() -> Path | None:
    """Fonte de cópia do runtime: env, plugin, ou o próprio pacote onde esta skill vive.

    O último candidato garante que instalar por plugin/clone nunca dependa de rede nem de
    CLAUDE_PLUGIN_ROOT estar exportado — `skills/setup/scripts/` vive ao lado de `guides/`.
    """
    for c in (os.environ.get("AI_GUIDES_HOME"), os.environ.get("CLAUDE_PLUGIN_ROOT"), SKILL_DIR.parent.parent):
        if c and (Path(c) / "guides").is_dir():
            return Path(c)
    return None


def fetch(project: Path, ref: str | None, update: bool) -> Path:
    dest = project / RUNTIME_DIRNAME
    version = own_version()
    explicit_ref = ref or os.environ.get("AI_GUIDES_REF")
    local = local_source()
    if local and not update and not explicit_ref:
        if dest.exists():
            shutil.rmtree(dest)
        for sub in ("guides", "templates", "mods"):
            src = local / sub
            if src.is_dir():
                shutil.copytree(src, dest / sub, ignore=shutil.ignore_patterns("__pycache__", ".DS_Store"))
        (dest / "VERSION").write_text(version + "\n", encoding="utf-8")
        print(f"runtime copiado de {local} → {dest}")
        return dest
    ref = explicit_ref or (latest_tag() if update else f"v{version}")
    fallback_ref = "main"
    try:
        data = download_tarball(ref)
    except urllib.error.HTTPError as e:
        if e.code != 404 or ref == fallback_ref:
            raise
        print(f"⚠️ ref {ref} não existe no GitHub; usando {fallback_ref}", file=sys.stderr)
        ref = fallback_ref
        data = download_tarball(ref)
    if dest.exists():
        shutil.rmtree(dest)
    extract_runtime(data, dest)
    (dest / "VERSION").write_text(f"{version} ({ref})\n", encoding="utf-8")
    print(f"runtime baixado ({ref}) → {dest}")
    return dest


# ---------- CLI ----------

def _print_table(slug: str, guide: dict, results: dict[str, str]) -> None:
    titles = {h["id"]: h["title"] for h in guide["heuristics"]}
    print(f"\n== {slug} ==")
    for hid, st in results.items():
        print(f"{ICON[st]} {hid:<12} {titles[hid]}")


def cmd_lint(paths: list[str]) -> int:
    rc = 0
    for p in paths:
        try:
            errs = lint(load_guide(Path(p)))
        except (ValueError, yaml.YAMLError) as e:
            errs = [str(e)]
        print(f"{'✅' if not errs else '❌'} {p}")
        for e in errs:
            print(f"   ↳ {e}")
        rc |= bool(errs)
    return rc


def cmd_list(project: Path) -> int:
    runtime = find_runtime(project)
    idx = index_guides(runtime)
    print(f"AI_GUIDES_RUNTIME={runtime}")
    for slug in ordered_guides(idx, list(idx)):
        g = idx[slug]
        print(f"{slug:<40} v{g['version']:<3} requires={g.get('requires', [])} {g['path'].relative_to(runtime)}")
    return 0


def cmd_plan(slug: str, project: Path) -> int:
    runtime = find_runtime(project)
    g = index_guides(runtime)[slug]
    print(f"AI_GUIDES_RUNTIME={runtime}\nGUIDE={g['path']}")
    todo = plan(g, project, runtime)
    if not todo:
        print("nada a aplicar")
    for h in todo:
        print(f"\n[{h['id']}] {h['title']}\nDO:\n{h['do'].rstrip()}")
    return 0


def cmd_apply(slug: str, project: Path, skip: list[str]) -> int:
    runtime = find_runtime(project)
    g = index_guides(runtime)[slug]
    print(f"AI_GUIDES_RUNTIME={runtime}\nGUIDE={g['path']}")
    results, pendentes, saida = apply(g, project, runtime, skip)
    titles = {h["id"]: h["title"] for h in g["heuristics"]}
    for hid, st in results.items():
        print(f"{ICON[st]} {hid:<12} {titles[hid]}")
    if saida:
        print(f"\n--- saída do do que falhou ---\n{saida}")
    for h in pendentes:
        print(f"\n[{h['id']}] {h['title']}\nAGENT (faça com as ferramentas de edição):\n{h['do'].rstrip()}")
    if "adiado" in results.values():
        print("\n⏸️ = depende de um AGENT acima (rode `apply` de novo depois dele) ou de um id pulado com --skip.")
    if not results and not pendentes:
        print("nada a aplicar")
    return 1 if "fail" in results.values() else 0


def cmd_verify(slugs: list[str], all_: bool, project: Path, manifest: bool, sets: dict[str, str], skips: list[str]) -> int:
    runtime = find_runtime(project)
    idx = index_guides(runtime)
    if all_:
        m = read_manifest(project).get("guides", {})
        # --manifest (Fase 5) ou sem manifesto: a seleção desta rodada (índice menos os --skip); senão, o que o
        # manifesto diz aplicado — o skipped de uma rodada antiga não pode esconder um guia aplicado agora
        slugs = [s for s in idx if s not in skips and (manifest or not m or s in m and m[s].get("status") != "skipped")]
    total: dict[str, int] = {"fail": 0, "warn": 0, "pass": 0}
    for slug in ordered_guides(idx, slugs):
        results = verify(idx[slug], project, runtime)
        _print_table(slug, idx[slug], results)
        for st in results.values():
            total[st] = total.get(st, 0) + 1
        if manifest:
            update_manifest(project, idx[slug], results, sets, [])
    if manifest and skips:
        update_manifest(project, None, {}, sets, skips)
    if total["fail"]:
        veredito = "NÃO declare sucesso: corrija os ❌"
    elif total["warn"]:
        veredito = (f"sem ❌, mas {total['warn']} ⚠️ não é pronto: faça o AGENT de cada ⚠️ (`plan <slug>` mostra o "
                    "texto sem executar nada) ou justifique cada um no relatório (ex.: instalação recusada)")
    else:
        veredito = "sem ❌"
    print(f"\nRESULTADO: {total['fail']} ❌ · {total['warn']} ⚠️ · {total['pass']} ✅ — {veredito}")
    return 1 if total["fail"] else 0


def git_root() -> Path:
    """Raiz do repositório git do cwd; sem git, o próprio cwd. Um `cd` que sobrou no shell do agente não pode
    mudar o projeto (nem materializar outro runtime num subdiretório)."""
    try:
        r = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, encoding="utf-8", errors="replace")
    except OSError:
        return Path(".")
    return Path(r.stdout.strip()) if r.returncode == 0 and r.stdout.strip() else Path(".")


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--lint", nargs="+", metavar="GUIDE.md", help="valida o bloco de heurísticas dos guias")
    sub = ap.add_subparsers(dest="cmd")
    for name in ("list", "where", "plan", "apply", "verify", "fetch"):
        sp = sub.add_parser(name)
        sp.add_argument("--project", type=Path, help="raiz do projeto (padrão: raiz do git do cwd, senão o cwd)")
        if name in ("plan", "apply"):
            sp.add_argument("slug")
        if name == "apply":
            sp.add_argument("--skip", action="append", default=[], metavar="ID", help="id recusado pelo usuário (instalação)")
        if name == "verify":
            sp.add_argument("slugs", nargs="*")
            sp.add_argument("--all", action="store_true")
            sp.add_argument("--manifest", action="store_true")
            sp.add_argument("--set", action="append", default=[], metavar="K=V")
            sp.add_argument("--skip", action="append", default=[], metavar="SLUG")
        if name == "fetch":
            sp.add_argument("--ref", default=os.environ.get("AI_GUIDES_REF"), help="branch, tag ou commit SHA (padrão: AI_GUIDES_REF ou v<VERSION>)")
            sp.add_argument("--update", action="store_true")
    a = ap.parse_args(argv)
    if getattr(a, "project", None) is None and a.cmd:
        a.project = git_root()
    try:
        if a.lint:
            return cmd_lint(a.lint)
        if a.cmd == "list":
            return cmd_list(a.project)
        if a.cmd == "where":
            runtime, origin = resolve_runtime(a.project)
            print(f"{runtime or '-'}\norigem={origin}")
            if origin == "plugin":
                print(f"❌ runtime ausente em {RUNTIME_DIRNAME}/ — rode `verify_setup.py fetch` antes de "
                      "plan/apply/verify/list", file=sys.stderr)
                return 3
            return 0 if runtime else 1
        if a.cmd == "plan":
            return cmd_plan(a.slug, a.project)
        if a.cmd == "apply":
            return cmd_apply(a.slug, a.project, a.skip)
        if a.cmd == "verify":
            if not a.slugs and not a.all:
                ap.error("informe slugs ou --all")
            return cmd_verify(a.slugs, a.all, a.project, a.manifest, dict(s.split("=", 1) for s in a.set), a.skip)
        if a.cmd == "fetch":
            fetch(a.project, a.ref, a.update)
            return 0
        ap.print_help()
        return 2
    except (RuntimeError, ValueError, KeyError, urllib.error.URLError) as e:
        print(f"❌ {e}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")  # Windows: pipe em cp1252 não tem ✅/⚠️/→ e o print quebraria
    sys.stderr.reconfigure(encoding="utf-8")
    sys.exit(main())
