# 🎨 Relatório Geral de Revisão de Design, UI/UX, Mobile & Motion (Todas as Telas e Rotas)

> [!NOTE]
> **Data:** 2026-11-10  
> **Alvo Analisado:** Monorepo `IASD-Mangueiras` (`frontend/src/` — 18 rotas + Shell Global + 11 componentes Shared UI)  
> **Stack:** Angular 22 (Standalone + Signals) + Tailwind CSS v3 + CSS Custom Properties (`tokens.css`)  
> **Orquestração Multi-Skill (Fan-Out):** `/design-review`, `/ux-reviewer`, `/mobile-design`, `/animacao` (`motion-design`, `cast`, `gsap`), `/impeccable`, `/frontend-design`, `/ui-ux-pro-max`, `/huashu-design`, `/grill-me-design-system`  
> **Status Geral:** 🔴 Requer Correções Estruturais (Split-Brain de Temas, Classes Tailwind v4 em motor v3, Modais sem Focus Trap e Touch Targets < 44px)

---

## 📑 Sumário Executivo dos 5 Problemas Sistêmicos ("Root Causes")

Antes de entrar na visão individual de cada skill e no diagnóstico das 18 rotas, a varredura de código identificou **5 problemas de fundação** que se propagam por todo o sistema:

1. **Split-Brain entre `tokens.css` e `tailwind.config.js` (Quebra Total de Dark Mode e High-Contrast):**
   - `frontend/src/tokens.css:19-186` define variáveis semânticas exemplares para os 3 temas (`Light`, `Dark` via `@media (prefers-color-scheme: dark)` / `.dark`, e `High-Contrast` via `@media (prefers-contrast: more)` / `.high-contrast`).
   - Porém, `frontend/tailwind.config.js:8-19` mapeia `advent.*` para hexadecimais estáticos fixos (`blue: '#003767'`, `white: '#FFFFFF'`, `neutral: '#F4F4F4'`, `border: '#E5E7EB'`, `text: '#111827'`, `muted: '#4B5563'`), e as páginas usam `bg-white`, `bg-slate-50` e `text-slate-700` diretamente.
   - **Efeito real:** Quando o sistema operacional do usuário está em Dark Mode ou Alto Contraste, `styles.css:29-30` pinta o `<body>` de escuro (`#0f172a` ou `#000000`) com texto claro, mas todos os cards, headers, modais e seções permanecem brancos fixos (`#FFFFFF`), destruindo o contraste e a hierarquia visual.
2. **Classes Utilitárias do Tailwind v4 em Projeto Tailwind v3 (CSS Silenciosamente Ignorado):**
   - O projeto compila com Tailwind v3 (`frontend/src/styles.css:3-5`), mas diversos componentes utilizam classes exclusivas do Tailwind v4 que **não geram CSS nenhum**:
     - `bg-linear-to-r`, `bg-linear-to-b`, `bg-linear-to-br` (`eventos.page.ts:43`, `ministerio-card.component.ts:27`, `estudos-pgs-tab.component.ts:95`, `pg-profile-card.component.ts:17`, `sou-novo.page.ts:197`) -> deveria ser `bg-gradient-to-*`.
     - `shadow-2xs`, `shadow-xs` (`ao-vivo.page.ts:450`, `header.component.ts:91`, `global-search-dialog.component.ts:36`, `datetime-picker.component.ts:36`) -> deveria ser `shadow-sm`.
     - `backdrop-blur-xs` (`ministerio-modal.component.ts:12`) -> deveria ser `backdrop-blur-sm`.
     - `focus:outline-hidden` (`eventos.page.ts:218,229`) -> deveria ser `focus:outline-none focus-visible:ring-2`.
     - `h-4.5 w-4.5`, `active:scale-98` (`global-search-dialog.component.ts:86,108`) -> deveria ser `h-[18px] w-[18px]`, `active:scale-[0.98]`.
     - `text-advent-blue-light` (`ao-vivo.page.ts:381,430`) -> token inexistente em `tailwind.config.js`.
3. **Keyframes de Animação Referenciados mas Inexistentes no `tailwind.config.js`:**
   - `frontend/tailwind.config.js:47-51` declara apenas `animate-fadeIn`, `animate-modalSlideUp` e `animate-shimmer`.
   - Porém os componentes usam `animate-slideInRight` (`header.component.ts:174`), `animate-scaleUp` (`modal.component.ts:31`) e `animate-slideLeft` (`toast-container.component.ts:16`), fazendo com que o drawer mobile, os modais e os toasts apareçam a seco.
4. **Inversão de Z-Index entre Modais e Toasts (`tokens.css` Ignorado):**
   - `frontend/src/tokens.css:4-14` define `--z-sticky: 100`, `--z-drawer: 200`, `--z-backdrop: 300`, `--z-modal: 400`, `--z-popover: 500`, `--z-toast: 1000`.
   - Apenas `ModalComponent` (`modal.component.ts:22`) usa `z-[var(--z-modal)]` (`400`). Já `ToastContainerComponent` (`toast-container.component.ts:10`) usa `z-50` (`50`). Resultado: **qualquer toast de erro/sucesso disparado com um modal aberto fica invisível atrás do backdrop do modal**.
