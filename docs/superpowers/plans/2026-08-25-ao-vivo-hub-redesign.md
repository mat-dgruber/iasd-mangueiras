# Plano de Implementação: Hub de Transmissões & Mensagens Ao Vivo

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a página `/ao-vivo` em um Hub Completo de Transmissões com Countdown dinâmico, integração da Série Presente 7, catálogo filtrável com busca reativa e ações de comunhão e agendamento.

**Architecture:** Frontend em Angular 19+ com Standalone Components, Signals reativos para contagem regressiva em tempo real e filtragem instantânea de vídeos; Backend FastAPI com rotas de API em cache para YouTube Data API v3 com fallbacks estáticos resilientes.

**Tech Stack:** Angular 19+, TypeScript, Tailwind CSS, FastAPI, Python 3.12+, pytest, Jasmine/Karma.

## Global Constraints
- Estilização primária via Tailwind CSS com tokens institucionais (`advent-blue`, `advent-gold`, etc.).
- Acessibilidade WCAG 2.2 AA (touch targets ≥ 44px, `:focus-visible`, `aria-label`, navegação por teclado).
- Segurança Zero-Trust: uso de `youtube-nocookie.com` com `DomSanitizer.bypassSecurityTrustResourceUrl`.
- Sem quebra de cobertura de testes (`pytest` no backend e `npm test` no frontend 100% passando).

---

### Task 1: Backend — Aprimorar Resiliência e Suporte a Playlist da Série Presente 7

**Files:**
- Modify: `backend/app/services/youtube_service.py:40-120`
- Test: `backend/tests/test_youtube.py`

**Interfaces:**
- Consumes: `settings.youtube_api_key`, `settings.youtube_channel_id`
- Produces: `YouTubeLatestResponse` com lista curada de vídeos da série Presente 7 via `GET /api/youtube/presente7`

- [ ] **Step 1: Write the failing / updated backend test**

```python
# backend/tests/test_youtube.py
@pytest.mark.anyio
async def test_get_presente7_videos_structure() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/youtube/presente7")
        assert response.status_code == 200
        data = response.json()
        assert "videos" in data
        assert len(data["videos"]) >= 2
        for vid in data["videos"]:
            assert "id" in vid
            assert "title" in vid
            assert "thumbnail_url" in vid
```

- [ ] **Step 2: Run backend tests to verify execution**

Run: `pytest backend/tests/test_youtube.py -v`
Expected: PASS ou FAIL identificando conformidade da estrutura

- [ ] **Step 3: Update YouTube service implementation**

Garantir que `get_presente7_videos` filtre adequadamente as mensagens da série Presente 7, mantenha cache de 30 minutos e utilize a lista de fallback enriquecida com episódios reais da igreja.

- [ ] **Step 4: Run backend tests and verify passing**

Run: `pytest backend/tests/test_youtube.py -v`
Expected: 4 passed in 0.0X s

- [ ] **Step 5: Commit changes**

```bash
git add backend/app/services/youtube_service.py backend/tests/test_youtube.py
git commit -m "feat(backend): enhance presente7 series endpoint with resilient caching and rich fallbacks"
```

---

### Task 2: Frontend — Atualizar Modelos e Métodos de Utilitários de Transmissão

**Files:**
- Modify: `frontend/src/app/core/services/youtube.service.ts`
- Modify: `frontend/src/app/core/models/youtube.models.ts`
- Test: `frontend/src/app/core/services/youtube.service.spec.ts`

**Interfaces:**
- Consumes: `HttpClient`, `environment.apiUrl`
- Produces: `YoutubeService.videos`, `YoutubeService.presente7Videos`, `YoutubeService.isLive`, `YoutubeService.liveVideo`

- [ ] **Step 1: Write the unit test for YoutubeService**

