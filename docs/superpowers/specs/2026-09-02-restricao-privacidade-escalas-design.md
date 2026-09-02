# Design Doc: Restrição de Privacidade e Remoção Pública de Escalas

- **Data:** 2026-09-02
- **Status:** Aprovado
- **Autor:** IASD Mangueiras Core Team

---

## 1. Contexto e Motivação

As escalas ministeriais e voluntárias da IASD Mangueiras devem ser restritas exclusivamente ao uso interno dos administradores e líderes da igreja. A exposição de nomes, funções e escalas em rotas públicas não atende às diretrizes de privacidade dos voluntários.

A gestão e visualização das escalas já existem de forma completa no painel administrativo (`/admin/escalas`), protegido por `authGuard`. Este documento formaliza a remoção de todos os acessos públicos e a restrição definitiva de leitura a nível de banco de dados.

---

## 2. Decisões Arquiteturais

1. **Segurança de Banco de Dados (Zero-Trust):**
   - Regra do Firestore para a coleção `escalas` alterada de leitura pública (`allow read: if true;`) para restrita a administradores (`allow read, write: if isAdmin();`).
2. **Navegação e Roteamento Frontend:**
   - Remoção da rota `/escalas` de `app.routes.ts`. Tentativas de acesso direto responderão com a página 404 padrão (`NotFoundPage`).
   - Remoção dos links de menu no Header (`HeaderComponent`) e no Footer (`FooterComponent`).
3. **Painel Administrativo:**
   - Remoção do botão de atalho "Visualizar portal público de escalas" em `AdminEscalasPage` (`admin-escalas.page.ts`).
4. **Deploy, SSR e Otimização:**
   - Remoção de `/escalas` das configurações de pré-renderização do Angular SSR (`app.routes.server.ts`), dos scripts de validação de build (`verify-prerender-content.mjs`) e dos rewrites de hosting no `firebase.json`.
5. **Limpeza de Código:**
   - Exclusão do diretório de páginas públicas `frontend/src/app/features/escalas/` (`escalas.page.ts`, `escalas.page.html`, `escalas.page.spec.ts`, `components/escala-culto-card.*` e `utils/escalas.utils.ts`).
   - Remoção da assinatura pública `escalas` em `ContentService` (`content.service.ts`), mantendo o CRUD isolado no `AdminCmsService`.

---

## 3. Detalhamento das Alterações

### 3.1 Firestore Security Rules (`firestore.rules`)

```rules
match /escalas/{document} {
  allow read, write: if isAdmin();
}
```

### 3.2 Frontend Routes & Navigation

- `frontend/src/app/app.routes.ts`: Remoção do bloco de rota `escalas`.
- `frontend/src/app/layout/header/header.component.ts`: Remoção de `{ label: 'Escalas', path: '/escalas' }` da lista de navegação.
- `frontend/src/app/layout/footer/footer.component.ts`: Remoção do link de navegação rápida para `/escalas`.

### 3.3 Painel Administrativo (`frontend/src/app/features/admin/escalas/`)

- `admin-escalas.page.ts`: Remoção do elemento `<a routerLink="/escalas" ...>`.
- `admin-escalas.page.spec.ts`: Ajuste nos testes para refletir a ausência do link público.

### 3.4 Build, SSR e Hosting

- `firebase.json`: Remoção de `{ "source": "/escalas", "destination": "/index.html" }`.
- `frontend/src/app/app.routes.server.ts`: Remoção do caminho `/escalas` no RenderMode Prerender.
- `frontend/scripts/verify-prerender-content.mjs`: Remoção da verificação de arquivo pré-renderizado `dist/frontend/browser/escalas/index.html`.

### 3.5 Limpeza de Serviços e Módulos Órfãos

- `frontend/src/app/core/services/content.service.ts`: Remoção do signal/método público de leitura de escalas.
- Exclusão completa de `frontend/src/app/features/escalas/`.

---

## 4. Plano de Testes e Validação

1. **Testes Estáticos:** `npx tsc --noEmit` executado sem nenhum erro de tipagem.
2. **Testes Unitários:** Execução de `npm test` para componentes modificados (`header.component.spec.ts`, `footer.component.spec.ts`, `admin-escalas.page.spec.ts`, `content.service.spec.ts`).
3. **Regras do Firestore:** Execução de testes de segurança ou verificação de sintaxe de regras.
4. **Verificação SSR:** Confirmação de que o build e os scripts de verificação executam com sucesso sem referenciar `/escalas`.