5. **5 Modais Manuais Sem Focus Trap / Restauração de Foco:**
   - Embora `<app-ui-modal>` tenha Focus Trap e restauração de foco, 5 diálogos foram recriados manualmente com `<div class="fixed inset-0 z-50">` e permitem que a tecla `Tab` escape para o fundo da página: `ao-vivo.page.ts:894`, `ministerio-modal.component.ts:11`, `estudos-versiculo-tab.component.ts:1107`, `global-search-dialog.component.ts:23`, `admin-pgs.page.ts:170` e os 2 modais de `admin-horarios.page.ts:338,476`.

---

## 🔭 Parte 1: Visão Individual e Competitiva de Cada Skill (Fan-Out)

Conforme o protocolo de governança, abaixo estão os pareceres independentes e as propostas divergentes de cada skill acionada.

---

### 1. 🔍 Perspectiva `/design-review` (Auditoria das 5 Lentes — Scorecard: `31 / 50`)

| Dimensão Avaliada | Nota | Status | Diagnóstico Principal |
| :--- | :---: | :---: | :--- |
| **1. Arquitetura de UI/UX & Tokens** | `5/10` | 🔴 FAIL | Desconexão `tokens.css` vs `tailwind.config.js`; `z-50` hardcoded; falta de `min-h-dvh` no shell. |
| **2. Polimento Fino & Micro-UX** | `6/10` | 🟡 WARN | Falta de Error State + Retry nas rotas públicas e admin; empty states falsos durante loading em `/ao-vivo` e `/eventos`. |
| **3. Animação & Interatividade** | `6/10` | 🟡 WARN | Classes de animação quebradas (`animate-slideInRight`, `animate-scaleUp`, `animate-slideLeft`); ausência de animações de saída. |
| **4. Identidade Visual & Tipografia** | `7/10` | 🟡 WARN | Mais de 45 ocorrências de `text-[9px]`, `text-[10px]` e `text-[11px]`; falta de `tabular-nums` em horários, contadores e KPIs. |
| **5. Estética & Filtro Anti-Slop** | `7/10` | 🟡 WARN | Classes Tailwind v4 quebradas; mistura de Heroicons, Material Symbols e Emojis literais (`⭐`, `🎙️`, `🧠`, `📅`). |

**Proposta da `/design-review`:**
- Conectar `tailwind.config.js` diretamente às variáveis de `tokens.css` (`surface-canvas`, `surface-card`, `text-primary`, `border-default`).
- Eliminar 100% dos tamanhos em pixels (`text-[10px]`, `text-[11px]`) substituindo por `text-xs` (`0.75rem`) com `tabular-nums` em dados temporais/numéricos.
- Padronizar uma única família de ícones vetoriais (ou SVG inline ou Material Symbols com `aria-hidden="true"`), banindo emojis de controles de UI.

---

### 2. 🧠 Perspectiva `/ux-reviewer` (Psicologia Cognitiva & Funil CREATE — Scorecard: `33 / 50`)

| Lente Cognitiva / Comportamental | Nota | Status | Diagnóstico Principal |
| :--- | :---: | :---: | :--- |
| **1. Carga Cognitiva & Leis de UX** | `6/10` | 🟡 WARN | Violação da Lei de Hick em `/estudos` (3 sistemas de busca concorrentes em PGs) e `header`/`admin-layout` (9–11 itens sem chunking). |
| **2. Dinâmica B=MAP & Funil CREATE** | `6/10` | 🟡 WARN | Botões de submit desabilitados em `/contato` e `/admin/login` sem explicar qual campo está inválido; links de Oração/Estudo na Home não pré-selecionam a aba em `/contato`. |
| **3. Arquitetura de Decisão & Fricção** | `7/10` | 🟢 OK | Bom uso de `ConfirmDialogComponent` no admin, mas `admin-login` dispara reset de senha com 1 clique acidental. |
| **4. Hábitos & Efeito Pico-Fim** | `6/10` | 🟡 WARN | Em `/admin/eventos` e `/admin/ministerios`, falhas de gravação no Firestore exibem toast "salvo localmente" e fecham o modal, criando falsa sensação de sucesso. |
| **5. Integridade & Confiabilidade** | `8/10` | 🟡 WARN | Zero dark patterns maliciosos, porém **dados falsos hardcoded** em `/admin/oracoes` (`Maria Silva`/`Carlos Santos`) e `/admin/dashboard` quando o banco está vazio ou falha induzem líderes ao erro. |

#### Diagnóstico do Funil de Ação CREATE (Steve Wendel)
| Elo do Funil | Status | Diagnóstico Técnico no Código |
| :--- | :---: | :--- |
| **1. Cue (Gatilho)** | 🟢 Forte | Hero claro na Home com contador de próximo culto e CTAs visíveis. |
| **2. Reaction (Intuição)** | 🟢 Positiva | Identidade institucional adventista transmite acolhimento e confiança. |
| **3. Evaluation (Racional)** | 🟡 Médio | Nos cards de `/ministerios`, 3 CTAs lado a lado ("Ver detalhes", "WhatsApp", "Quero Servir") competem pela mesma decisão. |
| **4. Ability (Habilidade)** | 🔴 Baixa | Em `/contato`, `[disabled]="contatoForm.invalid"` impede o clique que revelaria os erros inline; em `/admin/comunicados`, não existe botão "Editar" (obriga excluir e recriar). |
| **5. Timing (Urgência)** | 🟢 Bom | Contador regressivo ao vivo em `/` e `/ao-vivo` cria senso de oportunidade real para os cultos. |
| **6. Execution (Execução)** | 🔴 Falha | Em `/eventos:610`, o link "Google Agenda" agenda o evento para o próximo dia da semana genérico, ignorando a `data_inicio` real do evento. |

