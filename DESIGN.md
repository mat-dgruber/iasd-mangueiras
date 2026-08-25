---
name: IASD Mangueiras Design System
version: 1.0.0
colors:
  primary: "#0a3b66"
  on-primary: "#ffffff"
  primary-container: "#062544"
  on-primary-container: "#d4e3fc"
  primary-fixed: "#dce8fd"
  primary-fixed-dim: "#9fc2fa"
  on-primary-fixed: "#031c38"
  secondary: "#c59b27"
  on-secondary: "#ffffff"
  secondary-container: "#fbf0cf"
  on-secondary-container: "#594100"
  secondary-fixed: "#ffdf99"
  secondary-fixed-dim: "#e8be52"
  on-secondary-fixed: "#3a2900"
  tertiary: "#0d9488"
  on-tertiary: "#ffffff"
  tertiary-container: "#ccfbf1"
  on-tertiary-container: "#115e59"
  error: "#dc2626"
  on-error: "#ffffff"
  error-container: "#fee2e2"
  on-error-container: "#991b1b"
  surface: "#ffffff"
  surface-dim: "#f1f5f9"
  surface-bright: "#ffffff"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f8fafc"
  surface-container: "#f1f5f9"
  surface-container-high: "#e2e8f0"
  surface-container-highest: "#cbd5e1"
  on-surface: "#0f172a"
  on-surface-variant: "#475569"
  outline: "#94a3b8"
  outline-variant: "#e2e8f0"
  background: "#f8fafc"
  on-background: "#0f172a"
typography:
  display-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 64px
    fontWeight: "700"
    lineHeight: "1.1"
    letterSpacing: -0.03em
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: "700"
    lineHeight: "1.15"
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: "700"
    lineHeight: "1.2"
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: "600"
    lineHeight: "1.3"
    letterSpacing: -0.01em
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: "600"
    lineHeight: "1.4"
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: "600"
    lineHeight: "1.4"
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: "400"
    lineHeight: "1.6"
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: "1.6"
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "400"
    lineHeight: "1.5"
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "700"
    lineHeight: "1.2"
    letterSpacing: 0.08em
rounded:
  sm: 0.375rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  2xl: 2rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

# IASD Mangueiras Design System

## 1. Overview & Brand North Star

**Creative North Star: "Santuário Acolhedor & Esperança Viva"**

O design do portal e do painel administrativo da IASD Mangueiras (Tatuí/SP) reflete uma igreja acolhedora, vibrante, espiritual e moderna. Ele une a serenidade da fé e o compromisso comunitário com a clareza e elegância da tecnologia contemporânea.

Evitamos layouts genéricos ou datados. Criamos uma experiência visual enriquecida com:

- **Camadas tonais e Glassmorphism sutil:** Transparências elegantes com desfoque de fundo (`backdrop-blur-md`), conferindo profundidade sem poluição visual.
- **Destaques em Ouro Quente e Azul Real:** Uma paleta nobre e espiritual com contraste WCAG 2.1 AA impecável.
- **Hierarquia Tipográfica Dinâmica:** Títulos expressivos em _Plus Jakarta Sans_ e corpo de texto altamente legível em _Inter_.
- **Microinterações Fluidas:** Hover states com elevação suave, botões táteis e feedback contextual em tempo real.

---

## 2. Cores & Iluminação

A identidade cromática equilibra a solenidade do Azul Adventista com o calor e acolhimento do Ouro e tons naturais.

- **Primary (Azul Real Adventista #0A3B66):** Representa fidelidade, fé e autoridade institucional. Usado na barra de navegação, cabeçalhos de destaque, botões primários e links essenciais.
- **Secondary (Ouro Solar / Trigo #C59B27):** Representa a luz, a esperança e a celebração bíblica. Usado para badges de próximo culto, acentos em cards e chamadas para ação de alto valor (como assistir ao vivo ou enviar pedido de oração).
- **Tertiary (Teal Esperança #0D9488):** Acentos de vitalidade para ações comunitárias, pequenos grupos e ministérios sociais.
- **Superfícies & Fundos:** Fundo Off-White (#F8FAFC) com cartões brancos puros (#FFFFFF) e contornos em ardósia suave (#E2E8F0) para máxima legibilidade e descanso visual.

---

## 3. Tipografia

- **Títulos & Mastheads (Plus Jakarta Sans):** Modernidade geométrica com toques humanistas, conferindo um tom acolhedor e seguro.
- **Corpo de Texto & Formulários (Inter):** Clareza de leitura excelente em resoluções mobile e desktop.
- **Labels & Tags (Inter Caps):** Caixa alta com espaçamento ampliado (`letterSpacing: 0.08em`) para categorias e badges de status.

---

## 4. Elevação & Profundidade

1. **Nível 0 (Canvas):** Fundo base suave `#F8FAFC`.
2. **Nível 1 (Cards & Artigos):** Superfícies brancas com sombras de contato discretas (`shadow-xs` ou `shadow-sm`) e bordas de 1px com transição suave para hover.
3. **Nível 2 (Hero & Cards em Destaque):** Gradientes escuros e luminosos (Azul Real profundo `#062544` a `#0A3B66`) com vidros foscos (`backdrop-blur-md`).
4. **Nível 3 (Modais & Overlays):** Diálogos com elevação alta (`shadow-2xl`), cantos arredondados generosos (`rounded-2xl`) e backdrop escurecido suave (`bg-black/60`).

---

## 5. Componentes Principais

- **Hero & Próximo Culto:** Card dinâmico em destaque que calcula a contagem regressiva para o próximo encontro com badge em tempo real.
- **Transmissões & Sermões:** Grid de vídeos em formato 16:9 com overlay de reprodução com toque ágil e modal cinema de alta fidelidade.
- **Pequenos Grupos & Estudos:** Cards interativos filtráveis por dia da semana e bairro com link direto para contato via WhatsApp do líder.
- **Painel Administrativo:** Interface intuitiva e limpa com barra lateral de navegação rápida, métricas resumidas e modais rápidos de publicação.
