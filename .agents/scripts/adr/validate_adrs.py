#!/usr/bin/env python3
"""Valida integridade e formato das ADRs em docs/adrs (ou docs/adr legado) (fonte: guia-padrao-criacao-adrs.md §7.2). Exit 1 se houver erros."""
import os
import re
import subprocess
import sys

IGNORADOS = {"README.md", "TEMPLATE.md"}


def resolver_diretorio_adrs():  # raiz do git (ou cwd); docs/adr legado prevalece, senão docs/adrs (padrão desde a v2.7.4)
    try:
        raiz = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, encoding="utf-8").stdout.strip()
    except OSError:
        raiz = ""
    raiz = raiz or os.getcwd()
    legado = os.path.join(raiz, "docs", "adr")
    return legado if os.path.isdir(legado) else os.path.join(raiz, "docs", "adrs")


def eh_template(nome):  # template legado (ex.: template-adr.md) não é ADR e não se renomeia; ADR numerada é sempre validada
    return "template" in nome.lower() and not re.match(r"^\d{4}-", nome)


def validar_adrs():
    adr_dir = resolver_diretorio_adrs()
    erros = []
    adrs = [f for f in (os.listdir(adr_dir) if os.path.isdir(adr_dir) else []) if f.endswith(".md") and f not in IGNORADOS and not eh_template(f)]

    for adr in adrs:
        if not re.match(r"^\d{4}-[a-z0-9-]+\.md$", adr):
            erros.append(f"Nome inválido: {adr} (deve seguir 0000-kebab-case.md)")

        with open(os.path.join(adr_dir, adr), "r", encoding="utf-8") as f:
            texto = f.read()

        if "LOG DE MANUTENÇÃO" not in texto:
            erros.append(f"{adr}: Cabeçalho HTML de log de manutenção ausente.")
        if not re.search(r"^# ADR \d{4}:", texto, re.MULTILINE):
            erros.append(f"{adr}: Título principal não segue o padrão '# ADR 0000:'.")
        if "## 2. Decisão de Arquitetura" not in texto:
            erros.append(f"{adr}: Seção '## 2. Decisão de Arquitetura' ausente.")

    if erros:
        print("\n".join(erros))
        sys.exit(1)
    print("Todas as ADRs estão em conformidade!")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")  # Windows: pipe em cp1252 não tem ✅/⚠️/→ e o print quebraria
    sys.stderr.reconfigure(encoding="utf-8")
    validar_adrs()
