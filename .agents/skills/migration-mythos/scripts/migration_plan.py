#!/usr/bin/env python3
"""
migration_plan.py — Structured migration plan generator.

Reads the extraction_manifest.json and produces a structured migration plan
in JSON and Markdown format for use by migration-architect and the main agent.

Usage:
    python migration_plan.py \
        --workspace ./migration_workspace/ \
        --target <TARGET_PATH> \
        --output migration_plan.json
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path


COMPLEXITY_MATRIX = {
    (0, 5): "LOW",
    (6, 20): "MEDIUM",
    (21, 999): "HIGH",
}


def estimate_complexity(manifest: dict) -> str:
    total = manifest.get("total_artifacts", 0)
    has_bridge = len(manifest.get("adapters_needed", [])) > 0
    has_env_vars = len(manifest.get("env_vars_to_migrate", [])) > 0

    for (low, high), level in COMPLEXITY_MATRIX.items():
        if low <= total <= high:
            base = level
            break
    else:
        base = "HIGH"

    if base == "LOW" and (has_bridge or has_env_vars):
        return "MEDIUM"
    return base


def generate_plan_skeleton(manifest: dict, target_path: str, feature_name: str) -> dict:
    """Generate a migration plan skeleton from the extraction manifest."""
    complexity = estimate_complexity(manifest)
    copy_adapt = manifest["by_strategy"].get("COPY_ADAPT", [])
    rewrite = manifest["by_strategy"].get("REWRITE", [])
    bridge = manifest["by_strategy"].get("BRIDGE", [])
    replace = manifest["by_strategy"].get("REPLACE", [])
    env_vars = manifest.get("env_vars_to_migrate", [])

    prep_tasks = [
        {
            "id": "PREP-01",
            "title": f"Create migration branch in target repo",
            "description": f"Create a dedicated branch 'migration/{feature_name}' in the target repository.",
            "commands": [f"git checkout -b migration/{feature_name}"],
            "acceptance_criterion": f"Branch 'migration/{feature_name}' exists and is clean",
            "can_parallelize": False,
            "depends_on": [],
            "rollback": f"git branch -d migration/{feature_name}",
        },
        {
            "id": "PREP-02",
            "title": "Create migration workspace directory structure",
            "description": "Set up the workspace directories in target repo.",
            "commands": ["mkdir -p migration_workspace/{extracted,to_rewrite}"],
            "acceptance_criterion": "Directory structure exists",
            "can_parallelize": False,
            "depends_on": ["PREP-01"],
            "rollback": "rm -rf migration_workspace/",
        },
    ]

    if env_vars:
        prep_tasks.append({
            "id": "PREP-03",
            "title": "Document required environment variables",
            "description": f"Ensure the following env vars are documented and available in target: {', '.join(env_vars)}",
            "commands": [],
            "acceptance_criterion": f"All env vars ({', '.join(env_vars)}) documented in target .env.example or equivalent",
            "can_parallelize": False,
            "depends_on": ["PREP-01"],
            "rollback": "Remove added env var documentation",
        })

    foundation_tasks = []
    for i, f in enumerate(copy_adapt, start=1):
        foundation_tasks.append({
            "id": f"FOUND-{i:02d}",
            "title": f"Port {Path(f).name} (COPY_ADAPT)",
            "description": f"Adapt and port {f} to target conventions. Preserve business logic.",
            "commands": [f"# Edit and adapt extracted/{Path(f).name} → target location"],
            "acceptance_criterion": f"{Path(f).name} exists in target, passes linting, no legacy imports",
            "can_parallelize": i > 1,
            "depends_on": ["PREP-02"],
            "rollback": f"git checkout HEAD -- <target_path/{Path(f).name}>",
        })

    rewrite_tasks = []
    for i, f in enumerate(rewrite, start=1):
        rewrite_tasks.append({
            "id": f"REWRITE-{i:02d}",
            "title": f"Rewrite {Path(f).name} for target framework",
            "description": f"Rewrite {f} preserving business logic. Reference business_rules.md.",
            "commands": [f"# Rewrite to_rewrite/{Path(f).name} → target location"],
            "acceptance_criterion": f"{Path(f).name} exists in target, tests pass, behavior matches business_rules.md",
            "can_parallelize": i > 1,
            "depends_on": ["PREP-02"],
            "rollback": f"git checkout HEAD -- <target_path/{Path(f).name}>",
        })

    bridge_tasks = []
    for i, adapter in enumerate(manifest.get("adapters_needed", []), start=1):
        bridge_tasks.append({
            "id": f"BRIDGE-{i:02d}",
            "title": f"Create adapter for {Path(adapter['file']).name}",
            "description": f"Implement adapter/bridge: {adapter['reason']}. Contract: {adapter['contract']}",
            "commands": ["# Implement adapter contract"],
            "acceptance_criterion": "Adapter implements contract, all consumers updated, integration tests pass",
            "can_parallelize": False,
            "depends_on": [t["id"] for t in foundation_tasks + rewrite_tasks],
            "rollback": "Remove adapter files and revert consumer changes",
        })

    test_tasks = [
        {
            "id": "TEST-01",
            "title": "Write unit tests for migrated feature",
            "description": "Write unit tests covering all rules from business_rules.md. Minimum 80% coverage.",
            "commands": ["# Write tests", "<test runner> --coverage"],
            "acceptance_criterion": "Tests written and passing, coverage ≥ 80%",
            "can_parallelize": False,
            "depends_on": [t["id"] for t in foundation_tasks + rewrite_tasks],
            "rollback": "Remove test files",
        },
        {
            "id": "TEST-02",
            "title": "Verify no regression in existing target test suite",
            "description": "Run the full test suite of the target repo and confirm 0 new failures.",
            "commands": ["<full test suite command>"],
            "acceptance_criterion": "All pre-existing tests continue to pass",
            "can_parallelize": False,
            "depends_on": ["TEST-01"],
            "rollback": "Investigate and fix regression",
        },
    ]

    return {
        "migration_id": f"{feature_name}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
        "feature": feature_name,
        "target_destination": target_path,
        "complexity": complexity,
        "estimated_steps": len(prep_tasks) + len(foundation_tasks) + len(rewrite_tasks) + len(bridge_tasks) + len(test_tasks),
        "phases": [
            {"phase": "PREPARATION", "tasks": prep_tasks},
            {"phase": "FOUNDATION", "tasks": foundation_tasks},
            {"phase": "CORE_MIGRATION", "tasks": rewrite_tasks},
            {"phase": "BRIDGE_ADAPTERS", "tasks": bridge_tasks},
            {"phase": "TESTING", "tasks": test_tasks},
        ],
        "api_contract": {
            "note": "Fill from tech_design.md and business_rules.md",
            "inputs": [],
            "outputs": [],
            "errors": [],
            "invariants": [],
        },
        "test_strategy": {
            "unit_tests": ["Cover all RN* from business_rules.md"],
            "integration_tests": ["End-to-end feature flow in target"],
            "contract_tests": ["API contract from tech_design.md"],
            "regression_tests": ["Full existing test suite of target repo"],
        },
        "rollback_strategy": {
            "description": f"Delete branch migration/{feature_name} and remove all migrated files.",
            "steps": [
                f"git checkout main",
                f"git branch -D migration/{feature_name}",
                "Clean up any temporary files in migration_workspace/",
            ],
        },
        "known_risks": [
            "Review adapters_needed.md for bridge complexity",
            "Verify env vars are available in target environment",
            "Check business_rules.md for undocumented side effects",
        ],
        "deferred_items": [],
    }


def plan_to_markdown(plan: dict) -> str:
    """Convert plan JSON to a human-readable Markdown."""
    lines = [
        f"# Migration Plan: {plan['feature']}",
        f"",
        f"**Migration ID:** `{plan['migration_id']}`  ",
        f"**Destination:** `{plan['target_destination']}`  ",
        f"**Complexity:** {plan['complexity']}  ",
        f"**Total Steps:** {plan['estimated_steps']}  ",
        f"",
    ]
    for phase in plan["phases"]:
        lines.append(f"## Phase: {phase['phase']}")
        lines.append("")
        for task in phase["tasks"]:
            lines.append(f"### `{task['id']}` — {task['title']}")
            lines.append(f"**Description:** {task['description']}")
            lines.append(f"**Acceptance Criterion:** {task['acceptance_criterion']}")
            lines.append(f"**Depends on:** {', '.join(task['depends_on']) or 'none'}")
            lines.append(f"**Can Parallelize:** {task['can_parallelize']}")
            lines.append(f"**Rollback:** `{task['rollback']}`")
            lines.append("")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Generate a structured migration plan.")
    parser.add_argument("--workspace", required=True, help="Path to migration workspace")
    parser.add_argument("--target", required=True, help="Path to target repository")
    parser.add_argument("--output", default="migration_plan.json", help="Output JSON file")
    parser.add_argument("--feature", default=None, help="Feature name override")
    args = parser.parse_args()

    workspace = Path(args.workspace)
    manifest_path = workspace / "extraction_manifest.json"

    if not manifest_path.exists():
        print(f"ERROR: extraction_manifest.json not found in {workspace}", file=sys.stderr)
        sys.exit(1)

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    feature_name = args.feature or manifest.get("feature", "unknown_feature")
    feature_name = feature_name.lower().replace(" ", "_")

    plan = generate_plan_skeleton(manifest, args.target, feature_name)

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(plan, indent=2), encoding="utf-8")

    md_path = output_path.with_suffix(".md").with_name(f"MIGRATION_PLAN_{feature_name.upper()}.md")
    md_path.write_text(plan_to_markdown(plan), encoding="utf-8")

    print(f"\n✅ Migration plan written to: {output_path}")
    print(f"✅ Markdown plan written to: {md_path}")
    print(f"   Complexity: {plan['complexity']}")
    print(f"   Total steps: {plan['estimated_steps']}")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")  # Windows: pipe em cp1252 não tem ✅/⚠️/→ e o print quebraria
    sys.stderr.reconfigure(encoding="utf-8")
    main()
