# Especificação Técnica (Spec) — Revisão e Remediação Geral de Design, UI/UX, Mobile & Motion (18 Rotas)

- **Artefato:** `docs/ai/specs/2026-11-10-revisao-geral-design-rotas-design.md`
- **Relatório de Origem:** `docs/ai/reports/2026-11-10-revisao-geral-design-rotas.md`
- **Padrão Normativo:** `docs/ai/specs/` e `docs/ai/plans/` (Harness Nível 3 CPB & Governança de ADRs em `docs/adrs/`)
- **Data:** 10 de Novembro de 2026
- **Branch Alvo:** `feat/redesign`
- **Status:** Aprovado pelo Usuário (Risk Score 0/100 no `/plan-criticize`)
- **Decisões da Sabatina Socrática Homologadas:**
  1. **Temas CSS:** Ponte CSS + Tailwind (`styles.css` + `tokens.css` + `tailwind.config.js`), preservando modificadores `/opacity` e garantindo suporte a Light, Dark e High-Contrast AAA.
  2. **Invariante de Falha:** Erro Explícito + Retry (remoção de dados falsos hardcoded quando banco vazio/erro, preservação de modal aberto em erro de save e estado de erro explícito com botão de Retry).
  3. **Escopo de Execução:** Aprovação integral para execução das 3 Ondas Atômicas.

---

## 1. Contexto, Escopo Core & Questionário Canônico dos 10 Eixos (`/plan-criticize`)

### 1.1. Respostas aos 10 Eixos Canônicos de Estresse
1. **O que estamos construindo?**
   - A unificação arquitetural e correção visual, ergonômica (mobile-first), cognitiva e de acessibilidade (WCAG 2.2 AA/AAA) das **18 rotas** do portal público (9 rotas) e painel administrativo (9 rotas + layout) da `IASD-Mangueiras`, mais o Shell Global e os 11 componentes de `shared/ui/`.
2. **Quais são as restrições técnicas e limites operacionais?**
   - **Zero novas dependências de runtime (`0 KB` de acréscimo em `package.json`):** Proibido instalar bibliotecas externas de UI ou animação (como Angular Material, PrimeNG ou GSAP pesado) se CSS nativo, Tailwind v3 e APIs do Angular 22 (`withViewTransitions()`) resolverem (Princípio Ponytail / Navalha de Ockham).
   - **Orçamento de Performance & Core Web Vitals:** LCP `< 2.5s`, CLS `< 0.1` (zero layout shift via `tabular-nums` e dimensões reservadas), INP `< 200ms`, animações restritas a `transform` e `opacity` a `60fps` (`<= 16.6ms` por frame).
   - **Segurança Defensiva Zero-Trust:** Preservação integral das regras de `firestore.rules`, validação de magic bytes no upload (`AdminCmsService`), links externos com `rel="noopener noreferrer"` e zero exposição de PII ou dados falsos em produção.
   - **Governança de ADRs (`docs/adrs/`):** Mantém a decisão arquitetural de Design System In-House com Tailwind CSS + CSS Custom Properties (`tokens.css`), sem quebrar URLs ou slugs de SEO.
3. **Quais são os casos de borda e invariantes?**
   - **Invariante 1 (Paridade Multi-Tema):** Toda superfície e texto deve manter contraste `>= 4.5:1` (AA) nos temas Light e Dark, e `>= 7.0:1` (AAA) no tema High-Contrast, tanto via `@media (prefers-color-scheme: dark)` / `@media (prefers-contrast: more)` quanto via classes `.dark` e `.high-contrast`.
   - **Invariante 2 (Hierarquia de Camadas `--z-*`):** Nenhum componente pode usar `z-50` mágico; `ToastContainerComponent` (`--z-toast: 1000`) e `DateTimePickerComponent` (`--z-popover: 500`) devem sempre sobrepor `ModalComponent` (`--z-modal: 400`) e `HeaderComponent` (`--z-sticky: 100`, `--z-drawer: 200`, `--z-backdrop: 300`).
   - **Invariante 3 (Resiliência dos 5 Estados):** Nenhuma falha do Firestore/YouTube pode travar o componente em skeleton infinito (`isLoading = true` eterno) nem exibir dados falsos hardcoded (`Maria Silva` em `/admin/oracoes` ou contadores fictícios em `/admin`).
   - **Invariante 4 (Acessibilidade de Diálogos e Accordions):** Todo modal aberto deve prender o foco (`Focus Trap`), fechar com `Escape` e restaurar o foco ao elemento gatilho; todo painel de FAQ colapsado (`aria-expanded="false"`) deve receber `[inert]="true"`.
