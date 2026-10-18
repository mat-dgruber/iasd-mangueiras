#!/usr/bin/env python3
"""
extract_feature.py — Feature artifact extractor for migration workspace.

Reads a feature_map.json produced by scan_repo.py and extracts artifacts
into a structured migration workspace with classification and extraction notes.

Usage:
    python extract_feature.py \
        --legacy-path <LEGACY_PATH> \
        --feature-map feature_map.json \
        --output-dir ./migration_workspace/ \
        --strategy auto
"""

import argparse
import json
import os
import re
import shutil
import sys
from datetime import datetime
from pathlib import Path


FRAMEWORK_COUPLING_PATTERNS = {
    "django": [r"from django", r"models\.Model", r"views\.View", r"request\."],
    "flask": [r"from flask", r"@app\.route", r"g\.", r"current_app"],
    "spring": [r"@Controller", r"@Service", r"@Repository", r"@Component", r"@Autowired"],
    "rails": [r"ApplicationController", r"ActiveRecord", r"before_action"],
    "express": [r"app\.get\(", r"app\.post\(", r"req\.", r"res\."],
    "delphi": [r"TForm", r"TDataModule", r"TDataSet", r"OnClick", r"BeforePost"],
}


def classify_artifact(file_path: str, content: str, language: str) -> str:
    """
    Classify how a file should be handled during migration.
    Returns: COPY_ADAPT | REWRITE | REPLACE | BRIDGE
    """
    coupling_score = 0
    for framework, patterns in FRAMEWORK_COUPLING_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, content):
                coupling_score += 1

    is_pure_logic = coupling_score == 0
    is_test = bool(re.search(r"(test|spec|__test__|_test)", Path(file_path).name, re.IGNORECASE))
    is_config = Path(file_path).suffix in {".json", ".yaml", ".yml", ".toml", ".ini", ".env", ".cfg"}
    is_ui = bool(re.search(r"\.(html|htm|jsx|tsx|vue|erb|haml|dfm|fmx)$", file_path, re.IGNORECASE))

    if is_config:
        return "REPLACE"
    if is_ui:
        return "BRIDGE"
    if is_test:
        return "REWRITE"
    if is_pure_logic:
        return "COPY_ADAPT"
    if coupling_score >= 3:
        return "REWRITE"
    return "COPY_ADAPT"


def generate_extraction_notes(file_path: str, content: str, strategy: str, feature_map: dict) -> str:
    """Generate migration notes for a specific artifact."""
    lines = content.splitlines()
    notes = [
        f"# Migration Notes: {Path(file_path).name}",
        f"# Strategy: {strategy}",
        f"# Original path: {file_path}",
        f"# Extracted at: {datetime.utcnow().isoformat()}Z",
        "#",
    ]

    if strategy == "REWRITE":
        notes += [
            "# ACTION REQUIRED: This file needs to be rewritten for the target framework.",
            "# Preserve the BUSINESS LOGIC, not the implementation.",
            "# Key behaviors to preserve (verify against business_rules.md):",
            "#   - [TODO: fill from business_rules.md]",
            "#",
        ]
    elif strategy == "COPY_ADAPT":
        notes += [
            "# ACTION REQUIRED: Adapt imports and naming conventions to target repo.",
            "# Business logic can be ported with minimal changes.",
            "#",
        ]
    elif strategy == "BRIDGE":
        notes += [
            "# ACTION REQUIRED: This UI/framework file needs an adapter/wrapper.",
            "# Extract pure logic first, then create adapter.",
            "#",
        ]
    elif strategy == "REPLACE":
        notes += [
            "# ACTION REQUIRED: Replace with target-repo equivalent configuration.",
            "# Do not copy this file directly.",
            "#",
        ]

    env_vars = re.findall(r'(?:os\.environ|process\.env|ENV)\[?["\']([A-Z_][A-Z0-9_]*)["\']', content)
    if env_vars:
        notes.append(f"# ENV VARS to migrate: {', '.join(set(env_vars))}")

    return "\n".join(notes) + "\n\n"


