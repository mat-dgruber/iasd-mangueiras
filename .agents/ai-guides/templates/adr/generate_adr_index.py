#!/usr/bin/env python3
"""Gera README.md no diretório de ADRs (docs/adrs, ou docs/adr legado) consolidando todas as ADRs (fonte: guia-padrao-criacao-adrs.md §7.1)."""
import os
import re
import subprocess
import sys


def resolver_diretorio_adrs():  # raiz do git (ou cwd); docs/adr legado prevalece, senão docs/adrs (padrão desde a v2.7.4)
    try:
        raiz = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, encoding="utf-8").stdout.strip()
    except OSError:
        raiz = ""
    raiz = raiz or os.getcwd()
    legado = os.path.join(raiz, "docs", "adr")
    return legado if os.path.isdir(legado) else os.path.join(raiz, "docs", "adrs")


def gerar_indice_adrs():
    adr_dir = resolver_diretorio_adrs()
    readme_path = os.path.join(adr_dir, "README.md")
    arquivos = sorted([f for f in os.listdir(adr_dir) if re.match(r"^\d{4}-.*\.md$", f)])

    linhas = [
        "# 📚 Repositório de Architecture Decision Records (ADRs)",
        "",
        "> Índice gerado automaticamente com o status consolidado das decisões arquiteturais.",
        "",
        "| ADR | Título | Status | Data |",
        "| :---: | :--- | :---: | :---: |",
    ]

    for arq in arquivos:
        caminho = os.path.join(adr_dir, arq)
        with open(caminho, "r", encoding="utf-8") as f:
            conteudo = f.read()

        num = arq.split("-")[0]
        titulo_match = re.search(r"^# ADR \d{4}:\s*(.+)$", conteudo, re.MULTILINE)
        status_match = re.search(r"\*\*Status\*\*\s*\|\s*\*\*([^*]+)\*\*\s*\(([^)]+)\)", conteudo)

        titulo = titulo_match.group(1) if titulo_match else arq
        status = status_match.group(1) if status_match else "Desconhecido"
        data = status_match.group(2) if status_match else "-"

        linhas.append(f"| [{num}]({arq}) | **{titulo}** | `{status}` | {data} |")

    with open(readme_path, "w", encoding="utf-8") as f:
        f.write("\n".join(linhas) + "\n")
    print(f"Índice {readme_path} atualizado com sucesso!")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")  # Windows: pipe em cp1252 não tem ✅/⚠️/→ e o print quebraria
    sys.stderr.reconfigure(encoding="utf-8")
    gerar_indice_adrs()
