#!/usr/bin/env python3
"""Lightweight static accessibility audit for HTML, JSX, TSX, Vue, and Svelte.

This checker intentionally limits itself to findings that can be inferred from
source. Component names such as ``<Button>`` and ``<InputGroup>`` are not
mistaken for native HTML elements.
"""
from __future__ import annotations

import json
import re
import sys
from datetime import datetime
from pathlib import Path

SKIP_DIRS = {"node_modules", ".next", "dist", "build", ".git", "coverage", "out"}


def find_html_files(project_path: Path) -> list[Path]:
    files = [
        path
        for path in project_path.rglob("*")
        if path.is_file()
        and path.suffix.lower() in {".html", ".jsx", ".tsx", ".vue", ".svelte"}
        and not any(part in SKIP_DIRS for part in path.parts)
    ]
    return sorted(files)


def _extract_tags_with_content(content: str, tag: str) -> list[tuple[str, str]]:
    """Extrai (attributes, body) para <tag ...>body</tag> respeitando strings e chaves nos atributos."""
    results = []
    pattern = re.compile(rf"<{tag}\b", re.IGNORECASE)
    close_pattern = re.compile(rf"</{tag}\s*>", re.IGNORECASE)
    for m in pattern.finditer(content):
        start = m.end()
        i = start
        in_quote = None
        brace_depth = 0
        while i < len(content):
            c = content[i]
            if in_quote:
                if c == in_quote and (i == 0 or content[i - 1] != "\\"):
                    in_quote = None
            elif c in ('"', "'", "`"):
                in_quote = c
            elif c == "{":
                brace_depth += 1
            elif c == "}":
                if brace_depth > 0:
                    brace_depth -= 1
            elif c == ">" and brace_depth == 0:
                break
            i += 1
        if i >= len(content):
            continue
        attrs = content[start:i]
        body_start = i + 1
        close_match = close_pattern.search(content, body_start)
        if close_match:
            body = content[body_start:close_match.start()]
            results.append((attrs, body))
    return results


def _opening_tags(content: str, tag: str) -> list[str]:
    return re.findall(rf"<{tag}\b[^>]*>", content, re.DOTALL)