---

### 3. 📱 Perspectiva `/mobile-design` (Ergonomia Touch-First, Thumb Zone & Viewports)

**Diagnóstico de Ergonomia Mobile:**
1. **Quebra Crítica no `AdminLayoutComponent` Mobile (`admin-layout.component.ts:21,48-51,157-190`):**
   - O elemento `<nav>` possui **dois atributos `class` duplicados** (`class="mt-6 space-y-1.5"` na linha 48 e `class="md:block"` na linha 51).
   - Os links não fecham o menu ao navegar (`(click)="isMobileMenuOpen.set(false)"` ausente).
   - O bloco do perfil do usuário e botão "Sair" (`linhas 157-190`) fica **fora** do container colapsável, permanecendo aberto permanentemente no topo de todas as telas admin no celular e consumindo ~180px verticais da viewport.
2. **Violação Sistemática de Touch Targets (< 44x44px — Lei de Fitts):**
   - `ButtonComponent` (`button.component.ts:18-23`): tamanho `sm` (~28px) e tamanho `md` (~40px) estão abaixo de 44px — afetando inclusive o `ConfirmDialogComponent` (`size="sm"`).
   - `HeaderComponent` (`header.component.ts:119,130,186`): botões mobile de Busca e Menu Hamburger têm `40x40px` (`h-10 w-10`) e botão fechar drawer tem `36x36px`.
   - `DateTimePickerComponent` (`datetime-picker.component.ts:80,152,201,266,298`): dias do calendário têm `32x32px` (`h-8 w-8`) e setas `▲`/`▼` de hora/minuto têm `~12x10px` (`text-[9px]`), impossíveis de operar com o polegar.
   - `AdminEscalasPage` (`admin-escalas.page.ts:193-215`): botões "Copiar WhatsApp", "Editar" e "Excluir" têm `18px–24px` de altura.
3. **Auto-Zoom Forçado no iOS Safari (Inputs com fonte < 16px):**
   - Inputs com `text-xs` (12px) ou `text-sm` (14px) sem `sm:text-sm` disparam zoom automático no iOS ao receber foco: `admin-login.page.ts:99,123`, `ministerios.page.ts:68`, `estudos-pgs-tab.component.ts:61`, `image-picker.component.ts:166`.
4. **Interações Dependentes de Hover (Invisíveis no Mobile):**
   - `ao-vivo.page.ts:458,483,508,533,810`: textos e overlays com `opacity-0 group-hover:opacity-100` nunca aparecem em telas touch.
5. **Safe Areas e `100vh`:**
   - `index.html:7` sem `viewport-fit=cover`; `ao-vivo.page.ts:144` e `estudos.page.ts:25` usam `min-h-screen` em vez de `min-h-dvh`; `toast-container.component.ts:10` e `header.component.ts:174` não respeitam `env(safe-area-inset-bottom)`.

---

### 4. 🎬 Perspectiva `/animacao` (Execução em Leque: 4 Variações Técnicas de Motion)

O Hub `/animacao` avalia o movimento da interface sob 4 escolas técnicas distintas para sua escolha:

#### Variação M1: `motion-design` (Princípios Disney + Curvas Corporativas/Premium em CSS Nativo)
- **Diagnóstico:** Atualmente o app usa `transition-all duration-300` genérico, animações ausentes no config (`animate-slideInRight`, `animate-scaleUp`, `animate-slideLeft`) e corta elementos do DOM com `@if` antes de permitir animação de saída. Além disso, `ao-vivo.page.ts:1135` força `scrollBy({ behavior: 'smooth' })` ignorando `prefers-reduced-motion`.
- **Proposta M1 (Leve, Zero Dependências):**
  - Registrar no `tailwind.config.js` a assinatura de movimento **Corporate/Premium**:
    - Curva de entrada (decelerate): `cubic-bezier(0.16, 1, 0.3, 1)` (250ms para cards/tabs, 350ms para modais/drawers).
    - Curva de saída (accelerate): `cubic-bezier(0.3, 0, 1, 1)` (~180ms, 60% da entrada).
  - Feedback tátil imediato em todos os botões interativos: `active:scale-[0.98] transition-transform duration-100`.
  - Substituir `transition-all` por `transition-[transform,box-shadow,border-color,background-color]`.

#### Variação M2: `cast` / Genjutsu (Micro-Interações Vivas, Coreografia Stagger & Transições de Rota)
- **Proposta M2 (Expressiva com APIs Nativas Web/Angular):**
  - **View Transitions API no Angular Router:** Adicionar `withViewTransitions()` no `provideRouter(routes, withViewTransitions())` em `app.config.ts` para cross-fade espacial automático entre todas as 18 rotas sem peso de biblioteca externa.
  - **Stagger Cascade em Listas (`@for`):** Aplicar `--stagger-index` (`style="animation-delay: calc({{ $index }} * 40ms)"`, limitado aos primeiros 8 itens para manter o orçamento `< 350ms`) na entrada dos cards de `/horarios`, `/eventos`, `/ministerios` e `/estudos`.
  - **Animação Nativa de `<dialog>` / Popover com `@starting-style`:** Permitir entrada e saída suave de modais e drawers sem depender de bibliotecas JS.