4. **Quais são as 3 formas possíveis de resolver isso?**
   - Contrastadas na **Matriz de 3 Alternativas (Seção 2)** abaixo.
5. **Qual delas escolhemos e por quê?**
   - **Abordagem B (Evolução Estrutural In-House + View Transitions Nativas):** Corrige 100% dos bugs funcionais, de temas, de Tailwind v3/v4, de acessibilidade e de ergonomia mobile tocando apenas na camada de apresentação e estado local dos componentes existentes, sem reescrever rotas do zero e sem inflar o bundle.
6. **Crítica ao próprio plano (Onde há otimismo excessivo?):**
   - **Risco de Regressão em Testes Existentes:** Há 45 arquivos de teste (`270` testes unitários Vitest + suíte E2E Playwright axe-core). Alterar a estrutura de DOM de modais manuais (`admin-pgs`, `admin-horarios`, `ao-vivo`, `ministerio-modal`) para `<app-ui-modal>` ou alterar o comportamento de fallback de `admin-dashboard` e `admin-oracoes` pode quebrar specs unitários que assertem o comportamento antigo (ex.: testes que esperavam os 2 pedidos falsos de oração quando o Firestore retorna `[]`).
7. **O que poderíamos ter deixado passar (Blind Spots)?**
   - **Mapeamento de Opacidade do Tailwind com `var(--...)`:** Se `tailwind.config.js` mapear `advent.blue: 'var(--color-primary)'` como hex puro, modificadores de opacidade do Tailwind como `bg-advent-blue/10` ou `ring-advent-blue/30` **quebram** no Tailwind v3! *Solução:* Manter os tokens com suporte a canal alpha ou mapear apenas superfícies/textos semânticos (`surface-canvas`, `surface-card`, `text-primary`, `text-muted`, `border-default`) e definir overrides semânticos em `styles.css` para `.dark` e `.high-contrast`.
8. **Contraste com alternativa Lean:**
   - Uma solução puramente cosmética (apenas trocar classes CSS sem corrigir os modais manuais, os `try/catch/finally` faltantes e os dados falsos no Admin) deixaria bugs P0 ativos em produção.
9. **Pre-Mortem ("Quebrou às 3h da manhã em Produção"):**
   - Detalhado na **Seção 3 (Pre-Mortem & Casos de Borda Blindados)**.
10. **Comparação de Manutenibilidade e Reversibilidade:**
   - A Abordagem B divide a entrega em **3 Ondas Atômicas independentes**, permitindo `git revert` cirúrgico por onda sem afetar o restante do sistema.

---

## 2. Matriz de 3 Alternativas de Arquitetura de UI/UX

