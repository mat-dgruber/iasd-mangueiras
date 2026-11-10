# Design: Redesign da Tela de Ministérios

**Data:** 2026-08-30
**Escopo:** Tela pública + Admin CRUD + Modelo de dados
**Abordagem:** Decomposição moderada (B)

---

## 1. Contexto

A tela de ministérios da IASD Mangueiras é funcional mas tem lacunas:
- Campo `contato_whatsapp` existe no model mas nunca é exibido
- Sem filtro de `ativo` — todos os ministérios do Firestore aparecem
- Categorias hardcoded — novas categorias exigem deploy
- Sem skeleton/loading state
- Não existe página admin de CRUD (service tem métodos, mas sem UI)

O objetivo é completar a feature com UX polida e painel de gerenciamento.

---

## 2. Modelo de Dados

### Interface `Ministerio` (atualização)

```typescript
export interface Ministerio {
  id?: string;
  nome: string;
  descricao: string;
  categoria?: string;
  lideres?: string;
  imagem_url?: string;
  banner_url?: string;
  reunioes_horario?: string;
  contato_whatsapp?: string;
  publico_alvo?: string;
  atividades?: string[];
  destaque?: boolean;
  ativo?: boolean;  // NOVO
}
```

- **Firestore rules** — manter `public read, admin write` (já implementado)
- **Filtro ativo** — client-side no `computed` do componente (padrão do projeto)
- **Categorias dinâmicas** — derivar via `computed` a partir dos dados: `[...new Set(ministerios.map(m => m.categoria).filter(Boolean))]`, com "Todos" sempre primeiro

---

## 3. Tela Pública — Estrutura de Componentes

### Arquivos

| Arquivo | Responsabilidade |
|---------|-----------------|
| `ministerios.page.ts` | Página principal — header, filtros, grid, destaque, CTA, SEO |
| `ministerio-card.component.ts` | Card individual (extraído do template inline) |
| `ministerio-modal.component.ts` | Modal de detalhes (extraído do template inline) |
| `ministerio-skeleton.component.ts` | Skeleton loading (novo) |

### Estados da Página

1. **Loading** — Skeleton grid (6 cards placeholder) enquanto `contentService.ministerios()` retorna vazio
2. **Dados carregados** — Grid com ministérios `ativo !== false`; destaque em seção separada no topo
3. **Filtros ativos** — Grid filtrado por categoria + busca
4. **Vazio** — Estado amigável com "Limpar Filtros" (já existe)
5. **Erro** — Fallback para JSON estático (comportamento atual)

### Seção de Destaque

- Acima do grid principal, row `max-w-2xl` para cada ministério destaque
- Visual diferenciado: maior, com banner completo
- Só aparece quando `selectedCategory() === 'Todos'` e sem busca ativa

### WhatsApp

- Botão no card (ícone) e no modal (link `https://wa.me/{numero}`)
- Só exibir se `contato_whatsapp` existir

### UX Mobile

- Chips de categoria em scroll horizontal (`overflow-x-auto`) em telas pequenas
- Grid 1 coluna no mobile, 2 em sm, 3 em lg (já existe)

### Skeleton

- 6 cards placeholder com `animate-pulse`
- Formato: retângulo cinza para imagem, barras para título e texto
- Exibido durante carregamento inicial

---

## 4. Admin CRUD

### Arquivo

`admin/ministerios/admin-ministerios.page.ts` — componente standalone com inline template (padrão `admin-eventos`)

### Funcionalidades

| Feature | Detalhe |
|---------|---------|
| Listagem | Grid de cards — nome, categoria, badge ativo/inativo, botões editar/deletar |
| Modal compartilhado | Um modal para criar e editar; `editingId` signal (null = criar, com id = editar) |
| Campos do form | nome, descricao, categoria (input com datalist), lideres, reunioes_horario, contato_whatsapp, publico_alvo, atividades (textarea, 1 por linha), destaque (toggle), ativo (toggle) |
| Upload de imagem | Input URL + input file com `uploadMinisterioImage()` |
| Upload de banner | Idem, usando `banner_url` |
| Exclusão | Confirm dialog antes de deletar |
| Toast | Notificações via `ToastService` |

### Rota

`admin/ministerios` no `app.routes.ts`, com guard de admin.

### Categorias no formulário

Input com `datalist` derivado das categorias existentes — sem tela separada de gerenciamento (YAGNI).

---

## 5. Fluxo de Dados

```
Firestore "ministerios" collection
  ↓ (onSnapshot em ContentService)
  ↓
Signal _ministerios (todos os documentos)
  ↓
Página pública: computed filteredMinisterios
  → filtro ativo !== false
  → filtro categoria (ou "Todos")
  → filtro busca (nome, descricao, lideres)
  ↓
Componentes: card, modal, skeleton
```

```
Admin CRUD
  ↓
AdminCmsService (getMinisterios, saveMinisterio, deleteMinisterio, uploadMinisterioImage)
  ↓
Firestore write
  ↓
onSnapshot propaga para tela pública automaticamente
```

---

## 6. Testes

### Tela pública (atualizar `ministerios.page.spec.ts`)

- Skeleton aparece durante loading
- Ministérios inativos (`ativo: false`) não são exibidos
- Categorias dinâmicas refletem os dados
- Botão WhatsApp aparece quando `contato_whatsapp` existe
- Seção de destaque aparece quando há ministérios com `destaque: true`

### Admin (novo `admin-ministerios.page.spec.ts`)

- Renderiza listagem de ministérios
- Modal abre para criar novo
- Modal preenche dados ao editar
- Exclusão chama `deleteMinisterio`
- Upload de imagem funciona

---

## 7. Fora do Escopo

- Tela separada de gerenciamento de categorias (YAGNI — datalist resolve)
- Paginação (8 ministérios não justifica)
- Filtros avançados (data, ordenação — sem necessidade atual)