#### Variação M3: `gsap-scrolltrigger` / `gsap-timeline` (Scrolltelling & Sticky-Stack no Portal Público)
- **Proposta M3 (Cinematográfica para Landing Pages `/` e `/sou-novo`):**
  - Na `HomePage` (`/`) e em `SouNovoPage` (`/sou-novo`), transformar a jornada "O que esperar na sua visita" (4 passos) em um **Sticky-Stack ou Scroll-Reveal coreografado** com ScrollTrigger, onde o indicador de progresso lateral preenche à medida que o visitante rola a página.
  - *Trade-off:* Requer adicionar `gsap` ao `frontend/package.json` (~28KB gzipped) e isolar em componentes com `prefers-reduced-motion` guard.

#### Variação M4: `threejs-shaders` / Canvas Atmosférico (Fundo Vivo no Hero e Estúdio de Versículos)
- **Proposta M4 (Imersiva / WebGL ou Canvas 2D):**
  - Substituir os orbes estáticos de `blur-3xl` do Hero da `HomePage` (`home.page.ts:66-73`) e do `EstudosVersiculoTabComponent` por um shader leve de luz matinal / partículas suaves em Canvas 2D/WebGL com pausa automática via `IntersectionObserver` quando fora da viewport.
  - *Trade-off:* Maior complexidade gráfica; recomendado apenas se desejar impacto visual "Awwwards" na Home.

---

### 5. ✨ Perspectiva `/impeccable` & `/frontend-design` (Caça aos "AI Tells" e Polimento Editorial)

As skills `/impeccable` e `/frontend-design` aplicam filtros estritos contra vícios de interfaces geradas por IA:

1. **Violação da Regra de Eyebrows (`EYEBROW RESTRAINT` — Banido acima de `ceil(seções / 3)`):**
   - Na `HomePage` (`home.page.ts:80,179,256,383,515,579`), **6 de 6 seções (100%)** possuem um kicker `uppercase tracking-wider text-xs` acima do `<h2>`. O mesmo ocorre em 100% das seções de `/ministerios`, `/sou-novo` e `/contato`.
   - **Correção:** Manter o eyebrow apenas no Hero e deixar os títulos `<h2>` das seções falarem por si próprios com hierarquia tipográfica (`text-wrap: balance`).
2. **Violação do Banimento de Hover Zoom em `<img>` (`rule:skill-interaction-gemini-no-image-hover`):**
   - Imagens com `group-hover:scale-105` ou `hover:scale-105` aparecem em `home.page.ts:298,440`, `ao-vivo.page.ts:392,617,802`, `eventos.page.ts:300` e `ministerio-card.component.ts:20`.
   - **Correção:** Remover o zoom da foto e animar a elevação/borda do card contenedor (`hover:border-advent-blue/30 hover:shadow-md`).
3. **Violação do Banimento de Emojis como Ícones de UI:**
   - Emojis literais (`⭐`, `🎙️`, `📍`, `🧠`, `✨`, `📅`, `👤`, `🏠`, `🔥`, `🏞️`, `🎨`, `📷`, `🎲`) são usados como ícones estruturais em `eventos.page.ts`, `estudos-pgs-tab.component.ts`, `estudos-licao-tab.component.ts`, `estudos-versiculo-tab.component.ts` e `admin-eventos.page.ts`.
   - **Correção:** Substituir por ícones SVG consistentes com `aria-hidden="true"`.
4. **Violação do Banimento de Travessões (`—` Em-Dash Ban):**
   - Travessões aparecem nos títulos de `app.routes.ts:8-123`, `home.page.ts:47,759`, `horarios.page.ts:667,772,785`, `ao-vivo.page.ts:187,1054`, `eventos.page.ts:554`, `estudos.page.ts:166`, `admin-escalas.page.ts:622,645`.
5. **Falso Affordance em Cards Não-Clicáveis:**
   - Em `sou-novo.page.ts:54,71,88,105`, os 4 cards de passos têm `hover:-translate-y-1 hover:shadow-md`, sugerindo que são links clicáveis quando são apenas blocos de leitura.

---

### 6. 🏛️ Perspectiva `/ui-ux-pro-max`, `/huashu-design` & `/grill-me-design-system` (3 Direções de Evolução do Sistema)

Sob a ótica de governança de Design System e direção de arte, há **3 caminhos estratégicos** para o redesign/remediação das 18 rotas:

- **Direção A — Evolução Cirúrgica & Governança Canônica (`grill-me-design-system` + `impeccable`):**
  - Preserva 100% do layout atual, mas unifica `tailwind.config.js` + `tokens.css` para ativar de verdade **Light, Dark e High-Contrast AAA**, corrige todas as classes Tailwind v4 -> v3, padroniza `min-h-[44px]` em todos os controles, migra os 5 modais manuais para `<app-ui-modal>`, adiciona estados de Loading/Error/Retry e remove dados falsos hardcoded.
- **Direção B — Portal Comunitário Caloroso & Editorial (`huashu-design` + `frontend-design`):**
  - Além das correções técnicas da Direção A, reforma a estética pública (`Home`, `Sou Novo`, `Horários`, `Estudos`) com tipografia display de maior contraste, layouts assimétricos (Bento Grid real na Home em vez de grades repetitivas de 3 colunas), remoção de eyebrows repetitivos e foco em fotografia real da comunidade.
