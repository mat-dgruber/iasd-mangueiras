#!/usr/bin/env python3
"""
validate_migration.py — Post-migration validation suite.

Runs structural, dependency, and security checks on migrated artifacts.
Produces a validation report consumed by migration-validator sub-agent.

Usage:
    python validate_migration.py \
        --workspace ./migration_workspace/ \
        --target <TARGET_PATH> \
        --feature <FEATURE_NAME>
    python validate_migration.py ... --mode structural
    python validate_migration.py ... --mode security
"""

import argparse
import json
import re
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path


LEGACY_IMPORT_PATTERNS = [
    r"from legacy[\._]",
    r"import legacy[\._]",
    r"require\(['\"]legacy",
    r"legacy\.jar",
    r"/legacy/",
    r"legacy-app\.",
    r"OldSystem",
    r"LegacyModule",
]

SECRET_PATTERNS = [
    (r"(?i)(password|passwd|pwd)\s*=\s*['\"][^'\"]{4,}['\"]", "HARDCODED PASSWORD"),
    (r"(?i)(api_key|apikey|api-key)\s*=\s*['\"][A-Za-z0-9_\-]{10,}['\"]", "HARDCODED API KEY"),
    (r"(?i)(secret|token)\s*=\s*['\"][A-Za-z0-9_\-]{10,}['\"]", "HARDCODED SECRET/TOKEN"),
    (r"-----BEGIN (RSA|EC|DSA|OPENSSH) PRIVATE KEY-----", "PRIVATE KEY"),
    (r"(?i)aws_access_key_id\s*=\s*[A-Z0-9]{20}", "AWS ACCESS KEY"),
    (r"(?i)bearer\s+[A-Za-z0-9_\-\.]{20,}", "BEARER TOKEN"),
]

DEBUG_PATTERNS = [
    r"\bprint\s*\(",
    r"\bconsole\.log\s*\(",
    r"\bdebugger\b",
    r"\bputs\s+",
    r"\bvar_dump\s*\(",
    r"\bdd\s*\(",
    r"\bdump\s*\(",
]

TODO_PATTERNS = [
    r"#\s*TODO:\s*migrate",
    r"#\s*FIXME",
    r"#\s*HACK:\s*legacy",
    r"//\s*TODO:\s*migrate",
    r"//\s*FIXME",
    r"/\*\s*TODO:\s*migrate",
]

CODE_EXTENSIONS = {".py", ".js", ".ts", ".java", ".go", ".rb", ".php", ".cs", ".rs"}


def check_files_exist(workspace: Path, target: Path, feature_map: dict = None) -> dict:
    """Category A: Structural completeness check."""
    issues = []
    extracted_dir = workspace / "extracted"
    to_rewrite_dir = workspace / "to_rewrite"

    for d in [extracted_dir, to_rewrite_dir]:
        if not d.exists():
            issues.append(f"Missing directory: {d}")

    extracted_files = list(extracted_dir.glob("**/*")) if extracted_dir.exists() else []
    rewrite_files = list(to_rewrite_dir.glob("**/*")) if to_rewrite_dir.exists() else []
    total = len([f for f in extracted_files + rewrite_files if f.is_file()])

    empty_files = []
    for f in extracted_files + rewrite_files:
        if f.is_file() and f.stat().st_size == 0:
            empty_files.append(str(f))

    if empty_files:
        issues.append(f"Empty files found: {empty_files}")

    return {
        "status": "PASS" if not issues else "FAIL",
        "issues": issues,
        "files_in_workspace": total,
    }


def check_code_quality(workspace: Path) -> dict:
    """Category B: Code quality check."""
    issues = []
    warnings = []

    for code_file in workspace.rglob("*"):
        if code_file.suffix not in CODE_EXTENSIONS or not code_file.is_file():
            continue
        content = code_file.read_text(encoding="utf-8", errors="ignore")
        rel = code_file.relative_to(workspace)

        for pattern in DEBUG_PATTERNS:
            matches = re.findall(pattern, content)
            if matches:
                warnings.append(f"{rel}: debug statement found ({pattern.strip()})")

        for pattern in TODO_PATTERNS:
            if re.search(pattern, content, re.IGNORECASE):
                warnings.append(f"{rel}: unresolved TODO/FIXME found")
                break

    return {
        "status": "PASS" if not issues else ("WARN" if warnings else "FAIL"),
        "issues": issues,
        "warnings": warnings,
    }


