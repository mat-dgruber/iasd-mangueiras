import json
import os
import subprocess
import sys
from pathlib import Path

_SCRIPTS = Path(__file__).resolve().parents[2] / "design-ui-ux" / "design-review" / "scripts"
_UX_AUDIT = _SCRIPTS / "ux_audit.py"
_A11Y_CHECKER = _SCRIPTS / "accessibility_checker.py"


def _run_script(script: Path, proj: Path, *args):
    r = subprocess.run(
        [sys.executable, str(script), str(proj), *args],
        capture_output=True,
        encoding="utf-8",
        errors="replace",
        env={**os.environ, "PYTHONIOENCODING": "cp1252"},
    )
    assert "Traceback" not in r.stderr, r.stderr
    return r


# ---------------------------------------------------------------------------
# UX Audit Tests (ux_audit.py)
# ---------------------------------------------------------------------------

def test_ux_audit_nao_penaliza_hero_flat_sem_gradiente(tmp_path):
    """Garante que seções hero flat com cor funcional não são penalizadas por ausência de gradiente."""
    hero_file = tmp_path / "HeroSection.tsx"
    hero_file.write_text(
        """
        export function HeroSection() {
            return (
                <header className="hero bg-slate-900 p-8 border-b border-slate-800">
                    <h1 className="text-3xl font-bold text-white">Console de Operações</h1>
                    <p className="text-slate-400 mt-2">Visão executiva e telemetria dos serviços.</p>
                    <button className="bg-primary text-white px-4 py-3 rounded-lg font-medium">Acessar Cluster</button>
                </header>
            );
        }
        """,
        encoding="utf-8",
    )

    r = _run_script(_UX_AUDIT, tmp_path)
    assert r.returncode == 0, r.stdout + r.stderr
    # Não pode sugerir gradiente decorativo para hero
    assert "Consider gradient" not in r.stdout
    assert "Hero section without visual interest" not in r.stdout
    assert "Hero section lacks visual appeal. Consider gradients" not in r.stdout


def test_ux_audit_permite_tokens_legitimos_roxo_violeta(tmp_path):
    """Garante que tokens legítimos da marca em roxo/violeta não sofrem banimento arbitrário."""
    brand_file = tmp_path / "BrandComponent.tsx"
    brand_file.write_text(
        """
        export function BrandButton() {
            // Usa roxo de marca e classes violet/purple legítimas
            return (
                <div className="bg-[#8B5CF6] text-white p-4">
                    <button className="bg-purple-600 hover:bg-violet-700 primary">
                        Ação de Marca
                    </button>
                </div>
            );
        }
        """,
        encoding="utf-8",
    )

    r = _run_script(_UX_AUDIT, tmp_path)
    assert r.returncode == 0, r.stdout + r.stderr
    assert "PURPLE DETECTED" not in r.stdout
    assert "Banned by Maestro rules" not in r.stdout


def test_ux_audit_padroniza_touch_target_minimo_44px(tmp_path):
    """Garante auditoria de touch targets < 44px conforme Apple HIG / WCAG 2.2."""
    small_target_file = tmp_path / "SmallButton.tsx"
    small_target_file.write_text(
        """
        export function CompactActions() {
            return (
                <div>
                    <button style={{ height: "40px" }} className="primary">Botão 40px</button>
                    <button className="h-10 primary">Botão h-10 (40px)</button>
                </div>
            );
        }
        """,
        encoding="utf-8",
    )

    r_small = _run_script(_UX_AUDIT, tmp_path)
    assert "[Fitts' Law]" in r_small.stdout
    assert "Small targets (< 44px" in r_small.stdout

    # Agora componente com target de 44px ou maior (conforme)
    compliant_dir = tmp_path / "compliant"
    compliant_dir.mkdir()
    compliant_file = compliant_dir / "CompliantButton.tsx"
    compliant_file.write_text(
        """
        export function CompliantActions() {
            return (
                <div>
                    <button style={{ height: "44px" }} className="primary">Botão 44px</button>
                    <button className="h-11 primary">Botão h-11 (44px)</button>
                </div>
            );
        }
        """,
        encoding="utf-8",
    )

    r_compliant = _run_script(_UX_AUDIT, compliant_dir)
    assert "[Fitts' Law]" not in r_compliant.stdout


# ---------------------------------------------------------------------------
# Accessibility Checker Tests (accessibility_checker.py)
# ---------------------------------------------------------------------------

