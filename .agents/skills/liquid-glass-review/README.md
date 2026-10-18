# 🧪 Liquid Glass & Optical Refraction Code Reviewer

Orquestrador e skill de auditoria para componentes de interface que utilizam **Liquid Glass**, materiais translúcidos avançados e refração óptica vetorial na web.

---

## 🎯 Finalidade da Skill

Esta skill foi projetada para superar o erro comum de aplicar apenas `backdrop-filter: blur()`, que produz uma névoa leitosa sem vida. Ela audita e refatora componentes aplicando a **física real do vidro**:
1. **Refração Vetorial:** Filtro SVG procedural com `<feTurbulence>` e `<feDisplacementMap>`.
2. **Composição Atmosférica:** `backdrop-filter: url(#id) blur(3px) saturate(180%)`.
3. **Iluminação Especular Zenital:** Borda interna de 1px simulando a luz incidente no topo.
4. **Safety Checks de Acessibilidade:** Suporte nativo a `prefers-reduced-transparency`, `prefers-contrast` e `forced-colors`.

---

## 🚀 Como Invocar

No terminal interativo do **Claude Code** ou **OpenClaude**:

```bash
/liquid-glass-review
```

Ou através de solicitações em linguagem natural:
- *"Audite este componente de glassmorphism"*
- *"Aplique liquid glass neste card de dashboard"*
- *"Substitua o blur simples por refração real no header"*

---

## 📚 Referência Canônica

Para os fundamentos físicos, parâmetros de dispersão e componentes completos, consulte:
- [Guia Canônico de Liquid Glass (Vidro Líquido & Refração Óptica Realista na Web)](../../../guides/design-ui-ux/guia-liquid-glass-refracao-optica-web.md)