def check_dependency_integrity(workspace: Path) -> dict:
    """Category C: No legacy imports remain."""
    issues = []

    for code_file in workspace.rglob("*"):
        if code_file.suffix not in CODE_EXTENSIONS or not code_file.is_file():
            continue
        content = code_file.read_text(encoding="utf-8", errors="ignore")
        rel = code_file.relative_to(workspace)

        for pattern in LEGACY_IMPORT_PATTERNS:
            matches = re.findall(pattern, content)
            if matches:
                issues.append(f"{rel}: legacy import found — '{matches[0]}'")

    return {
        "status": "PASS" if not issues else "FAIL",
        "issues": issues,
    }


def check_security(workspace: Path) -> dict:
    """Category D: Secret and security scanning."""
    issues = []

    for code_file in workspace.rglob("*"):
        if not code_file.is_file():
            continue
        try:
            content = code_file.read_text(encoding="utf-8", errors="ignore")
        except (PermissionError, OSError):
            continue
        rel = code_file.relative_to(workspace)

        for pattern, label in SECRET_PATTERNS:
            if re.search(pattern, content):
                issues.append(f"🔴 SECURITY: {rel} — {label} detected")

    return {
        "status": "PASS" if not issues else "FAIL",
        "issues": issues,
    }


def check_tests_exist(target: Path, feature_name: str) -> dict:
    """Category E: Tests exist for migrated feature."""
    issues = []
    warnings = []

    test_dirs = list(target.glob("**/test*")) + list(target.glob("**/spec*"))
    if not test_dirs:
        warnings.append("No test directory found in target repo")
        return {"status": "WARN", "issues": issues, "warnings": warnings}

    feature_terms = [feature_name, feature_name.replace("_", "-"), feature_name.replace("_", "")]
    test_files = []
    for test_dir in test_dirs:
        for f in test_dir.rglob("*"):
            if f.is_file() and f.suffix in CODE_EXTENSIONS:
                content = f.read_text(encoding="utf-8", errors="ignore")
                if any(t in content.lower() for t in feature_terms):
                    test_files.append(str(f.relative_to(target)))

    if not test_files:
        issues.append(f"No test files found referencing '{feature_name}' in target repo")

    return {
        "status": "PASS" if not issues else "FAIL",
        "issues": issues,
        "test_files_found": test_files,
    }


def run_tests(target: Path) -> dict:
    """Category F: Run test suite and check for regressions."""
    test_commands = [
        (["python", "-m", "pytest", "--tb=short", "-q"], "pytest"),
        ([shutil.which("npm") or "npm", "test", "--", "--passWithNoTests"], "npm test"),  # Windows: npm.cmd
        (["./gradlew", "test"], "gradle"),
        (["mvn", "test", "-q"], "maven"),
        (["go", "test", "./..."], "go test"),
        (["bundle", "exec", "rspec", "--format", "progress"], "rspec"),
    ]

    for cmd, label in test_commands:
        try:
            result = subprocess.run(
                cmd, cwd=target, capture_output=True, encoding="utf-8", errors="replace", timeout=120
            )
            return {
                "status": "PASS" if result.returncode == 0 else "FAIL",
                "runner": label,
                "exit_code": result.returncode,
                "output_tail": (result.stdout + result.stderr)[-2000:],
            }
        except (FileNotFoundError, subprocess.TimeoutExpired):
            continue

    return {
        "status": "SKIP",
        "reason": "No supported test runner found or tests timed out",
    }


