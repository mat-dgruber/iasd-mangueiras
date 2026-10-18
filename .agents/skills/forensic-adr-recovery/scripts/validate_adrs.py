#!/usr/bin/env python3
"""
Linter de conformidade arquitetural para ADRs.
Valida:
1. Padrão estrito de nomenclatura: docs/adrs/ (ou docs/adr/ legado) [0001-9999]-[kebab-case].md
2. Sequenciamento cronológico ininterrupto sem lacunas numéricas.
3. Presença obrigatória do cabeçalho HTML 'LOG DE MANUTENÇÃO DE DOCUMENTAÇÃO'.
4. Presença das seções canônicas mínimas e tabela de metadados.
Compatível com qualquer CI/CD (GitHub Actions, GitLab CI, CloudBuild, Azure Pipelines).
"""

import os
import re
import subprocess
import sys
from pathlib import Path


def resolver_diretorio_adrs() -> Path:
    """Diretório de ADRs na raiz do git (ou cwd): docs/adr legado prevalece; senão docs/adrs (padrão canônico)."""
    try:
        raiz = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, encoding="utf-8").stdout.strip()
    except OSError:
        raiz = ""
    base = Path(raiz) if raiz else Path.cwd()
    legado = base / "docs" / "adr"
    return legado if legado.is_dir() else base / "docs" / "adrs"


def validar_conformidade_adrs(diretorio_adrs: Path = None):
    adr_dir = diretorio_adrs or resolver_diretorio_adrs()

    if not adr_dir.exists():
        print(f"❌ Diretório de ADRs {adr_dir} não existe.")
        sys.exit(1)

    arquivos = [f for f in adr_dir.glob("*.md") if f.name != "README.md" and not ("template" in f.name.lower() and not re.match(r"^\d{4}-", f.name))]

    if not arquivos:
        print("ℹ️ Nenhuma ADR encontrada para validar no diretório.")
        sys.exit(0)

    erros = []
    numeros_encontrados = []

    for arq in sorted(arquivos):
        nome = arq.name

        # 1. Validação de Nomenclatura (4 dígitos + kebab-case)
        match_nome = re.match(r"^(\d{4})-([a-z0-9-]+)\.md$", nome)
        if not match_nome:
            erros.append(
                f"[{nome}] Nomenclatura inválida. Deve seguir o padrão '0000-kebab-case.md' em minúsculas e sem caracteres especiais."
            )
            continue

        numero = int(match_nome.group(1))
        numeros_encontrados.append(numero)

        conteudo = arq.read_text(encoding="utf-8")

        # 2. Cabeçalho HTML de Log de Manutenção
        if "LOG DE MANUTENÇÃO DE DOCUMENTAÇÃO" not in conteudo:
            erros.append(f"[{nome}] Cabeçalho HTML 'LOG DE MANUTENÇÃO DE DOCUMENTAÇÃO' ausente no topo.")

        # 3. Título Canônico (# ADR 0000:)
        if not re.search(r"^# ADR \d{4}:", conteudo, re.MULTILINE):
            erros.append(f"[{nome}] Título principal não segue o padrão '# ADR {match_nome.group(1)}: [Título]'.")

        # 4. Tabela de Metadados
        if not re.search(r"\*{0,2}status\*{0,2}\s*[:|]", conteudo, re.IGNORECASE) or not re.search(r"\*{0,2}decisores\*{0,2}\s*[:|]", conteudo, re.IGNORECASE):
            erros.append(f"[{nome}] Tabela de metadados incompleta (Status e Decisores são obrigatórios).")

        # 5. Seção Decisão de Arquitetura
        if "## 2. Decisão de Arquitetura" not in conteudo:
            erros.append(f"[{nome}] Seção obrigatória '## 2. Decisão de Arquitetura' ausente.")

    # 6. Validação de Sequenciamento Numérico Ininterrupto
    if numeros_encontrados:
        numeros_ordenados = sorted(numeros_encontrados)
        primeiro = numeros_ordenados[0]
        ultimo = numeros_ordenados[-1]
        esperados = list(range(primeiro, ultimo + 1))
        faltantes = set(esperados) - set(numeros_ordenados)

        if faltantes:
            formatados = [f"{n:04d}" for n in sorted(faltantes)]
            erros.append(f"Lacuna na numeração sequencial de ADRs! Números faltantes: {formatados}")

    if erros:
        print("\n❌ Foram encontradas inconformidades no repositório de ADRs:")
        for e in erros:
            print(f"  - {e}")
        sys.exit(1)

    print(f"✅ Todas as {len(arquivos)} ADRs estão em estrita conformidade com o padrão canônico!")
    sys.exit(0)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")  # Windows: pipe em cp1252 não tem ✅/⚠️/→ e o print quebraria
    sys.stderr.reconfigure(encoding="utf-8")
    if len(sys.argv) > 1 and sys.argv[1] in ("--help", "-h"):
        print("Uso: python3 validate_adrs.py [caminho_para_o_diretorio_de_adrs]")
        sys.exit(0)
    caminho = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    validar_conformidade_adrs(caminho)
