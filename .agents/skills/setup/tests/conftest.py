import sys
import textwrap
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
import verify_setup as vs  # noqa: E402

GUIDE_OK = """\
guide: piloto
version: 1
requires: []
heuristics:
  - id: PIL-01
    title: pasta a existe
    when: "! test -d a"
    do: "mkdir -p a"
    verify: "test -d a"
  - id: PIL-02
    title: arquivo b dentro de a
    when: "! test -f a/b"
    do: "touch a/b"
    verify: "test -f a/b"
    depends_on: [PIL-01]
  - id: PIL-03
    title: só para projetos node
    when: "test -f package.json && ! test -f .nvmrc"
    do: "echo 20 > .nvmrc"
    verify: "test -f .nvmrc"
    optional: true
"""


def make_guide(root: Path, body: str = GUIDE_OK, rel: str = "guides/x/piloto.md") -> Path:
    p = root / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(f"# Guia\n\n## ⚙️ Heurísticas Executáveis\n\n```yaml heuristics\n{textwrap.dedent(body)}```\n\n## 📚 Fundamentos\nprosa\n", encoding="utf-8")
    return p


@pytest.fixture
def runtime(tmp_path: Path) -> Path:
    rt = tmp_path / "rt"
    make_guide(rt)
    (rt / "templates").mkdir()
    (rt / "VERSION").write_text("9.9.9\n", encoding="utf-8")
    return rt


@pytest.fixture
def project(tmp_path: Path) -> Path:
    p = tmp_path / "proj"
    p.mkdir()
    return p


@pytest.fixture
def vs_mod():
    return vs


@pytest.fixture(autouse=True)
def clean_ai_guides_env(monkeypatch):
    monkeypatch.delenv("AI_GUIDES_REF", raising=False)