| Dimensão | Abordagem A: Cosmética / Mínima (Patch CSS) | Abordagem B: Evolução Estrutural Canônica (Recomendada — Ockham/Ponytail) | Abordagem C: Overhaul Completo (PWA Bottom Nav + Data Tables + GSAP) |
| :--- | :--- | :--- | :--- |
| **Sistema de Temas (`Light` / `Dark` / `High-Contrast`)** | Forçar `color-scheme: light only` no `index.html` e desativar o Dark Mode em `tokens.css`. | **Conectar superfícies e textos aos tokens de `tokens.css` (`var(--surface-card)`, `var(--text-primary)`), preservando os modificadores `/opacity` do Tailwind e garantindo 3 temas reais.** | Reescrever 100% dos templates adicionando pares `dark:*` e `contrast-more:*` manual em cada uma das 18 páginas (+800 linhas de diff). |
| **Modais & Overlays (5 Modais Manuais)** | Adicionar apenas `z-[var(--z-modal)]` nas `<div>` manuais sem Focus Trap. | **Reutilizar o componente existente `<app-ui-modal>` (que já possui Focus Trap, `Escape`, `h-11 w-11` e restauração de foco) nas 5 telas que criaram modais manuais.** | Instalar `@angular/cdk/dialog` ou `@angular/material/dialog` e refatorar todos os diálogos do sistema. |
| **Animação & Motion (`/animacao`)** | Remover as classes de animação quebradas e deixar o sistema estático. | **Registrar `slideInRight`, `scaleUp` e `slideLeft` em `tailwind.config.js`, ativar `withViewTransitions()` no `app.config.ts` e aplicar `--stagger-index` leve em CSS.** | Instalar `gsap` + `ScrollTrigger` + `three` para criar scroll-hijacking (Sticky-Stack) e shaders WebGL na Home e Sou Novo. |
| **Listagens Admin & Mobile UX** | Apenas aumentar `min-h-[44px]` nos botões atuais. | **Corrigir `AdminLayoutComponent` mobile, remover dados falsos, adicionar `try/catch/finally` + Error Retry, adicionar edição em Comunicados e padronizar `min-h-[44px]` + `tabular-nums`.** | Converter todas as 8 listagens do Admin em Data Tables enterprise com Bulk Actions e criar Bottom Tab Bar pública. |
| **Custo / Blast Radius** | Baixo, mas viola o requisito multi-tema do `AGENTS.md` e mantém modais inacessíveis. | **Médio, zero novas dependências, 100% aderente ao `AGENTS.md` e testável por ondas.** | Alto (exige nova ADR, aumenta bundle e reescreve 18 telas). |

---

## 3. Pre-Mortem ("Incidente às 3h da Manhã") & Casos de Borda Blindados

1. **Modo de Falha 1 — Quebra de Classes `bg-advent-blue/10` ao usar CSS Variables no Tailwind v3:**
   - *Causa:* No Tailwind v3, `background-color: rgb(var(--color) / <alpha-value>)` exige que a variável contenha canais RGB separados (`0 55 103`), enquanto `tokens.css` define hexadecimais (`#003767`). Se apontarmos `advent.blue: 'var(--color-primary)'`, todas as classes com barra de opacidade (`bg-advent-blue/5`, `ring-advent-blue/30`, `border-advent-blue/20`) geram CSS inválido!
   - *Blindagem:* Manter `advent.blue`, `advent.gold` e `advent.dark` com seus valores em `tailwind.config.js` (para preservar `/10`, `/20`, `/30`), e mapear `advent.white: 'var(--surface-card)'`, `advent.neutral: 'var(--surface-subtle)'`, `advent.border: 'var(--border-default)'`, `advent.text: 'var(--text-primary)'`, `advent.muted: 'var(--text-secondary)'` (ou aplicar camada semântica global em `styles.css` para `.bg-white`, `.bg-slate-50` sob `.dark` e `.high-contrast`).
2. **Modo de Falha 2 — Quebra de Testes Unitários (`npm test`) ao Remover Fallback de Dados Falsos em `AdminDashboardPage` e `AdminOracoesPage`:**
   - *Causa:* Testes unitários existentes em `admin-dashboard.page.spec.ts` ou `admin-oracoes.page.spec.ts` podem testar o cenário em que `cmsService` retorna `[]` ou rejeita e verificar se os itens de fallback aparecem.
   - *Blindagem:* Inspecionar e atualizar imediatamente os arquivos `.spec.ts` correspondentes na mesma onda para que validem o novo comportamento correto (Empty State real quando `[]` e Error Banner com botão de Retry quando a Promise rejeitar).
3. **Modo de Falha 3 — `withViewTransitions()` no Angular Router com SSR / Testes Unitários:**
   - *Causa:* Em navegadores sem suporte a `document.startViewTransition` ou durante SSR/Vitest, transições de rota mal configuradas poderiam lançar erro.
   - *Blindagem:* O `withViewTransitions({ skipInitialTransition: true })` nativo do `@angular/router` já faz feature-detection automática (`if (!document.startViewTransition)`) e é 100% seguro em SSR e JSDOM.