```typescript
// frontend/src/app/core/services/youtube.service.spec.ts
it('deve carregar episódios da série Presente 7 e expor via Signal', () => {
  service.fetchPresente7Videos().subscribe();
  const req = httpMock.expectOne(`${environment.apiUrl}/youtube/presente7`);
  req.flush({ videos: DEFAULT_PRESENTE7_VIDEOS });
  expect(service.presente7Videos().length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run unit test to verify**

Run: `cd frontend && npm test -- --watch=false --include=src/app/core/services/youtube.service.spec.ts`
Expected: PASS

- [ ] **Step 3: Implement any required model expansions in youtube.models.ts & youtube.service.ts**

Adicionar tipagens como categorias de vídeo (`'todos' | 'presente7' | 'sabado' | 'semana'`) caso necessário.

- [ ] **Step 4: Run frontend tests to confirm**

Run: `cd frontend && npm test -- --watch=false --include=src/app/core/services/youtube.service.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add frontend/src/app/core/models/youtube.models.ts frontend/src/app/core/services/youtube.service.ts frontend/src/app/core/services/youtube.service.spec.ts
git commit -m "feat(youtube): update youtube models and service methods for live hub"
```

---

### Task 3: Frontend — Implementar Redesign da Página `/ao-vivo` com Countdown, Catálogo e Filtros

**Files:**
- Modify: `frontend/src/app/features/ao-vivo/ao-vivo.page.ts`
- Modify: `frontend/src/app/features/ao-vivo/ao-vivo.page.spec.ts`

**Interfaces:**
- Consumes: `YoutubeService`, `SeoService`, `SITE_CONFIG`, `generateCalendarLinks`
- Produces: Componente autônomo `AoVivoPage` com Countdown dinâmico, Grade Presente 7, Busca instantânea, Filtros por Categoria e Modal Player.

- [ ] **Step 1: Update the test suite in ao-vivo.page.spec.ts**

```typescript
// Testar contagem regressiva, filtros de categoria, busca textual e ações
it('deve filtrar vídeos dinamicamente ao digitar no campo de busca', () => {
  component.searchQuery.set('Identidade');
  fixture.detectChanges();
  expect(component.filteredVideos().length).toBe(1);
  expect(component.filteredVideos()[0].title).toContain('Identidade');
});

it('deve alternar categoria ativa ao selecionar a aba', () => {
  component.setCategory('presente7');
  fixture.detectChanges();
  expect(component.selectedCategory()).toBe('presente7');
});
```

- [ ] **Step 2: Run test to verify behavior**

Run: `cd frontend && npm test -- --watch=false --include=src/app/features/ao-vivo/ao-vivo.page.spec.ts`

- [ ] **Step 3: Implement new AoVivoPage template and logic**

1. **Lógica Reativa**:
   - `countdown`: Signal `{ days: number, hours: number, minutes: number, seconds: number, nextServiceName: string, nextServiceTime: string }` atualizado a cada 1 segundo com `setInterval` (limpo no `ngOnDestroy`).
   - `searchQuery`: Signal de texto para busca.
   - `selectedCategory`: Signal de categoria (`'todos' | 'presente7' | 'sabado' | 'semana'`).
   - `filteredVideos`: `computed()` que combina a busca e categoria selecionada.
   - `activeVideo` & `safeEmbedUrl`: Gerenciamento seguro do modal player.
   - `shareOnWhatsapp()`: Gera link direto com mensagem para convidar amigos.

2. **Template Moderno**:
   - Breadcrumb acessível.
   - Hero dinâmico: Se `isLive` ativo → Player destaque + badge pulsante. Se offline → Banner escuro institucional com Grid do Timer (Dias, Horas, Minutos, Segundos), botão de Google Agenda e botão de WhatsApp.
   - Seção Série Especial Presente 7: Banner estilizado com os episódios curados e link da playlist no YouTube.
   - Catálogo de Vídeos: Barra de busca com ícone de lupa e botão limpar + pílulas de filtros rápidos + Grid de Cards responsivos.
   - Bloco de Acolhimento e Oração: Card convidando a pedir oração ou estudar a Lição da Escola Sabatina.
   - Modal Player: Backdrop blur com `youtube-nocookie.com` e botão fechar com touch target ≥ 44px.

- [ ] **Step 4: Run tests and static type check**

Run: `cd frontend && npm test -- --watch=false --include=src/app/features/ao-vivo/ao-vivo.page.spec.ts && npx tsc --noEmit`
Expected: 100% PASS sem erros de tipo.

- [ ] **Step 5: Commit changes**

```bash
git add frontend/src/app/features/ao-vivo/ao-vivo.page.ts frontend/src/app/features/ao-vivo/ao-vivo.page.spec.ts
git commit -m "feat(ao-vivo): revamp live transmissions hub with countdown timer, presente 7 playlist and reactive catalog"
```

---

### Task 4: Verificação Completa e Auditoria de Qualidade

**Files:**
- Todos os arquivos modificados

- [ ] **Step 1: Executar suite de testes do Backend**

Run: `pytest backend/tests/ -v`
Expected: All tests pass.

- [ ] **Step 2: Executar suite de testes e build do Frontend**

Run: `cd frontend && npm test -- --watch=false && npm run build`
Expected: Build com sucesso e todos os testes passando.

- [ ] **Step 3: Checagem estática de tipagem**

Run: `cd frontend && npx tsc --noEmit`
Expected: Zero erros de compilação.
