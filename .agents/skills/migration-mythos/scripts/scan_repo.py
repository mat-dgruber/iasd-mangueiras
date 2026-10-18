#!/usr/bin/env python3
"""
scan_repo.py — Legacy repository scanner and feature mapper.

Scans a repository for all artifacts related to a given feature name,
producing a structured JSON feature map for downstream migration tools.

Usage:
    python scan_repo.py --path <REPO_PATH> --feature "<FEATURE_NAME>" --output feature_map.json
    python scan_repo.py --path <REPO_PATH> --feature "<FEATURE_NAME>" --output feature_map.json --shallow
"""

import argparse
import ast
import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path


SUPPORTED_EXTENSIONS = {
    "python": [".py"],
    "javascript": [".js", ".mjs", ".cjs"],
    "typescript": [".ts", ".tsx"],
    "java": [".java"],
    "go": [".go"],
    "ruby": [".rb"],
    "php": [".php"],
    "csharp": [".cs"],
    "rust": [".rs"],
}

ALL_CODE_EXTENSIONS = [ext for exts in SUPPORTED_EXTENSIONS.values() for ext in exts]
TEST_PATTERNS = re.compile(r"(test|spec|__test__|_test)", re.IGNORECASE)
IGNORE_DIRS = {".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build", ".tox"}


def detect_language(repo_path: Path) -> str:
    counts = {}
    for ext_list_name, extensions in SUPPORTED_EXTENSIONS.items():
        count = sum(
            1
            for ext in extensions
            for _ in repo_path.rglob(f"*{ext}")
            if not any(p in _.parts for p in IGNORE_DIRS)
        )
        counts[ext_list_name] = count
    return max(counts, key=counts.get) if counts else "unknown"


def find_matching_files(repo_path: Path, feature_terms: list[str], shallow: bool = False) -> list[dict]:
    """Find files that mention the feature terms."""
    matches = []
    max_depth = 4 if shallow else 999

    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        depth = len(Path(root).relative_to(repo_path).parts)
        if depth > max_depth:
            continue

        for fname in files:
            fpath = Path(root) / fname
            if fpath.suffix.lower() not in ALL_CODE_EXTENSIONS:
                continue
            try:
                content = fpath.read_text(encoding="utf-8", errors="ignore")
                matched_terms = [t for t in feature_terms if t.lower() in content.lower()]
                if matched_terms:
                    is_test = bool(TEST_PATTERNS.search(fname)) or "test" in str(fpath).lower()
                    matches.append({
                        "path": str(fpath.relative_to(repo_path)),
                        "absolute_path": str(fpath),
                        "size_lines": len(content.splitlines()),
                        "is_test": is_test,
                        "matched_terms": matched_terms,
                        "language": fpath.suffix.lstrip("."),
                    })
            except (PermissionError, OSError):
                continue

    return matches


def extract_python_symbols(file_path: str) -> dict:
    """Extract classes, functions, and imports from a Python file."""
    try:
        source = Path(file_path).read_text(encoding="utf-8", errors="ignore")
        tree = ast.parse(source)
        classes = []
        functions = []
        imports = []

        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                classes.append({
                    "name": node.name,
                    "line": node.lineno,
                    "methods": [m.name for m in ast.walk(node) if isinstance(m, ast.FunctionDef)],
                })
            elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and isinstance(
                getattr(node, "parent", None), type(None)
            ):
                functions.append({"name": node.name, "line": node.lineno})
            elif isinstance(node, (ast.Import, ast.ImportFrom)):
                if isinstance(node, ast.ImportFrom):
                    imports.append(f"from {node.module} import ...")
                else:
                    for alias in node.names:
                        imports.append(f"import {alias.name}")

        return {"classes": classes, "functions": functions, "imports": list(set(imports))}
    except (SyntaxError, UnicodeDecodeError):
        return {"classes": [], "functions": [], "imports": [], "parse_error": True}


