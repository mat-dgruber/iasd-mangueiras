import json
import os
import subprocess
import sys
from pathlib import Path

_SCRIPTS = Path(__file__).resolve().parents[2] / "migration" / "migration-mythos" / "scripts"


def _run(script, *args, cwd):
    # pipe do Windows em cp1252: os scripts imprimem ✅/🔍/⚠️/→ e quebravam com UnicodeEncodeError
    r = subprocess.run([sys.executable, str(_SCRIPTS / script), *map(str, args)], cwd=cwd, capture_output=True,
                       encoding="utf-8", errors="replace", env={**os.environ, "PYTHONIOENCODING": "cp1252"})
    assert "Traceback" not in r.stderr, f"{script}: {r.stderr}"
    return r


def test_pipeline_de_migracao_roda_com_saida_cp1252(tmp_path):
    legado = tmp_path / "legado"
    for versao, extra in (("v1", ""), ("v2", "    return total * 0.9  # desconto 🚀\n")):
        (legado / versao / "billing").mkdir(parents=True)
        (legado / versao / "billing" / "fatura.py").write_text(
            "import os\nTAXA = os.environ.get('TAXA_SERVIÇO')\n\n"
            "def calcular_fatura(total):\n    \"\"\"Calcula a fatura — ação crítica.\"\"\"\n" + (extra or "    return total\n"),
            encoding="utf-8")
    subprocess.run(["git", "init", "-q"], cwd=legado, check=True)
    subprocess.run(["git", "add", "."], cwd=legado, check=True)
    subprocess.run(["git", "-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "fatura: versão inicial ✨"],
                   cwd=legado, check=True)
    ws, alvo = tmp_path / "ws", tmp_path / "alvo"
    alvo.mkdir()

    r = _run("scan_repo.py", "--path", legado / "v2", "--feature", "fatura", "--output", ws / "feature_map.json", cwd=tmp_path)
    assert r.returncode == 0 and "Feature map written" in r.stdout, r.stdout
    mapa = json.loads((ws / "feature_map.json").read_text(encoding="utf-8"))
    assert mapa["artifacts"][0]["recent_commits"][0].endswith("fatura: versão inicial ✨"), "git log lido em UTF-8"

    assert _run("extract_feature.py", "--legacy-path", legado / "v2", "--feature-map", ws / "feature_map.json",
                "--output-dir", ws, cwd=tmp_path).returncode == 0
    assert _run("migration_plan.py", "--workspace", ws, "--target", alvo, "--output", ws / "plan.json",
                cwd=tmp_path).returncode == 0
    assert _run("validate_migration.py", "--workspace", ws, "--target", alvo, "--feature", "fatura",
                "--mode", "structural", cwd=tmp_path).returncode in (0, 1)
    assert _run("validate_migration.py", "--workspace", ws, "--target", alvo, "--feature", "fatura",
                "--mode", "tests", cwd=tmp_path).returncode in (0, 1), "roda o runner do alvo e lê a saída em UTF-8"

    r = _run("diff_versions.py", "--root", legado, "--feature", "fatura", "--output", ws / "diff.json", cwd=tmp_path)
    assert r.returncode == 0 and "v1 → v2" in r.stdout, r.stdout