- **Direção C — App-First PWA & Operação de Alta Densidade (`ui-ux-pro-max` + `mobile-design`):**
  - Transforma a experiência mobile pública e administrativa em um PWA com **Bottom Navigation Bar** na zona do polegar (4–5 itens principais: Início, Horários, Ao Vivo, Estudos, Mais) e converte os cards administrativos (`/admin/eventos`, `/admin/comunicados`, `/admin/oracoes`, `/admin/contatos`) em **Data Tables Anti-Slop** no desktop com **Card Stack automático** no mobile (`< 700px`), busca rápida, filtros com contadores `tabular-nums` e ações em lote.

---

## 🗺️ Parte 2: Diagnóstico Exaustivo Rota a Rota (18 Rotas + Shell + Shared UI)

### Bloco A — Shell Global e Componentes Compartilhados (`layout/` e `shared/ui/`)

| Componente / Arquivo | Problemas Identificados (`arquivo:linha`) | Severidade |
| :--- | :--- | :---: |
| **`index.html` / `styles.css` / `tokens.css` / `tailwind.config.js`** | • `tailwind.config.js:8-19`: cores `advent.*` hardcoded em hex, desconectadas de `tokens.css:19-186` (quebra Dark Mode e High-Contrast).<br>• `index.html:7`: falta `viewport-fit=cover` para safe areas.<br>• `index.html:38-42` e `header.component.ts:20-25`: skip-link `#conteudo` duplicado.<br>• `styles.css:56-64` e `tokens.css:210-227`: regra `prefers-reduced-motion` duplicada. | 🔴 P0 |
| **`HeaderComponent`** (`layout/header/header.component.ts`) | • `linhas 119, 130`: botões mobile de Busca e Hamburger têm `h-10 w-10` (`40x40px < 44px`).<br>• `linha 186`: botão fechar drawer tem `36x36px` (`< 44px`).<br>• `linha 174`: usa `animate-slideInRight` (inexistente no Tailwind config) e `z-50` literal.<br>• `linhas 214-302`: links do drawer mobile **não possuem `routerLinkActive` nem `aria-current="page"`**.<br>• `linha 91`: usa `shadow-2xs` (Tailwind v4) e `linha 99` usa `text-[10px]`. | 🔴 P0 |
| **`FooterComponent`** (`layout/footer/footer.component.ts`) | • `linhas 27-29`: horários sem `tabular-nums`.<br>• `linhas 33-83`: links do rodapé sem padding vertical (`16px-20px` de altura de toque `< 44px`).<br>• `linha 16`: `text-white/60` sobre `#003767` tem contraste limítrofe (~4.1:1). | 🟡 P2 |
| **`ModalComponent`** (`shared/ui/modal/modal.component.ts`) | • `linha 31`: usa `animate-scaleUp` (inexistente em `tailwind.config.js:47-51`; deveria ser `animate-modalSlideUp`) e `bg-white` hardcoded.<br>• `linha 26`: usa `aria-label` duplicando o `<h2>` da `linha 40` em vez de `aria-labelledby`. | 🟠 P1 |
| **`ToastContainerComponent`** (`shared/ui/toast/toast-container.component.ts`) | • `linha 10`: usa `z-50` (`50`) em vez de `z-[var(--z-toast)]` (`1000`), ficando **atrás** do `ModalComponent` (`z=400`).<br>• `linha 16`: usa `animate-slideLeft` (inexistente no Tailwind config).<br>• `linha 71`: botão fechar tem `24x24px` (`< 44px`).<br>• `toast.service.ts:20`: auto-dismiss de 4s não pausa no hover/focus. | 🔴 P0 |
| **`ButtonComponent`** (`shared/ui/button/button.component.ts`) | • `linhas 18-23`: tamanhos `sm` (~28px) e `md` (~40px) violam o alvo mínimo de `44px`.<br>• Host `<app-ui-button>` não repassa `aria-label` para o `<button>` interno e não aplica `aria-busy` durante `loading()`. | 🔴 P0 |
| **`ConfirmDialogComponent`** (`shared/ui/confirm-dialog/confirm-dialog.component.ts`) | • `linhas 50-66`: usa `[size]="'sm'"` nos botões "Cancelar" e "Confirmar" (~28px de altura em diálogo crítico).<br>• `linhas 22-27, 44`: cores hardcoded (`bg-red-100`, `text-slate-600`). | 🟠 P1 |
| **`GlobalSearchDialogComponent`** (`shared/ui/search/global-search-dialog.component.ts`) | • `linha 24`: modal manual com `z-50` e **sem Focus Trap**.<br>• `linhas 27, 56`: `aria-labelledby="search-modal-title"` aponta para o próprio `<input>` sem `<label>`.<br>• Classes Tailwind v4 inoperantes: `shadow-2xs`, `h-4.5 w-4.5`, `active:scale-98`.<br>• Tipografia `text-[9px]` (`linha 214`), `text-[10px]`, `text-[11px]` e alvos `< 44px` (`linhas 71, 83, 108, 124, 204`). | 🟠 P1 |
| **`DateTimePickerComponent`** (`shared/ui/datetime-picker/datetime-picker.component.ts`) | • `linhas 263-308`: setas `▲`/`▼` de hora/minuto com `text-[9px]` (~12x10px de área de toque) e sem `aria-label`.<br>• `linha 152`: dias do calendário com `32x32px` (`h-8 w-8`) e sem `tabular-nums`.<br>• `linha 94`: usa `z-50` em vez de `z-[var(--z-popover)]`. | 🟠 P1 |
| **`ImagePickerComponent`** (`shared/ui/image-picker/image-picker.component.ts`) | • `linhas 89-94`: barra mobile dedicada (`sm:hidden`) usa botões `size="sm"` (~28px) e passa `aria-label` no host `<app-ui-button>`.<br>• `linha 166`: input de URL com `text-xs` (12px, causa auto-zoom no iOS). | 🟡 P2 |
| **`BadgeComponent` & `SkeletonComponent`** | • `badge.component.ts:14-36` e `skeleton.component.ts:9`: cores `bg-slate-200` e `bg-*-100` hardcoded sem suporte a Dark Mode. | 🟡 P2 |