def extract_env_vars(content: str) -> list[str]:
    """Find referenced environment variables."""
    patterns = [
        r'os\.environ\.get\(["\']([A-Z_][A-Z0-9_]*)["\']',
        r'os\.environ\[["\']([A-Z_][A-Z0-9_]*)["\']',
        r'process\.env\.([A-Z_][A-Z0-9_]*)',
        r'ENV\[["\']([A-Z_][A-Z0-9_]*)["\']',
        r'getenv\(["\']([A-Z_][A-Z0-9_]*)["\']',
    ]
    found = set()
    for pattern in patterns:
        found.update(re.findall(pattern, content))
    return sorted(found)


def run_git_log(repo_path: Path, file_path: str, n: int = 5) -> list[str]:
    try:
        result = subprocess.run(
            ["git", "log", f"--oneline", f"-{n}", "--", file_path],
            cwd=repo_path,
            capture_output=True,
            encoding="utf-8",
            errors="replace",
            timeout=10,
        )
        return result.stdout.strip().splitlines() if result.returncode == 0 else []
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return []


def main():
    parser = argparse.ArgumentParser(description="Scan a legacy repository and map feature artifacts.")
    parser.add_argument("--path", required=True, help="Path to the legacy repository")
    parser.add_argument("--feature", required=True, help="Feature name or description to search for")
    parser.add_argument("--output", default="feature_map.json", help="Output JSON file path")
    parser.add_argument("--shallow", action="store_true", help="Limit scan depth (faster, less thorough)")
    args = parser.parse_args()

    repo_path = Path(args.path).resolve()
    if not repo_path.exists():
        print(f"ERROR: Repository path does not exist: {repo_path}", file=sys.stderr)
        sys.exit(1)

    feature_terms = [
        args.feature,
        args.feature.lower(),
        args.feature.replace(" ", "_"),
        args.feature.replace(" ", "-"),
        args.feature.replace("-", "_"),
        "".join(word.capitalize() for word in args.feature.split()),  # CamelCase
    ]
    feature_terms = list(dict.fromkeys(feature_terms))  # deduplicate preserving order

    print(f"🔍 Scanning {repo_path} for feature: '{args.feature}'")
    print(f"   Search terms: {feature_terms}")

    language = detect_language(repo_path)
    print(f"   Detected primary language: {language}")

    matched_files = find_matching_files(repo_path, feature_terms, shallow=args.shallow)
    print(f"   Found {len(matched_files)} matching files")

    artifacts = []
    all_env_vars = set()

    for file_info in matched_files:
        content = Path(file_info["absolute_path"]).read_text(encoding="utf-8", errors="ignore")
        env_vars = extract_env_vars(content)
        all_env_vars.update(env_vars)

        symbols = {}
        if file_info["language"] == "py":
            symbols = extract_python_symbols(file_info["absolute_path"])

        recent_commits = run_git_log(repo_path, file_info["path"])

        artifacts.append({
            **file_info,
            "symbols": symbols,
            "env_vars": env_vars,
            "recent_commits": recent_commits,
        })

    artifacts.sort(key=lambda x: (x["is_test"], -len(x["matched_terms"])))

    feature_map = {
        "scan_metadata": {
            "scanned_at": datetime.utcnow().isoformat() + "Z",
            "repo_path": str(repo_path),
            "feature_name": args.feature,
            "search_terms": feature_terms,
            "shallow_scan": args.shallow,
            "primary_language": language,
        },
        "summary": {
            "total_files_matched": len(artifacts),
            "core_files": len([a for a in artifacts if not a["is_test"]]),
            "test_files": len([a for a in artifacts if a["is_test"]]),
            "env_vars_referenced": sorted(all_env_vars),
        },
        "artifacts": artifacts,
    }

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(feature_map, indent=2), encoding="utf-8")

    print(f"\n✅ Feature map written to: {output_path}")
    print(f"   Core files: {feature_map['summary']['core_files']}")
    print(f"   Test files: {feature_map['summary']['test_files']}")
    if all_env_vars:
        print(f"   Env vars found: {', '.join(sorted(all_env_vars))}")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")  # Windows: pipe em cp1252 não tem ✅/⚠️/→ e o print quebraria
    sys.stderr.reconfigure(encoding="utf-8")
    main()