def check_accessibility(file_path: Path) -> list[str]:
    issues: list[str] = []
    content = file_path.read_text("utf-8", errors="ignore")
    lowered = content.lower()

    for input_tag in _opening_tags(content, "input"):
        normalized = input_tag.lower()
        if re.search(r'type\s*=\s*["\']hidden["\']', normalized):
            continue
        accessible = any(
            token in normalized
            for token in (
                "aria-label=", "aria-labelledby=", "id=", "{...", "name=", "value=",
                ":aria-label=", ":aria-labelledby=", ":id=", ":name=", ":value=",
                "v-bind:aria-label=", "v-bind:id=", "v-bind:value=", "v-model=", "bind:value="
            )
        )
        if not accessible:
            issues.append("Native input without id, name, aria-label, or aria-labelledby")
            break

    for attributes, body in _extract_tags_with_content(content, "button"):
        attr_lower = attributes.lower()
        if any(token in attr_lower for token in ("aria-label=", "aria-labelledby=", ":aria-label=", ":aria-labelledby=", "v-bind:aria-label=")):
            continue
        text = re.sub(r"<[^>]+>|\{[^}]+\}", "", body).strip()
        has_child_content = bool(re.search(r"<[A-Za-z]", body) or re.search(r"\{[^}]+\}", body) or re.search(r"\{\{.*?\}\}", body))
        if not text and not has_child_content:
            issues.append("Native button without accessible text or label")
            break

    html_tags = _opening_tags(content, "html")
    if html_tags and not any(re.search(r"\blang\s*=", tag, re.IGNORECASE) for tag in html_tags):
        issues.append("Missing lang attribute on <html>")

    if _opening_tags(content, "body"):
        has_skip_link = bool(
            re.search(r"href\s*=\s*[\"']#(?:main|main-content)[\"']", content, re.IGNORECASE)
        )
        if not has_skip_link:
            issues.append("Document body is missing a skip-to-main-content link")

    non_interactive_click = re.finditer(
        r"<(div|span|li|section|article)\b([^>]*)(?:onClick|onclick|@click|v-on:click|on:click)\s*=([^>]*)>",
        content,
        re.DOTALL,
    )
    for _, before, after in non_interactive_click:
        attributes = f"{before} {after}".lower()
        keyboard_enabled = any(k in attributes for k in ("onkeydown=", "onkeyup=", "@keydown=", "@keyup=", "on:keydown=", "on:keyup=", "v-on:keydown=", "v-on:keyup="))
        semantic_button = 'role="button"' in attributes or "role='button'" in attributes or 'role={`button`}' in attributes
        focusable = "tabindex=" in attributes or ":tabindex=" in attributes
        if not (keyboard_enabled and semantic_button and focusable):
            issues.append("Non-interactive element with onClick lacks role, tabIndex, or keyboard handler")
            break

    positive_tabindex = re.findall(r"(?:tabIndex|tabindex)\s*=\s*[\"']([1-9]\d*)[\"']", content, re.IGNORECASE)
    if positive_tabindex:
        issues.append("Avoid positive tabIndex values")

    for media_tag in re.findall(r"<(?:audio|video)\b[^>]*>", content, re.DOTALL):
        if "autoplay" in media_tag.lower() and "muted" not in media_tag.lower():
            issues.append("Autoplay media should be muted")
            break

    for div_tag in re.findall(r"<div\b[^>]*role\s*=\s*[\"']button[\"'][^>]*>", content, re.DOTALL):
        lowered_tag = div_tag.lower()
        has_tabindex = "tabindex=" in lowered_tag or ":tabindex=" in lowered_tag
        has_keyboard = any(k in lowered_tag for k in ("onkeydown=", "onkeyup=", "@keydown=", "@keyup=", "on:keydown=", "on:keyup=", "v-on:keydown=", "v-on:keyup="))
        if not (has_tabindex and has_keyboard):
            issues.append("role='button' requires tabIndex and a keyboard handler")
            break

    # Check for :focus-visible in button and link CSS rules or suppressed outlines
    suppresses_outline = bool(
        re.search(r"outline:\s*(?:none|0\b)", content, re.IGNORECASE)
        or re.search(r"\b(?:focus:)?outline-none\b", content, re.IGNORECASE)
    )
    has_focus_visible = bool(
        re.search(r":focus-visible\b|focus-visible:", content, re.IGNORECASE)
    )
    if suppresses_outline and not has_focus_visible:
        issues.append("Outline suppressed without explicit :focus-visible styling")

    style_blocks = re.findall(r"<style\b[^>]*>(.*?)</style>", content, re.DOTALL | re.IGNORECASE)
    css_literals = re.findall(r"(?:css|styled(?:\.\w+|\([^)]+\)))\s*`([^`]*)`", content, re.DOTALL)
    all_styles = style_blocks + css_literals
    if file_path.suffix.lower() == ".css":
        all_styles.append(content)

    if all_styles:
        css_content = "\n".join(all_styles)
        has_button_link_css = bool(
            re.search(
                r"(?:^|[\s,;{}])(?:button|(?<![\w.-])a|\.btn|\.button)\b[^{;}]*\{",
                css_content,
                re.IGNORECASE,
            )
        )
        if has_button_link_css:
            if not has_focus_visible:
                issues.append("CSS rules for buttons or links lack :focus-visible styling")

    # Check for translucent backdrop-filter without prefers-reduced-transparency
    bf_matches = re.findall(r"(?:-webkit-)?backdrop-filter\s*:\s*([^;}\"\x27]+)", content, re.IGNORECASE)
    has_translucent_backdrop = any(
        not re.match(r"^(?:none|inherit|initial|unset)\b", v.strip(), re.IGNORECASE)
        for v in bf_matches
    ) or bool(re.search(r"\bbackdrop-blur(?:-[a-z0-9]+)?\b", content, re.IGNORECASE))

    if has_translucent_backdrop:
        has_reduced_transparency = bool(
            re.search(r"prefers-reduced-transparency", content, re.IGNORECASE)
        )
        if not has_reduced_transparency:
            issues.append(
                "Translucent backdrop-filter without @media (prefers-reduced-transparency: reduce) fallback"
            )

    return issues


def main() -> int:
    project_path = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    if project_path.is_file():
        files = [project_path]
    elif project_path.is_dir():
        files = find_html_files(project_path)
    else:
        print(json.dumps({"error": f"Path not found: {project_path}"}))
        return 2

    print(f"\n{'=' * 60}\n[ACCESSIBILITY CHECKER] WCAG Static Audit\n{'=' * 60}")
    print(f"Project: {project_path}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n" + "-" * 60)

    print(f"Found {len(files)} HTML/JSX/TSX/Vue/Svelte files")
    all_issues = []
    for file_path in files:
        issues = check_accessibility(file_path)
        if issues:
            rel = file_path.name if project_path.is_file() else str(file_path.relative_to(project_path))
            all_issues.append({"file": rel, "issues": issues})

    print("\n" + "=" * 60 + "\nACCESSIBILITY ISSUES\n" + "=" * 60)
    if all_issues:
        for item in all_issues[:20]:
            print(f"\n{item['file']}:")
            for issue in item["issues"]:
                print(f"  - {issue}")
    else:
        print("No statically detectable accessibility issues found.")

    total_issues = sum(len(item["issues"]) for item in all_issues)
    output = {
        "script": "accessibility_checker",
        "project": str(project_path),
        "files_checked": len(files),
        "files_with_issues": len(all_issues),
        "issues_found": total_issues,
        "passed": total_issues == 0,
    }
    print("\n" + json.dumps(output, indent=2))
    return 0 if output["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