---

### Bloco B — Rotas Públicas (Rotas 1 a 9)

| Rota | Arquivo Principal | Principais Achados (`arquivo:linha`) | Severidade |
| :--- | :--- | :--- | :---: |
| **1. `/`** (Home) | `features/home/home.page.ts` | • `linhas 197-212`: `@if (horarios().length === 0)` exibe skeleton infinito se a coleção estiver vazia; falta Error State com retry.<br>• `linhas 46-48`: `hidden md:inline` esconde a descrição de comunicados urgentes no mobile.<br>• `linhas 124, 131, 239, 335, 467`: horários e contador sem `tabular-nums`.<br>• `linhas 40, 324, 471, 538, 546, 564`: uso de `text-[10px]` e `text-[11px]`.<br>• `linhas 51, 165, 189, 337, 366, 497, 556`: links/botões com alvo de toque `< 44px`.<br>• `linhas 662, 697`: cards de "Oração" e "Estudo Bíblico" apontam para `/contato` sem query param para abrir a aba correspondente. | 🟠 P1 |
| **2. `/horarios`** | `features/horarios/horarios.page.ts` | • `linhas 106, 137`: ausência total de Loading Skeleton, Empty State (`@empty`) e Error State.<br>• `linhas 110-121`: `text-amber-950` sobre `bg-amber-500/10` fica ilegível no Dark Mode.<br>• `linhas 65, 86, 117, 182`: pôr do sol, contador e horários sem `tabular-nums`.<br>• `linhas 199, 247, 265, 293, 345`: botões com `min-h-[38px]` / `min-h-[40px]` (`< 44px`).<br>• `linhas 572-610`: FAQ sem `aria-controls` e painel fechado sem `[inert]`. | 🟠 P1 |
| **3. `/ao-vivo`** | `features/ao-vivo/ao-vivo.page.ts` | • `linha 956` vs `765`: sinal `loading` é declarado mas nunca usado no template — exibe falso Empty State "Nenhuma mensagem encontrada" enquanto carrega.<br>• `linhas 381, 430`: classe inexistente `text-advent-blue-light`; `linhas 450, 475, 500, 525, 567, 611, 792`: classe Tailwind v4 `shadow-2xs`.<br>• `linhas 894-937`: modal de vídeo manual **sem Focus Trap**, sem foco inicial e sem restaurar foco.<br>• `linhas 791-799`: `<article role="button">` achata toda a semântica do card para leitores de tela.<br>• `linhas 458, 483, 508, 533, 810`: elementos `opacity-0 group-hover:opacity-100` invisíveis no mobile.<br>• `linha 1135`: `scrollBy({ behavior: 'smooth' })` ignora `prefers-reduced-motion`. | 🔴 P0 |
| **4. `/eventos`** | `features/eventos/eventos.page.ts` | • **Bug Funcional (`linhas 610-623`):** `getGoogleCalendarUrlForEvento` ignora a data específica do evento e agenda para a próxima ocorrência semanal genérica.<br>• **Classes Tailwind v4 quebradas:** `bg-linear-to-r` (`:43`), `lg:aspect-4/3` (`:135`), `focus:outline-hidden` (`:218, 229`).<br>• **ARIA Tabs quebrado (`linhas 154-205, 255, 404`):** mistura `aria-selected` com `aria-pressed`, falta `role="tabpanel"`, ID `encerrados-title` não existe, e a aba "Próximos" renderiza também a seção "Comunicados".<br>• `linhas 50, 59, 74, 78, 83, 88, 119, 129, 311, 333`: emojis literais sem `aria-hidden="true"`. | 🔴 P0 |
| **5. `/ministerios`** | `features/ministerios/ministerios.page.ts` + subcomponentes | • `ministerio-modal.component.ts:11-129`: modal manual **sem Focus Trap**, **sem fechar no `Escape`** e com classes Tailwind v4 (`backdrop-blur-xs`, `shadow-xs`).<br>• `ministerio-card.component.ts:27`: `bg-linear-to-r` (Tailwind v4); `linhas 42, 56, 63, 70`: ícones `material-symbols-outlined` sem `aria-hidden="true"` (leitor de tela lê `"star"`, `"group"`, `"schedule"` em inglês).<br>• `ministerios.page.ts:264-265`: loading fake com `setTimeout(..., 300)` desconectado do Firestore.<br>• `ministerios.page.ts:46-57, 68, 77, 135`: chips, busca (`text-sm` causa zoom no iOS) e botões `< 44px`. | 🔴 P0 |
| **6. `/estudos`** | `features/estudos/estudos.page.ts` + 4 componentes de abas | • **Sobrecarga Cognitiva em PGs (`estudos-pgs-tab.component.ts`):** 3 sistemas de filtro independentes (Wizard IA + Busca Semântica + Bairro/Perfil) que filtram listas diferentes na mesma tela.<br>• **Mobile UX no Estúdio de Versículos (`estudos-versiculo-tab.component.ts:843`):** Live Preview fica a >1500px de scroll dos controles no celular.<br>• **Acessibilidade:** inputs de busca sem `<label>` nem `aria-label` (`estudos-versiculo-tab.component.ts:171, 574`); sub-abas sem `role="tab"` (`:315-349`); modal de preview (`:1107`) sem Focus Trap e sem `Escape`.<br>• Mais de 25 ocorrências de `text-[9px]`, `text-[10px]` e `text-[11px]` e alvos `< 44px`. | 🟠 P1 |
| **7. `/sou-novo`** | `features/sou-novo/sou-novo.page.ts` | • `linhas 174-189`: respostas fechadas do FAQ usam `grid-rows-[0fr] opacity-0` mas **não usam `[inert]="!isExpanded(faq.id)"`**, sendo lidas por leitores de tela mesmo fechadas.<br>• `linhas 54, 71, 88, 105`: cards estáticos não-clicáveis têm efeito `hover:-translate-y-1 hover:shadow-md`.<br>• `linha 197`: `bg-linear-to-br` e `linha 227`: `shadow-xs` (Tailwind v4). | 🟡 P2 |
| **8. `/contato`** | `features/contato/contato.page.ts` | • **Bug Funcional de Validação (`linhas 555, 582-599`):** `formatPhone` aplica máscara `(15) 9999-99` (12 chars) com `emitEvent: false`, fazendo telefones incompletos de 6–8 dígitos passarem no `Validators.minLength(10)`.<br>• **Fricção de Submit (`linhas 245, 344, 470`):** `[disabled]="...Form.invalid"` impede clicar em Enviar para revelar quais campos faltam.<br>• **ARIA quebrado (`linhas 166, 191, 232...`):** `aria-describedby="...-erro"` aponta para IDs que não existem no DOM quando o campo é válido.<br>• `linhas 43-96`: abas com `pb-3` sem `pt-*` (~32px de altura `< 44px`). | 🔴 P0 |
| **9. `/**` (404)** | `features/not-found/not-found.page.ts` | • **Bug de SPA (`linhas 24-35`):** usa `<a href="/">` e `<a href="/horarios">` nativos em vez de `routerLink`, forçando reload completo do navegador ao sair da 404. | 🔴 P0 |