def main():
    parser = argparse.ArgumentParser(description="Extract feature artifacts into a migration workspace.")
    parser.add_argument("--legacy-path", required=True, help="Path to legacy repository")
    parser.add_argument("--feature-map", required=True, help="Path to feature_map.json")
    parser.add_argument("--output-dir", default="./migration_workspace", help="Output directory")
    parser.add_argument("--strategy", default="auto", choices=["auto", "copy", "rewrite"],
                        help="Override classification strategy")
    args = parser.parse_args()

    legacy_path = Path(args.legacy_path).resolve()
    feature_map_path = Path(args.feature_map)
    output_dir = Path(args.output_dir)

    if not feature_map_path.exists():
        print(f"ERROR: feature_map.json not found: {feature_map_path}", file=sys.stderr)
        sys.exit(1)

    feature_map = json.loads(feature_map_path.read_text(encoding="utf-8"))
    artifacts = feature_map.get("artifacts", [])

    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "extracted").mkdir(exist_ok=True)
    (output_dir / "to_rewrite").mkdir(exist_ok=True)

    extraction_manifest = {
        "extracted_at": datetime.utcnow().isoformat() + "Z",
        "feature": feature_map.get("scan_metadata", {}).get("feature_name", "unknown"),
        "legacy_path": str(legacy_path),
        "total_artifacts": len(artifacts),
        "by_strategy": {"COPY_ADAPT": [], "REWRITE": [], "REPLACE": [], "BRIDGE": []},
        "adapters_needed": [],
        "env_vars_to_migrate": set(),
    }

    for artifact in artifacts:
        file_path = artifact.get("path", "")
        abs_path = Path(artifact.get("absolute_path", legacy_path / file_path))

        try:
            content = abs_path.read_text(encoding="utf-8", errors="ignore")
        except (PermissionError, FileNotFoundError, OSError):
            continue

        strategy = classify_artifact(file_path, content, artifact.get("language", ""))
        if args.strategy != "auto":
            strategy = "COPY_ADAPT" if args.strategy == "copy" else "REWRITE"

        extraction_manifest["by_strategy"][strategy].append(file_path)

        env_vars = re.findall(r'(?:os\.environ|process\.env|ENV)\[?["\']([A-Z_][A-Z0-9_]*)["\']', content)
        extraction_manifest["env_vars_to_migrate"].update(env_vars)

        if strategy == "BRIDGE":
            extraction_manifest["adapters_needed"].append({
                "file": file_path,
                "reason": "Framework-coupled UI/adapter layer",
                "contract": "[TODO: define interface from business_rules.md]",
            })

        dest_subdir = "extracted" if strategy in ("COPY_ADAPT", "REPLACE") else "to_rewrite"
        dest_path = output_dir / dest_subdir / Path(file_path).name
        dest_path.parent.mkdir(parents=True, exist_ok=True)

        notes = generate_extraction_notes(file_path, content, strategy, feature_map)
        dest_path.write_text(notes + content, encoding="utf-8")

    extraction_manifest["env_vars_to_migrate"] = sorted(extraction_manifest["env_vars_to_migrate"])

    (output_dir / "extraction_manifest.json").write_text(
        json.dumps(extraction_manifest, indent=2), encoding="utf-8"
    )

    adapters_path = output_dir / "adapters_needed.md"
    adapters_content = "# Adapters / Bridges Required\n\n"
    for adapter in extraction_manifest["adapters_needed"]:
        adapters_content += f"## {adapter['file']}\n- **Reason:** {adapter['reason']}\n- **Contract:** {adapter['contract']}\n\n"
    adapters_path.write_text(adapters_content, encoding="utf-8")

    print(f"\n✅ Extraction complete → {output_dir}")
    for strategy, files in extraction_manifest["by_strategy"].items():
        if files:
            print(f"   {strategy}: {len(files)} files")
    if extraction_manifest["env_vars_to_migrate"]:
        print(f"   ENV vars to migrate: {', '.join(extraction_manifest['env_vars_to_migrate'])}")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")  # Windows: pipe em cp1252 não tem ✅/⚠️/→ e o print quebraria
    sys.stderr.reconfigure(encoding="utf-8")
    main()