4. **Modo de Falha 4 — Validação de Telefone em `/contato` (`contato.page.ts:555,598`):**
   - *Causa:* `formatPhone()` usa `setValue(formatted, { emitEvent: false })` e `Validators.minLength(10)` conta parênteses, espaço e hífen da máscara `(15) 9999-99` (12 caracteres para apenas 8 dígitos!).
   - *Blindagem:* Substituir `Validators.minLength(10)` por `Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)` (exigindo 10 ou 11 dígitos reais formatados) e remover `{ emitEvent: false }` (ou chamar `control.updateValueAndValidity()`).

---

## 4. Plano Técnico de Implementação Dividido em 3 Ondas Atômicas

### Onda 1 — Fundação do Design System, Tailwind v3/v4, Z-Index, Motion & Shell (`P0`)
1. **`frontend/tailwind.config.js` & `frontend/src/styles.css` & `frontend/src/tokens.css`:**
   - Conectar os tokens `advent.white`, `advent.neutral`, `advent.border`, `advent.text` e `advent.muted` às variáveis semânticas de `tokens.css` e criar regras de adaptação de superfície para Dark Mode e High-Contrast AAA.
   - Adicionar os keyframes e animações faltantes em `tailwind.config.js`: `slideInRight`, `scaleUp` e `slideLeft`.
   - Adicionar `text-advent-blue-light: '#38bdf8'` em `tailwind.config.js`.
   - Remover a duplicata de `@media (prefers-reduced-motion: reduce)` entre `styles.css` e `tokens.css`.
2. **Correção Global de Utilitários Tailwind v4 -> v3:**
   - Substituir `bg-linear-to-*` por `bg-gradient-to-*`, `shadow-2xs`/`shadow-xs` por `shadow-sm`, `backdrop-blur-xs` por `backdrop-blur-sm`, `lg:aspect-4/3` por `lg:aspect-[4/3]`, `focus:outline-hidden` por `focus:outline-none focus-visible:ring-2 focus-visible:ring-advent-blue`, `h-4.5 w-4.5` por `h-[18px] w-[18px]` e `active:scale-98` por `active:scale-[0.98]`.
3. **Unificação da Escala `--z-*` e Shell Global (`index.html`, `app.html`, `app.config.ts`, `header.component.ts`, `toast-container.component.ts`, `datetime-picker.component.ts`):**
   - `index.html:7`: adicionar `viewport-fit=cover` e remover o skip-link duplicado (mantendo o do `HeaderComponent` / `AdminLayoutComponent` com `z-[var(--z-toast)]`).
   - `app.html`: envolver `<app-header>`, `<div class="flex-1"><router-outlet /></div>` e `<app-footer>` em `<div class="flex min-h-dvh flex-col">`.
   - `app.config.ts`: ativar `withViewTransitions({ skipInitialTransition: true })` em `provideRouter`.
   - `toast-container.component.ts:10`: trocar `z-50` por `z-[var(--z-toast)]`, pausar timer no `mouseenter`/`focusin`, usar `role="alert"` para erros e aumentar botão fechar para `min-h-[44px] min-w-[44px]`.
   - `header.component.ts`: aplicar `z-[var(--z-sticky)]`, `z-[var(--z-backdrop)]`, `z-[var(--z-drawer)]`, elevar botões mobile (`Busca`, `Hamburger`, `Fechar`) para `h-11 w-11` (`44x44px`), adicionar `routerLinkActive` nos links do drawer mobile e `pb-[max(1.5rem,env(safe-area-inset-bottom))]`.
   - `button.component.ts`: garantir `min-h-[44px]` nas variantes `sm` e `md`, `[attr.aria-busy]="loading()"` e `aria-hidden="true"` no spinner SVG.

### Onda 2 — Bugs Funcionais, Resiliência de Estados & Acessibilidade nas 9 Rotas Públicas (`P0/P1`)
1. **Rota 9 (`/**` — `not-found.page.ts`):**
   - Importar `RouterLink` e substituir `href="/"` e `href="/horarios"` por `routerLink="/"` e `routerLink="/horarios"`.
2. **Rota 8 (`/contato` — `contato.page.ts`):**
   - Corrigir validação de telefone (`Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)`), permitir clique no submit com `markAllAsTouched()` + foco no primeiro campo inválido, vincular `[attr.aria-describedby]` apenas quando o erro estiver visível, elevar abas para `min-h-[44px]` e ler query param `?aba=oracao|estudo` para pré-selecionar a aba vinda da Home.
