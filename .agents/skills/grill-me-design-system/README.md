
# 🎨 Design System Grill Orchestrator (`grill-me-design-system`)

Skill de sabatina técnica progressiva e estruturada para concepção, blindagem e compilação de **Design Systems**, tokens semânticos multi-tema (Claro, Escuro e Alto Contraste WCAG 2.2 AAA) e geração automática de **Showcase Standalone em HTML**.

---

## 🎯 Finalidade da Skill

Esta skill atua na persona de um **Designer Web & Especialista em UI/UX Sênior**, conduzindo o usuário através das **7 Dimensões Canônicas de Design de Interface** adaptáveis a múltiplos formatos (SaaS B2B, Dashboards Analíticos, E-Commerce, Chat/Comunicação, Mobile Apps e Ferramentas Internas):

0. **Arquétipo & Propósito de Aplicação:** Calibração inicial do formato do produto (SaaS, Atendimento, E-Commerce, Portais ou Mobile).
1. **Identidade Visual & Proporção Cromática:** Regra Áurea 60-30-10, código HEX institucional exato e cores semânticas de feedback (WCAG AAA).
2. **Superfícies Multi-Tema & Alto Contraste:** Canvas e cards para temas Claro, Escuro (com elevação por luminosidade) e Alto Contraste (preto puro `#000000` com suporte a `forced-colors: active`).
3. **Tipografia Proporcional rem & Iconografia:** Escala proporcional em `rem`, suporte estrito a `tabular-nums` em métricas e catálogo oficial de ícones (Heroicons ou Material Symbols).
4. **Arquitetura de Layout, Navegação & Espaçamento:** Opções flexíveis de navegação (Sidebar retrátil, Dual-Rail, Top Header ou Bottom Bar), grid modular de 4px/8px e escala canônica de z-index de 8 níveis (`--z-base` a `--z-toast`).
5. **Componentes Core, Botões, Form Controls & Padrões de Domínio:** Botões com touch target $\ge 44\text{px}$, **matriz completa de botões em estado de Loading anti-CLS** (Primary, Secondary, Danger, Ghost, Icon), campos acessíveis, **sistema de Toasts flutuantes (Z-1000)** com 4 variantes semânticas e auto-dismiss, e padrões de conteúdo específicos do arquétipo escolhido (Analytics, Chat, E-Commerce ou Wizards).
6. **Data Tables Complexas & Overlays:** As 6 decisões de tabela (desktop e card stack mobile com Container Queries e ordenação dinâmica), **multi-seleção com Bulk Actions**, **filtros rápidos por chips de status**, **paginação semântica completa**, além de modais (Z-400), drawers laterais (Z-200) e popovers (Z-500) com suporte a `Escape`.
7. **Estados do Sistema & Liquid Glass:** Skeletons anatômicos anti-CLS, banners de erro RFC 7807/9457 com retry e refração óptica com Liquid Glass e safety checks sensoriais.

---

## 🏗️ Artefatos Canônicos Gerados

Ao atingir prontidão $\ge 85\%$, a skill compila e salva no projeto:

- `tokens-showcase.html`: Showcase standalone interativo 100% offline, com theme switcher dinâmico, calculador de contraste WCAG 2.2 em tempo real com algoritmo de luminância, tabela interativa com alternador mobile, modais/drawers funcionais e **vitrine modular multi-domínio** com abas de exemplos para SaaS/Analytics, Chat/Comunicação, E-Commerce e Formulários.
- `tokens.css`: Folha de estilos corporativa com os 3 temas, escala de z-index, elevação por luminosidade, módulos semânticos de domínio e safety checks sensoriais (`prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast`).
- `design.md`: Especificação técnica completa de UI/UX, grid, overlays, componentes e tokens.
- `brandsguidelines.md`: Manual de marca, tom de voz, proporção 60-30-10 e diretrizes anti-slop.

---

## 🚀 Como Invocar

No terminal ou chat interativo (**Claude Code**, **OpenClaude**, **Gemini CLI** ou **Antigravity**):

```bash
/grill-me-design-system
```

Ou através de solicitações em linguagem natural:

- *"Inicie a sabatina de UI/UX para conceber o design system do novo dashboard"*
- *"Quero criar o design system completo do nosso SaaS de atendimento multicanal"*
- *"Gere o showcase de tokens e design system com tema claro, escuro e alto contraste"*

---

## 📚 Guias Normativos Canônicos

- [Guia Universal de Design UI/UX &amp; Acessibilidade WCAG 2.2 AAA](../../../guides/design-ui-ux/guia-universal-design-ui-ux-acessibilidade.md)
- [Guia de Dashboard Design Anti-Slop UI/UX](../../../guides/design-ui-ux/guia-dashboard-design-anti-slop-ui-ux.md)
- [Guia de Componentes de Tabela (Data Tables) em UI/UX](../../../guides/design-ui-ux/guia-componente-tabela-data-table-ui-ux.md)
- [Guia de Liquid Glass &amp; Refração Óptica Web](../../../guides/design-ui-ux/guia-liquid-glass-refracao-optica-web.md)
- [Guia de Psicologia Cognitiva &amp; Heurísticas de UX](../../../guides/design-ui-ux/guia-regras-ux-design-cognicao-comportamental.md)
- [Guia do Ciclo Completo de Product Design](../../../guides/design-ui-ux/guia-product-design-ciclo-completo.md)
