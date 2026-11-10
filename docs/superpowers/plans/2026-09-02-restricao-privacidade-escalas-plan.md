# Restrição de Privacidade e Remoção Pública de Escalas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restringir o acesso e a visualização das escalas ministeriais exclusivamente aos administradores autenticados, removendo a rota pública `/escalas`, links de navegação e protegendo as regras de banco de dados.

**Architecture:** A segurança de leitura da coleção `escalas` no Firestore é elevada para `isAdmin()`, prevenindo vazamento de dados de voluntários no cliente. Todas as superfícies públicas do frontend (rota Angular, links em Header e Footer, SSR prerender e rewrites de hosting) são removidas, preservando a gestão completa e segura em `/admin/escalas`.

**Tech Stack:** Angular 22 (Standalone Components, Signals), Firebase Firestore Security Rules, Vitest, Node.js SSR scripts.

## Global Constraints

- **Segurança Máxima Zero-Trust:** Nenhuma leitura não autenticada permitida para a coleção `escalas`.
- **Qualidade e Estabilidade:** Zero erros de tipagem (`ng build --no-watch`) e todos os testes unitários passando (`npm test -- --watch=false`).
- **Padrão de Commits:** Conventional Commits em inglês (`<type>(<scope>): <subject>`).

---

### Task 1: Proteger a coleção de Escalas nas Regras do Firestore

**Files:**
- Modify: `firestore.rules:62-65`

**Interfaces:**
- Consumes: `isAdmin()` function in `firestore.rules`
- Produces: Locked `match /escalas/{document}` allowing only admin access

- [ ] **Step 1: Modificar `firestore.rules`**

Atualizar as regras para que leitura e escrita exijam autenticação de administrador:

```rules
    match /escalas/{document} {
      allow read, write: if isAdmin();
    }
```

- [ ] **Step 2: Verificar sintaxe e diff do Firestore**

Executar: `git diff firestore.rules`
Esperado: Remoção de `allow read: if true;` e unificação para `allow read, write: if isAdmin();`.

- [ ] **Step 3: Commit das alterações de regras**

```bash
git add firestore.rules
git commit -m "fix(security): restrict firestore escalas collection to admin only"
```

---

### Task 2: Remover Listener Público e Sinal em `ContentService`

**Files:**
- Modify: `frontend/src/app/core/services/content.service.ts`
- Test: `frontend/src/app/core/services/content.service.spec.ts`

**Interfaces:**
- Consumes: `ContentService`
- Produces: `ContentService` sem dependência de `escalas.json` ou listener não-autenticado no Firestore

- [ ] **Step 1: Limpar importações, sinais e listeners em `content.service.ts`**

1. Remover `import defaultEscalas from '../../../content/escalas.json';` e `EscalaItem` de `content.models.ts` se não usado por outros sinais.
2. Remover a declaração `private readonly _escalas = signal<readonly EscalaItem[]>(...);`.
3. Remover o bloco de listener `onSnapshot` para a coleção `'escalas'` dentro do construtor:
```typescript
// Remover:
const escalasCol = collection(this.firebase.firestore, 'escalas');
onSnapshot(
  escalasCol,
  (snap) => { ... },
  () => {},
);
```
4. Remover o método público `escalas(): readonly EscalaItem[]`.

- [ ] **Step 2: Executar testes de `ContentService`**

Executar: `npm --prefix frontend test -- --watch=false --include=src/app/core/services/content.service.spec.ts`
Esperado: PASS

- [ ] **Step 3: Commit das alterações de serviço**

```bash
git add frontend/src/app/core/services/content.service.ts
git commit -m "refactor(content): remove public escalas signal and real-time listener from ContentService"
```

---

### Task 3: Remover Link do Portal Público em `AdminEscalasPage`

**Files:**
- Modify: `frontend/src/app/features/admin/escalas/admin-escalas.page.ts:39-47`
- Test: `frontend/src/app/features/admin/escalas/admin-escalas.page.spec.ts:194-198`

**Interfaces:**
- Consumes: `AdminEscalasPage`
- Produces: Cabeçalho do admin sem o botão que apontava para `/escalas`

- [ ] **Step 1: Atualizar o teste unitário em `admin-escalas.page.spec.ts`**

Alterar o teste que verificava a presença do link para garantir que ele NÃO existe:

```typescript
  it('não renderiza link para portal público de escalas', () => {
    const link = fixture.nativeElement.querySelector('a[href="/escalas"]');
    expect(link).toBeNull();
  });
```

- [ ] **Step 2: Executar o teste para verificar falha esperada (TDD)**

Executar: `npm --prefix frontend test -- --watch=false --include=src/app/features/admin/escalas/admin-escalas.page.spec.ts`
Esperado: FAIL (o link ainda existe no template).

- [ ] **Step 3: Remover o botão do template em `admin-escalas.page.ts`**

Remover o elemento:
```html
<a
  routerLink="/escalas"
  target="_blank"
  class="inline-flex items-center gap-1.5 rounded-card border border-advent-border bg-white px-4 py-2.5 text-xs font-semibold text-advent-text shadow-sm hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer min-h-[40px]"
  title="Visualizar portal público de escalas"
>
  <span class="material-symbols-outlined text-[16px] text-advent-blue">open_in_new</span>
  <span>Ver Portal Público</span>
</a>
```

- [ ] **Step 4: Executar os testes novamente para verificar aprovação**