3. **Rota 4 (`/eventos` — `eventos.page.ts`):**
   - Corrigir `getGoogleCalendarUrlForEvento(evento)` para usar a data real `evento.data_inicio` / `evento.data_fim` em vez do próximo dia da semana genérico.
   - Corrigir semântica WAI-ARIA Tabs (`role="tabpanel"`, `id` correto, remover `aria-pressed` duplicado e separar a seção "Comunicados" da aba "Próximos").
   - Adicionar `aria-hidden="true"` nos ícones/emojis decorativos e `tabular-nums` nas datas/contadores.
4. **Rota 3 (`/ao-vivo` — `ao-vivo.page.ts`):**
   - Conectar o signal `loading()` no template para exibir Skeleton antes do Empty State.
   - Migrar o modal de vídeo manual (`:894-937`) para `<app-ui-modal>` (ou aplicar Focus Trap + restauração de foco + `z-[var(--z-modal)]`).
   - Respeitar `window.matchMedia('(prefers-reduced-motion: reduce)').matches` no `scrollBy` do carrossel e tornar badges visíveis em telas touch (`opacity-100 sm:opacity-0 sm:group-hover:opacity-100`).
5. **Rota 5 (`/ministerios` — `ministerios.page.ts`, `ministerio-card.component.ts`, `ministerio-modal.component.ts`):**
   - Adicionar `aria-hidden="true"` em todos os `<span class="material-symbols-outlined">`.
   - Adicionar Focus Trap, fechamento via `Escape`, restauração de foco e `z-[var(--z-modal)]` em `MinisterioModalComponent`.
   - Elevar chips de categoria e busca para `min-h-[44px]` e `text-base sm:text-sm` no input de busca.
6. **Rotas 1, 2, 6 e 7 (`/`, `/horarios`, `/estudos`, `/sou-novo`):**
   - `home.page.ts`: exibir descrição do comunicado urgente também no mobile, adicionar query params nos links de Oração (`/contato?aba=oracao`) e Estudo (`/contato?aba=estudo`), aplicar `tabular-nums` nos contadores/horários e remover hover zoom de `<img>`.
   - `horarios.page.ts`: adicionar bloco `@empty`, `tabular-nums`, `min-h-[44px]` nos botões de agenda/WhatsApp/endereço e `[inert]="!isExpanded(i)"` no FAQ.
   - `sou-novo.page.ts`: adicionar `[inert]="!isExpanded(faq.id)"` nos painéis fechados do FAQ e remover hover de elevação nos 4 cards estáticos não-clicáveis.
   - `estudos.page.ts` & sub-abas: adicionar `role="tabpanel"`, `aria-label` nos inputs de busca, `aria-hidden="true"` nos emojis, `Escape` + Focus Trap no modal de preview de versículo e botão de atalho mobile "Ver Preview ↓" no Estúdio de Versículos.

### Onda 3 — Correção Estrutural, Confiabilidade e Mobile nas 10 Rotas Administrativas (`P0/P1`)
1. **`AdminLayoutComponent` (`admin-layout.component.ts`):**
   - Unificar o atributo `class` duplicado no `<nav>`, fechar o menu mobile automaticamente ao clicar em qualquer link (`(click)="isMobileMenuOpen.set(false)"`), incluir o rodapé do perfil/logout dentro da área colapsável no mobile e adicionar `rel="noopener noreferrer"` no link "Ver site ↗".
2. **Remoção de Dados Falsos e Adição de `try/catch/finally` + Error Retry:**
   - `admin-oracoes.page.ts`: remover a injeção dos 2 pedidos falsos (`Maria Silva` e `Carlos Santos`) quando o Firestore retorna vazio, liberando o Empty State verdadeiro.
   - `admin-dashboard.page.ts`: remover os números falsos no `catch`, exibir banner de erro com botão "Tentar novamente" e aplicar `tabular-nums` nos 4 KPIs.
   - `admin-eventos.page.ts`, `admin-comunicados.page.ts`, `admin-horarios.page.ts`, `admin-escalas.page.ts`, `admin-ministerios.page.ts`: envolver carregamentos em `try/catch/finally` (impedindo skeleton infinito) e não fechar o modal fingindo sucesso quando `save*()` falhar no Firestore.