---

### Bloco C — Rotas Administrativas (Rotas 10 a 18 + Layout Admin)

| Rota Admin | Arquivo Principal | Principais Achados (`arquivo:linha`) | Severidade |
| :--- | :--- | :--- | :---: |
| **Layout Admin** | `features/admin/layout/admin-layout.component.ts` | • **Bug Mobile (`linhas 48-51, 157-190`):** atributo `class` duplicado no `<nav>`, menu mobile não fecha ao clicar em rota, e o rodapé de perfil/logout fica permanentemente aberto no topo da tela mobile ocupando ~180px.<br>• 9 itens de menu sem agrupamento semântico (Lei de Miller) e com altura ~40px (`< 44px`).<br>• `linha 173`: link `target="_blank"` sem `rel="noopener noreferrer"`. | 🔴 P0 |
| **10. `/admin/login`** | `features/admin/login/admin-login.page.ts` | • `linhas 91-126`: campos de e-mail e senha têm validadores, mas **não exibem nenhuma mensagem de erro inline** no template e bloqueiam o botão sem explicação.<br>• `linhas 109, 138`: botões "Esqueci a senha" e "Voltar" com ~16px de altura (`< 44px`).<br>• `linhas 99, 123`: `text-sm` (14px) causa auto-zoom no iOS Safari. | 🟠 P1 |
| **11. `/admin`** (Dashboard) | `features/admin/dashboard/admin-dashboard.page.ts` | • **Dados Falsos no Fallback (`linhas 255-269`):** se uma query falhar, exibe contadores fictícios hardcoded (`eventos: 3, comunicados: 2, pgs: 6, oracoes: 2`).<br>• `linhas 79, 98, 117, 136`: KPIs numéricos sem `tabular-nums`.<br>• `linhas 27, 37`: botões "+ Novo Evento" e "+ Novo Comunicado" navegam para a lista mas não abrem o modal de criação. | 🔴 P0 |
| **12. `/admin/eventos`** | `features/admin/eventos/admin-eventos.page.ts` | • **Travamento de Skeleton (`linhas 526-535`):** `loadEventos()` não tem `try/catch/finally` — se falhar, o skeleton nunca termina.<br>• **Falso Sucesso (`linhas 638-645`):** no `catch` de falha do Firestore, adiciona o evento na memória local, mostra toast info e fecha o modal.<br>• Modal com 13 campos sem paginação/abas e botões com `min-h-[36px]` (`< 44px`). | 🔴 P0 |
| **13. `/admin/comunicados`** | `features/admin/comunicados/admin-comunicados.page.ts` | • **Funcionalidade Ausente (`linhas 96-117`):** **não existe botão nem fluxo de Editar comunicado** (apenas Pausar e Excluir).<br>• **Travamento de Skeleton (`linhas 252-261`):** `loadComunicados()` sem `try/catch/finally`.<br>• `linhas 305-317`: `toggleStatus()` exibe toast de sucesso **antes** do `await` e ignora erros no `catch {}`. | 🔴 P0 |
| **14. `/admin/pgs`** | `features/admin/pgs/admin-pgs.page.ts` | • **Modal Manual Inacessível (`linhas 170-381`):** não usa `<app-ui-modal>`, sem Focus Trap, sem fechar no backdrop.<br>• `linha 481`: `savePg()` retorna se inválido sem chamar `markAllAsTouched()`.<br>• `linhas 133, 142, 157`: botões de card com `min-h-[34px]` (`< 44px`). | 🟠 P1 |
| **15. `/admin/oracoes`** | `features/admin/oracoes/admin-oracoes.page.ts` | • **Bug Crítico de Dados Falsos em Produção (`linhas 240-263`):** quando a coleção de orações está vazia no Firestore, injeta 2 pedidos fictícios (`Maria Silva` e `Carlos Santos` com WhatsApp falso), tornando o Empty State inalcançável e induzindo pastores a enviarem mensagem para números falsos.<br>• Não exibe a data de envio do pedido e não permite reverter de "Orado" para "Pendente". | 🔴 P0 |
| **16. `/admin/contatos`** | `features/admin/contatos/admin-contatos.page.ts` | • `linhas 295-297`: erro de rede cai no Empty State "Nenhuma mensagem recebida" sem botão de retry.<br>• `linhas 164-243`: 5 botões de ação por card com `min-h-[36px]` (`< 44px`) e sem data de recebimento exibida. | 🟠 P1 |
| **17. `/admin/horarios`** | `features/admin/horarios/admin-horarios.page.ts` | • **2 Modais Manuais (`linhas 338-473, 476-591`):** não usam `<app-ui-modal>`, não têm Focus Trap nem `overflow-y-auto`, cortando o `<app-ui-datetime-picker>` em telas menores.<br>• `linhas 77-83, 202-208`: botões duplicados com ~16px de altura logo abaixo dos botões do header.<br>• `linhas 155, 164, 179`: botões de ação com `min-h-[32px]` (`< 44px`). | 🟠 P1 |
| **18. `/admin/escalas`** | `features/admin/escalas/admin-escalas.page.ts` | • **Travamento de Skeleton (`linhas 474-513`):** `loadEscalas()` sem `try/catch/finally`.<br>• `linhas 193-215`: botões "Copiar WhatsApp", "Editar" e "Excluir" têm `18px-24px` de altura (`< 44px`) e não possuem `aria-label` contextual.<br>• `linhas 631, 659`: `navigator.clipboard.writeText` chamado sem `await`.<br>• `linha 152`: data exibida em formato ISO cru (`YYYY-MM-DD`). | 🔴 P0 |
| **19. `/admin/ministerios`** | `features/admin/ministerios/admin-ministerios.page.ts` | • **Travamento de Skeleton (`linhas 430-440`):** `loadMinisterios()` sem `try/catch/finally`.<br>• **Falso Sucesso (`linhas 538-561`):** falha no Firestore salva apenas em memória local e fecha o modal.<br>• *(Positivo)*: única página admin onde os botões dos cards (`linhas 154, 162`) já respeitam `min-h-[44px]`. | 🟠 P1 |

