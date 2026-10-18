#!/usr/bin/env python3
"""Testes de integridade, segurança e isolamento da suíte canônica de mods de TUI e observabilidade."""

import json
import shutil
import subprocess
from pathlib import Path
import pytest

_RAIZ = Path(__file__).resolve().parent.parent.parent.parent
_HAS_NODE = shutil.which("node") is not None


def _run_node_script(script_path: Path, stdin_text: str = "", env_extra: dict = None):
    if not _HAS_NODE:
        pytest.skip("Node.js não instalado no ambiente para testar scripts JS de mods")
    cmd = ["node", str(script_path)]
    import os
    env = os.environ.copy()
    if env_extra:
        env.update(env_extra)
    return subprocess.run(
        cmd,
        input=stdin_text,
        capture_output=True,
        text=True,
        cwd=_RAIZ,
        env=env,
        encoding="utf-8",
    )


# --- 1. Testes de Segurança de Hooks PreToolUse ---

def test_pretooluse_hooks_never_emit_approve_on_safe_or_catch():
    """Garante que comandos seguros e blocos catch NUNCA emitem 'decision: approve' nem stdout."""
    hooks_to_test = [
        _RAIZ / "mods" / "blast-radius" / "bin" / "blast-radius.js",
        _RAIZ / "mods" / "you-should-know" / "bin" / "risk-advisor.js",
        _RAIZ / "mods" / "template-starter-mod" / "bin" / "mod-hook.js",
    ]

    safe_payload = json.dumps({
        "tool_name": "Bash",
        "tool_input": {"command": "git status"},
    })

    for hook in hooks_to_test:
        assert hook.is_file(), f"Arquivo do hook não encontrado: {hook}"
        # Cenário A: comando seguro não deve produzir stdout que altere permissões
        res_safe = _run_node_script(hook, safe_payload)
        assert res_safe.returncode == 0
        assert "approve" not in res_safe.stdout, f"Hook {hook.name} emitiu approve em comando seguro!"
        assert res_safe.stdout.strip() == "", f"Hook {hook.name} deveria ter stdout vazio em comando seguro"

        # Cenário B: erro de JSON/stdin inválido (catch) deve sair silenciosamente com code 0
        res_err = _run_node_script(hook, "invalid-json-content-{{{{")
        assert res_err.returncode == 0
        assert "approve" not in res_err.stdout, f"Hook {hook.name} emitiu approve no catch!"
        assert res_err.stdout.strip() == "", f"Hook {hook.name} deveria ter stdout vazio no catch"


def test_blast_radius_asks_on_destructive_command():
    """Garante que comandos destrutivos acionam confirmação interativa com permissionDecision: ask."""
    hook = _RAIZ / "mods" / "blast-radius" / "bin" / "blast-radius.js"

    dangerous_payload = json.dumps({
        "tool_name": "Bash",
        "tool_input": {"command": "rm -rf temp_untracked_dir"},
    })

    res = _run_node_script(hook, dangerous_payload)
    assert res.returncode == 0
    assert "approve" not in res.stdout

    # Deve conter JSON com permissionDecision: ask
    data = json.loads(res.stdout.strip())
    assert "hookSpecificOutput" in data
    assert data["hookSpecificOutput"]["hookEventName"] == "PreToolUse"
    assert data["hookSpecificOutput"]["permissionDecision"] == "ask"
    assert "Blast Radius" in data.get("reason", "")


# --- 2. Testes de Sintaxe e Eventos Válidos em settings.mods.json ---

def test_settings_mods_json_has_valid_claude_code_events():
    """Valida que templates/settings.mods.json contém apenas eventos de hook válidos do Claude Code."""
    settings_file = _RAIZ / "templates" / "settings.mods.json"
    assert settings_file.is_file()

    with open(settings_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    valid_events = {
        "PreToolUse",
        "PostToolUse",
        "UserPromptSubmit",
        "Stop",
        "SubagentStart",
        "SubagentStop",
        "SessionStart",
        "SessionEnd",
        "PreCompact",
    }

    hooks_dict = data.get("hooks", {})
    assert "TurnComplete" not in hooks_dict, "'TurnComplete' não é evento válido de hook; use 'Stop'!"

    for event_name, hook_entries in hooks_dict.items():
        assert event_name in valid_events, f"Evento desconhecido no schema de hooks: {event_name}"
        for entry in hook_entries:
            for hook in entry.get("hooks", []):
                cmd = hook.get("command", "")
                if cmd.startswith("node "):
                    assert "$CLAUDE_PROJECT_DIR" in cmd or "/mods/" in cmd, (
                        f"Hook '{cmd}' deve usar $CLAUDE_PROJECT_DIR em vez de caminho relativo"
                    )


# --- 3. Teste de Opt-in: Mods Fora do Guia Essencial de Harness ---

def test_mods_isolated_from_essential_harness_guide():
    """Garante que o guia essencial de harness não inclui HARNESS-17 e que os mods são 100% opt-in."""
    harness_guide = _RAIZ / "guides" / "essentials" / "guia-completo-harness-commit-memoria.md"
    assert harness_guide.is_file()

    harness_content = harness_guide.read_text(encoding="utf-8")
    assert "HARNESS-17" not in harness_content, "HARNESS-17 não deve constar no guia essencial obrigatório!"
    assert "settings.mods.json" not in harness_content, "settings.mods.json não deve ser mesclado por padrão!"

    # O guia dedicado opcional deve existir em guides/ai-engineering/
    mods_guide = _RAIZ / "guides" / "ai-engineering" / "guia-mods-tui-observabilidade.md"
    assert mods_guide.is_file()

    mods_content = mods_guide.read_text(encoding="utf-8")
    assert "guide: mods-tui-observabilidade" in mods_content
    assert "MODS-01" in mods_content
    assert "MODS-02" in mods_content
    assert "MODS-03" in mods_content
    assert "MODS-04" in mods_content


# --- 4. Teste de Isolamento de Estado por Projeto nos Mods ---

def test_mods_state_files_use_project_hash_in_tmpdir():
    """Garante que os scripts de mods isolam estado com hash do projeto (CLAUDE_PROJECT_DIR / cwd)."""
    scripts_with_state = [
        _RAIZ / "mods" / "cache-tax" / "bin" / "cache-check.js",
        _RAIZ / "mods" / "reflect" / "bin" / "reflect.js",
        _RAIZ / "mods" / "replay-theater" / "bin" / "replay-collector.js",
        _RAIZ / "mods" / "replay-theater" / "bin" / "replay-viewer.js",
        _RAIZ / "mods" / "savvy-progress" / "bin" / "savvy-tracker.js",
        _RAIZ / "mods" / "savvy-progress" / "bin" / "savvy-panel.js",
        _RAIZ / "mods" / "template-starter-mod" / "bin" / "mod-hook.js",
        _RAIZ / "mods" / "template-starter-mod" / "bin" / "mod-status.js",
    ]

    for script in scripts_with_state:
        assert script.is_file(), f"Script não encontrado: {script}"
        content = script.read_text(encoding="utf-8")
        assert "createHash('md5')" in content, f"Script {script.name} deve usar createHash('md5') para isolar tmpdir"
        assert "CLAUDE_PROJECT_DIR" in content, f"Script {script.name} deve consultar CLAUDE_PROJECT_DIR"