3. **Funcionalidades Faltantes, Modais Manuais e Touch Targets no Admin:**
   - `admin-comunicados.page.ts`: adicionar botão e fluxo de **Editar Comunicado** (reutilizando o modal de criação populado).
   - `admin-pgs.page.ts` e `admin-horarios.page.ts`: migrar os 3 modais manuais para `<app-ui-modal>` (ganhando Focus Trap, `Escape`, backdrop click e `overflow-y-auto`).
   - `admin-login.page.ts`: exibir mensagens de erro inline nos campos `email` e `password` quando inválidos e tocados, e usar `text-base sm:text-sm` nos inputs.
   - `admin-escalas.page.ts`: aguardar `await navigator.clipboard.writeText(text)`, formatar data `YYYY-MM-DD` para `DD/MM/YYYY`, adicionar `aria-label` contextual e elevar botões de ação para `min-h-[44px]`.

---

## 5. Estratégia de Testabilidade, Critérios de Aceite (BDD) & Verificação

### 5.1. Critérios de Aceite Mensuráveis (Gherkin BDD)

```gherkin
Funcionalidade: Conformidade Total de Design, Temas, Mobile e Acessibilidade nas 18 Rotas

  Cenário 1: Paridade dos 3 Temas e Escala de Z-Index (Onda 1)
    Dado que o usuário alterna para Dark Mode (.dark) ou Alto Contraste (.high-contrast)
    Quando qualquer rota pública ou administrativa é renderizada
    Então cards e superfícies devem refletir var(--surface-card) e textos var(--text-primary) com contraste >= 4.5:1 (AA) / >= 7:1 (AAA)
    E toasts disparados com um modal aberto devem aparecer acima do modal (z-index 1000 > 400)

  Cenário 2: Navegação SPA, Agendamento Real e Validação de Telefone nas Rotas Públicas (Onda 2)
    Dado que o usuário está na página 404, em /eventos ou em /contato
    Quando clica em "Voltar para o Início" na 404, em "Google Agenda" em um evento futuro ou digita um telefone incompleto em /contato
    Então a navegação na 404 deve ocorrer via Angular Router sem recarregar a página
    E a URL do Google Calendar deve conter as datas reais (data_inicio/data_fim) do evento
    E o formulário de /contato deve rejeitar telefones com menos de 10 dígitos numéricos reais exibindo erro inline

  Cenário 3: Integridade Operacional e Mobile no Painel Administrativo (Onda 3)
    Dado que o administrador acessa /admin/oracoes com banco vazio ou /admin/comunicados no celular
    Quando a página carrega ou o administrador navega pelo menu mobile
    Então /admin/oracoes deve exibir o Empty State real sem pedidos fictícios
    E /admin/comunicados deve permitir editar um comunicado existente
    E o menu mobile do AdminLayout deve fechar automaticamente ao selecionar uma rota
```

### 5.2. Pirâmide de Testes & Comandos de Verificação Determinística

```bash
# 1. Auditoria Estática de Acessibilidade, UX e Mobile
python3 .claude/skills/design-review/scripts/accessibility_checker.py frontend/src
python3 .claude/skills/design-review/scripts/ux_audit.py frontend/src
python3 .claude/skills/mobile-design/scripts/mobile_audit.py frontend/src

# 2. Linters de Arquitetura, CSS e Typecheck Estrito
npm --prefix frontend run lint:deps
npm --prefix frontend run lint:css
npm --prefix frontend run typecheck

# 3. Suíte Completa de Testes Unitários (Vitest — 45+ arquivos) e Build SSR/Browser
npm --prefix frontend run test:ci
npm --prefix frontend run build

# 4. Atualização do Grafo de Conhecimento
graphify update .
```

---

## 6. Reversibilidade & Procedimento de Rollback

Como a implementação é particionada em **3 Ondas Atômicas** sem alterações destrutivas de banco de dados:
```bash
# Reverter apenas a última onda caso ocorra regressão visual:
git revert HEAD

# Ou restaurar arquivo específico da branch base:
git checkout HEAD~1 -- frontend/src/path/to/file.ts
```
