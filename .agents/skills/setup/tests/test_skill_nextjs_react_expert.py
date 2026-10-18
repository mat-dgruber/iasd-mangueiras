import os
import subprocess
import sys
from pathlib import Path

_SCRIPTS = Path(__file__).resolve().parents[2] / "design-ui-ux" / "nextjs-react-expert" / "scripts"


def test_react_performance_checker_roda_com_saida_cp1252(tmp_path):
    # pipe do Windows em cp1252: o checker tem de rodar até o fim num projeto React com acentos e emoji no código
    (tmp_path / "package.json").write_text('{"dependencies": {"react": "^19", "next": "^15"}}', encoding="utf-8")
    src = tmp_path / "src" / "app"
    src.mkdir(parents=True)
    (src / "página.tsx").write_text(
        "import { useEffect, useState } from 'react'\n"
        "export default function Página() {\n"
        "  const [d, setD] = useState(null)\n"
        "  useEffect(() => { fetch('/api/ação').then(r => r.json()).then(setD) }, [])\n"
        "  return <div>Olá 🚀 {String(d)}</div>\n}\n", encoding="utf-8")
    r = subprocess.run([sys.executable, str(_SCRIPTS / "react_performance_checker.py"), str(tmp_path)],
                       capture_output=True, encoding="utf-8", errors="replace",
                       env={**os.environ, "PYTHONIOENCODING": "cp1252"})
    assert r.returncode in (0, 1) and "Traceback" not in r.stderr, r.stdout + r.stderr