def test_accessibility_checker_suporta_vue_e_svelte(tmp_path):
    """Garante que arquivos .vue e .svelte são incluídos na varredura e auditados."""
    vue_file = tmp_path / "UserProfile.vue"
    vue_file.write_text(
        """
        <template>
            <form>
                <!-- input nativo sem label/id deve gerar issue -->
                <input type="text" />
                <button type="submit">Salvar</button>
            </form>
        </template>
        """,
        encoding="utf-8",
    )

    svelte_file = tmp_path / "SearchBox.svelte"
    svelte_file.write_text(
        """
        <script>
            let query = '';
        </script>
        <div>
            <!-- botão vazio sem aria-label deve gerar issue -->
            <button on:click={() => {}}></button>
        </div>
        """,
        encoding="utf-8",
    )

    r = _run_script(_A11Y_CHECKER, tmp_path)
    assert r.returncode == 1, "Deve falhar por issues de acessibilidade em .vue e .svelte"
    assert "Found 2 HTML/JSX/TSX/Vue/Svelte files" in r.stdout
    assert "Native input without id, name, aria-label, or aria-labelledby" in r.stdout
    assert "Native button without accessible text or label" in r.stdout


def test_accessibility_checker_aceita_vue_e_svelte_acessiveis(tmp_path):
    """Garante que .vue e .svelte com atributos acessíveis passam na auditoria."""
    vue_file = tmp_path / "AccessibleForm.vue"
    vue_file.write_text(
        """
        <template>
            <form>
                <input id="email" v-model="email" type="email" />
                <button type="submit" :aria-label="submitText">{{ submitText }}</button>
            </form>
        </template>
        """,
        encoding="utf-8",
    )

    svelte_file = tmp_path / "AccessibleSearch.svelte"
    svelte_file.write_text(
        """
        <script>
            let query = '';
        </script>
        <div>
            <input id="search-input" name="search" bind:value={query} />
            <button aria-label="Buscar" on:click={() => {}}>🔍</button>
        </div>
        """,
        encoding="utf-8",
    )

    r = _run_script(_A11Y_CHECKER, tmp_path)
    assert r.returncode == 0, r.stdout + r.stderr
    assert "No statically detectable accessibility issues found" in r.stdout


def test_accessibility_checker_audita_focus_visible(tmp_path):
    """Garante auditoria de regras :focus-visible para botões/links e outline suprimido."""
    bad_comp = tmp_path / "BadFocus.vue"
    bad_comp.write_text(
        """
        <template>
            <button class="btn">Clique</button>
        </template>
        <style>
            button {
                outline: none;
            }
        </style>
        """,
        encoding="utf-8",
    )

    r_bad = _run_script(_A11Y_CHECKER, tmp_path)
    assert r_bad.returncode == 1
    assert (
        "CSS rules for buttons or links lack :focus-visible styling" in r_bad.stdout
        or "Outline suppressed without explicit :focus-visible styling" in r_bad.stdout
    )

    # Componente corrigido com :focus-visible
    good_dir = tmp_path / "good"
    good_dir.mkdir()
    good_comp = good_dir / "GoodFocus.vue"
    good_comp.write_text(
        """
        <template>
            <button class="btn">Clique</button>
        </template>
        <style>
            button:focus-visible {
                outline: 2px solid #3b82f6;
                outline-offset: 2px;
            }
        </style>
        """,
        encoding="utf-8",
    )

    r_good = _run_script(_A11Y_CHECKER, good_dir)
    assert r_good.returncode == 0, r_good.stdout + r_good.stderr


def test_accessibility_checker_audita_prefers_reduced_transparency(tmp_path):
    """Garante auditoria de @media (prefers-reduced-transparency: reduce) em efeitos de blur/transparência."""
    glass_dir = tmp_path / "glass"
    glass_dir.mkdir()
    glass_comp = glass_dir / "LiquidGlass.svelte"
    glass_comp.write_text(
        """
        <div class="glass-panel">
            <p>Painel translúcido</p>
        </div>
        <style>
            .glass-panel {
                backdrop-filter: blur(16px);
                background-color: rgba(255, 255, 255, 0.1);
            }
        </style>
        """,
        encoding="utf-8",
    )

    r_glass = _run_script(_A11Y_CHECKER, glass_dir)
    assert r_glass.returncode == 1
    assert "prefers-reduced-transparency" in r_glass.stdout

    # Componente com fallback acessível para prefers-reduced-transparency
    accessible_dir = tmp_path / "accessible_glass"
    accessible_dir.mkdir()
    accessible_comp = accessible_dir / "AccessibleLiquidGlass.svelte"
    accessible_comp.write_text(
        """
        <div class="glass-panel">
            <p>Painel translúcido acessível</p>
        </div>
        <style>
            .glass-panel {
                backdrop-filter: blur(16px);
                background-color: rgba(255, 255, 255, 0.1);
            }
            @media (prefers-reduced-transparency: reduce) {
                .glass-panel {
                    backdrop-filter: none;
                    background-color: #ffffff;
                }
            }
        </style>
        """,
        encoding="utf-8",
    )

    r_acc = _run_script(_A11Y_CHECKER, accessible_dir)
    assert r_acc.returncode == 0, r_acc.stdout + r_acc.stderr