def generate_report(results: dict, feature_name: str) -> str:
    """Generate human-readable validation report."""
    overall_statuses = [r.get("status", "SKIP") for r in results.values()]
    if "FAIL" in overall_statuses:
        overall = "❌ FAILED"
    elif "WARN" in overall_statuses:
        overall = "⚠️  PASSED WITH WARNINGS"
    else:
        overall = "✅ PASSED"

    lines = [
        f"## Migration Validation Report: {feature_name}",
        f"",
        f"**Validation Date:** {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
        f"**Overall Status:** {overall}",
        f"",
        f"### Summary",
        f"| Category | Status | Issues |",
        f"|----------|--------|--------|",
    ]

    category_labels = {
        "structural": "A: Structural Completeness",
        "quality": "B: Code Quality",
        "dependencies": "C: Dependency Integrity",
        "security": "D: Security",
        "tests_exist": "E: Test Existence",
        "test_run": "F: Test Execution",
    }

    for key, label in category_labels.items():
        r = results.get(key, {})
        status_icon = {"PASS": "✅", "FAIL": "❌", "WARN": "⚠️", "SKIP": "⏭️"}.get(r.get("status", "SKIP"), "❓")
        issue_count = len(r.get("issues", [])) + len(r.get("warnings", []))
        lines.append(f"| {label} | {status_icon} {r.get('status', 'SKIP')} | {issue_count} |")

    lines.append("")
    lines.append("### Blocking Issues")
    has_blocking = False
    for key, r in results.items():
        for issue in r.get("issues", []):
            has_blocking = True
            lines.append(f"- ❌ **[{key.upper()}]** {issue}")
    if not has_blocking:
        lines.append("- None")

    lines.append("")
    lines.append("### Warnings")
    has_warnings = False
    for key, r in results.items():
        for warn in r.get("warnings", []):
            has_warnings = True
            lines.append(f"- ⚠️ **[{key.upper()}]** {warn}")
    if not has_warnings:
        lines.append("- None")

    test_run = results.get("test_run", {})
    if test_run.get("output_tail"):
        lines.append("")
        lines.append("### Test Output (tail)")
        lines.append("```")
        lines.append(test_run["output_tail"])
        lines.append("```")

    rec = "APPROVE" if "FAIL" not in overall_statuses else "REQUEST CHANGES"
    lines.append("")
    lines.append(f"### Recommendation: **{rec}**")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Run post-migration validation suite.")
    parser.add_argument("--workspace", required=True, help="Migration workspace directory")
    parser.add_argument("--target", required=True, help="Target repository path")
    parser.add_argument("--feature", default="unknown_feature", help="Feature name")
    parser.add_argument("--mode", default="full", choices=["full", "structural", "security", "tests"],
                        help="Validation mode")
    args = parser.parse_args()

    workspace = Path(args.workspace)
    target = Path(args.target)

    if not workspace.exists():
        print(f"ERROR: Workspace not found: {workspace}", file=sys.stderr)
        sys.exit(1)

    results = {}

    if args.mode in ("full", "structural"):
        results["structural"] = check_files_exist(workspace, target)
        print(f"A: Structural — {results['structural']['status']}")

    if args.mode in ("full",):
        results["quality"] = check_code_quality(workspace)
        print(f"B: Quality — {results['quality']['status']}")

        results["dependencies"] = check_dependency_integrity(workspace)
        print(f"C: Dependencies — {results['dependencies']['status']}")

    if args.mode in ("full", "security"):
        results["security"] = check_security(workspace)
        print(f"D: Security — {results['security']['status']}")

    if args.mode in ("full", "tests"):
        results["tests_exist"] = check_tests_exist(target, args.feature)
        print(f"E: Tests exist — {results['tests_exist']['status']}")

        results["test_run"] = run_tests(target)
        print(f"F: Test run — {results['test_run']['status']}")

    report = generate_report(results, args.feature)
    report_path = workspace / f"validation_report_{args.feature}.md"
    report_path.write_text(report, encoding="utf-8")

    results_path = workspace / "validation_results.json"
    results_path.write_text(json.dumps(results, indent=2), encoding="utf-8")

    print(f"\n✅ Validation report: {report_path}")
    has_failures = any(r.get("status") == "FAIL" for r in results.values())
    sys.exit(1 if has_failures else 0)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")  # Windows: pipe em cp1252 não tem ✅/⚠️/→ e o print quebraria
    sys.stderr.reconfigure(encoding="utf-8")
    main()
