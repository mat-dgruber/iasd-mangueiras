# Migration Report: {{FEATURE_NAME}}

**Date:** {{DATE}}  
**Migration ID:** {{MIGRATION_ID}}  
**Status:** {{STATUS}}

---

## Executive Summary

| Item | Value |
|------|-------|
| Feature Migrated | {{FEATURE_NAME}} |
| Legacy Source | {{LEGACY_PATH}} |
| Target Destination | {{TARGET_PATH}} |
| Branch | `migration/{{FEATURE_NAME}}` |
| Migration Pattern | {{PATTERN}} |
| Duration | {{DURATION}} |

[One paragraph summary of what was migrated and any key decisions made.]

---

## Archaeology Findings

*Key insights extracted during Phase 1 and Phase 2.*

### Architecture Observed in Legacy
[Summary from overview.md]

### Critical Business Rules Preserved
[Top rules from business_rules.md that were verified during migration]

### Technical Debt Inherited / Addressed
[From overview.md debito_tecnico section]

---

## Migration Decisions

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Chosen pattern: {{PATTERN}} | [Why] | [What else was considered] |
| [Other decision] | [Why] | [Alternatives] |

---

## Changes Made

### Files Created in Target
| File | Purpose |
|------|---------|
| `path/to/file.py` | Core business logic |

### Files Modified in Target
| File | Change Description |
|------|-------------------|
| `path/to/file.py` | Added import, updated signature |

### Files Deleted (Legacy Cleanup)
*None — legacy cleanup is deferred pending monitoring period.*

---

## Test Results

| Suite | Tests Run | Passed | Failed | Coverage |
|-------|-----------|--------|--------|----------|
| Unit | N | N | 0 | N% |
| Integration | N | N | 0 | - |
| Regression (full suite) | N | N | 0 | - |

Full validation report: `migration_workspace/validation_report_{{FEATURE_NAME}}.md`

---

## Known Limitations

*Items that were deferred or consciously not migrated in this iteration.*

1. [Limitation and reason]
2. [Limitation and reason]

---

## Next Steps

- [ ] Monitor new implementation in staging for N days before production cutover
- [ ] Remove feature flag `migration.{{FEATURE_NAME}}.enabled` after N days of stability
- [ ] Decommission legacy code paths in `{{LEGACY_PATH}}` after cutover
- [ ] [Any other follow-up actions]