---

## 🛠️ Plano de Ação Recomendado (Em Ondas Atômicas)

1. **Onda 1 — Fundação do Design System, Tailwind v3/v4 & Temas (`P0`):**
   - Conectar `tailwind.config.js` às variáveis de `tokens.css` (Light, Dark e High-Contrast AAA).
   - Substituir todas as classes Tailwind v4 (`bg-linear-to-*`, `shadow-2xs`, `shadow-xs`, `backdrop-blur-xs`, `focus:outline-hidden`, `h-4.5`, `active:scale-98`, `text-advent-blue-light`) pelas classes equivalentes do Tailwind v3.
   - Registrar os keyframes faltantes (`slideInRight`, `scaleUp`, `slideLeft`) e unificar os tokens `--z-*` em `HeaderComponent`, `ToastContainerComponent`, `DateTimePickerComponent` e modais.
2. **Onda 2 — Correção de Bugs Funcionais, Acessibilidade & Modais (`P0`):**
   - Remover os dados falsos hardcoded de `/admin/oracoes` e `/admin/dashboard`; adicionar `try/catch/finally` + Error State com botão Retry em todas as páginas admin e públicas.
   - Corrigir o `AdminLayoutComponent` mobile (atributo `class` duplicado, fechamento ao navegar e ocultação do rodapé de usuário quando fechado).
   - Adicionar fluxo de Edição em `/admin/comunicados`, corrigir `routerLink` na página 404, corrigir cálculo de data do Google Calendar em `/eventos` e validação de dígitos reais do telefone em `/contato`.
   - Migrar os 5 modais manuais para `<app-ui-modal>` (Focus Trap + Escape + restauração de foco) e corrigir ARIA Tabs/Accordions (`[inert]` no FAQ fechado).
3. **Onda 3 — Ergonomia Mobile (Touch Targets >= 44px), Tipografia (`tabular-nums`) & Anti-Slop (`P1/P2`):**
   - Elevar `ButtonComponent` (`sm`/`md`), `HeaderComponent`, `DateTimePickerComponent` e botões de ação admin/públicos para área de toque `>= 44x44px` e inputs para `16px` no mobile (anti-zoom iOS).
   - Substituir `text-[9px]`/`text-[10px]`/`text-[11px]` pela escala `rem`, aplicar `tabular-nums` em todos os horários/contadores/KPIs, remover hover scale de `<img>`, substituir emojis de UI por SVGs com `aria-hidden="true"` e habilitar `withViewTransitions()` no roteador.