Executar: `npm --prefix frontend test -- --watch=false --include=src/app/features/admin/escalas/admin-escalas.page.spec.ts`
Esperado: PASS (todos os testes passando).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/features/admin/escalas/admin-escalas.page.ts frontend/src/app/features/admin/escalas/admin-escalas.page.spec.ts
git commit -m "refactor(admin): remove public portal link from AdminEscalasPage"
```

---

### Task 4: Remover Links de Escalas do Header e Footer

**Files:**
- Modify: `frontend/src/app/layout/header/header.component.ts:71-77,280-294`
- Modify: `frontend/src/app/layout/footer/footer.component.ts:38-45`
- Test: `frontend/src/app/layout/header/header.component.spec.ts:28`

**Interfaces:**
- Consumes: `HeaderComponent`, `FooterComponent`
- Produces: Menus públicos limpos sem link para `/escalas`

- [ ] **Step 1: Atualizar o teste de Header (`header.component.spec.ts`)**

Alterar a asserção da linha 28:
```typescript
// De:
expect(links).toContain('/escalas');
// Para:
expect(links).not.toContain('/escalas');
```

- [ ] **Step 2: Executar teste do Header para verificar falha (TDD)**

Executar: `npm --prefix frontend test -- --watch=false --include=src/app/layout/header/header.component.spec.ts`
Esperado: FAIL (`expected [...] not to contain '/escalas'`).

- [ ] **Step 3: Remover link de Escalas em `header.component.ts` e `footer.component.ts`**

1. Em `frontend/src/app/layout/header/header.component.ts`:
   - Remover item `<li><a ... routerLink="/escalas">Escalas</a></li>` da navegação desktop.
   - Remover item `<li><a ... routerLink="/escalas">... Escalas de Voluntários ...</a></li>` da gaveta mobile.
2. Em `frontend/src/app/layout/footer/footer.component.ts`:
   - Remover o separador `<span class="text-white/40">•</span>` e o link `<a routerLink="/escalas">Escalas de voluntários →</a>`.

- [ ] **Step 4: Executar testes de Header e Footer**

Executar: `npm --prefix frontend test -- --watch=false --include=src/app/layout/header/header.component.spec.ts`
Esperado: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/layout/header/header.component.ts frontend/src/app/layout/header/header.component.spec.ts frontend/src/app/layout/footer/footer.component.ts
git commit -m "refactor(navigation): remove /escalas links from HeaderComponent and FooterComponent"
```

---

### Task 5: Excluir Rota Pública `/escalas`, Prerender, SSR e Componentes Órfãos

**Files:**
- Delete: `frontend/src/app/features/escalas/`
- Modify: `frontend/src/app/app.routes.ts`
- Modify: `frontend/src/app/app.routes.server.ts`
- Modify: `firebase.json`
- Modify: `frontend/scripts/verify-prerender-content.mjs`

**Interfaces:**
- Consumes: Rotas do Angular e configurações de build
- Produces: Sistema sem referências a `/escalas` em rotas públicas, prerender ou hosting

- [ ] **Step 1: Excluir pasta `frontend/src/app/features/escalas/`**

Comando:
```bash
rm -rf frontend/src/app/features/escalas
```

- [ ] **Step 2: Remover rota `/escalas` de `frontend/src/app/app.routes.ts`**

Remover o bloco:
```typescript
  {
    path: 'escalas',
    loadComponent: () => import('./features/escalas/escalas.page').then((m) => m.EscalasPage),
    title: 'Escalas & Voluntários — IASD Mangueiras',
  },
```

- [ ] **Step 3: Remover rota do prerender em `frontend/src/app/app.routes.server.ts`**

Remover a linha:
```typescript
  { path: 'escalas', renderMode: RenderMode.Prerender },
```

- [ ] **Step 4: Remover rewrite de `/escalas` em `firebase.json`**

Remover a linha:
```json
      { "source": "/escalas", "destination": "/index.html" },
```

- [ ] **Step 5: Remover checagem de prerender em `frontend/scripts/verify-prerender-content.mjs`**

Remover o objeto da lista `checks`:
```javascript
  {
    file: 'dist/frontend/browser/escalas/index.html',
    expectedTexts: ['Escalas &amp; Voluntários', 'Escalas Ministeriais', 'IASD Mangueiras'],
  },
```

- [ ] **Step 6: Executar build e validação de prerender**

Executar:
```bash
npm --prefix frontend run ng -- build --no-watch && node frontend/scripts/verify-prerender-content.mjs
```
Esperado:
- Build gera pacotes sem erros.
- Rotas pré-renderizadas = 8 (sem `/escalas`).
- `verify-prerender-content.mjs` exibe: `prerendered SEO & institutional content verified successfully`.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/app.routes.ts frontend/src/app/app.routes.server.ts firebase.json frontend/scripts/verify-prerender-content.mjs
git commit -m "chore(routes): remove /escalas public routes, prerendering and page components"
```

---

### Task 6: Validação Completa de Regressão e Verificação Final

**Files:**
- Repository-wide

**Interfaces:**
- All features and tests

- [ ] **Step 1: Executar suite completa de testes do frontend**

Comando:
```bash
npm --prefix frontend run test:ci
```
Esperado: 100% dos testes passando sem falhas.

- [ ] **Step 2: Executar build de produção**

Comando:
```bash
npm --prefix frontend run ng -- build --no-watch
```
Esperado: Build concluído com sucesso e zero erros de tipo ou compilação.

- [ ] **Step 3: Executar script de validação de pré-renderização**

Comando:
```bash
node frontend/scripts/verify-prerender-content.mjs
```
Esperado: Sucesso confirmado.
