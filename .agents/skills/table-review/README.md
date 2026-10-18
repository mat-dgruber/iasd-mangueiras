# 📊 Data Table & Responsive Grid Code Reviewer

Orquestrador e skill de auditoria para componentes de **Tabela de Dados (Data Table)**, grids analíticos e experiências responsivas mobile.

---

## 🎯 Finalidade da Skill

Esta skill aplica dois frameworks arquiteturais normativos:
1. **As 6 Decisões de Desktop:**
   - **Align:** Números à direita com `tabular-nums`, texto à esquerda.
   - **Rows:** Hairlines de 1px, hover suave, zebra striping restrito a tabelas amplas.
   - **Density:** 3 modos configuráveis (Compact 40px, Default 48px, Comfortable 56px).
   - **Sticky:** Cabeçalho e primeira coluna fixados.
   - **Cells:** Travessão em células vazias, truncamento seguro.
   - **Actions:** Ações econômicas no hover ou menu contextual.
2. **O Framework das 6 Decisões Mobile:**
   - **Rank:** Priorização por uso (Identity, Value, State; ID oculto no mobile).
   - **Stack:** Empilhamento em duas linhas na altura do polegar.
   - **Slot:** Slot fixo no canto superior direito para métricas com `tabular-nums`.
   - **Label:** Rotular o ambíguo (`Vencimento em 04 de Março`), dispensar o óbvio.
   - **Reveal:** Tap-to-expand ou Bottom Sheet (nunca uma nova página para uma olhada rápida).
   - **Breakpoint:** Container Queries (`@container < 700px`).
3. **Recursos Avançados:** Seleção com `indeterminate` e Shift+click, Bulk Action Bar, virtualização para >100 linhas e conformidade WCAG 2.2 AAA.

---

## 🚀 Como Invocar

No terminal interativo do **Claude Code** ou **OpenClaude**:

```bash
/table-review
```

Ou através de solicitações em linguagem natural:
- *"Audite esta data table"*
- *"Como melhorar a responsividade mobile desta tabela?"*
- *"Adicione seleção múltipla com Shift+click e bulk bar nesta tabela"*

---

## 📚 Referência Canônica

Para os diagramas, código-fonte e scorecard completo, consulte:
- [Guia Canônico de Componentes de Tabela (Data Tables) em UI/UX & Design Systems](../../../guides/design-ui-ux/guia-componente-tabela-data-table-ui-ux.md)
