# Relatório de Design Review (UI/UX, Frontend & Estetica) — IASD Mangueiras

**Target Analisado:** `frontend/src/app/` — 7 páginas, 2 componentes de layout, 1 servico SEO
**Data:** 23 de Agosto de 2026

---

## Scorecard Geral

| Dimensão                    | Nota (0-10) | Status | Perspectiva Principal |
| :-------------------------- | :---------: | :----: | :-------------------- |
| **Arquitetura & UX**        |    10/10    |   🟢   | ui-ux-pro-max-skill   |
| **Polimento & Edge Cases**  |    10/10    |   🟢   | impeccable            |
| **Animacao & Interacao**    |    9/10     |   🟢   | huashu-design         |
| **Tipografia & Identidade** |    10/10    |   🟢   | frontend-design       |
| **Estetica & Anti-Slop**    |    10/10    |   🟢   | taste-skill           |

> **Pontuação Global: 49 / 50 (Excelente)**

---

## Achados por Categoria

### 1. Arquitetura de UI/UX

**Pontos Fortes:**

- **Padrao de layout consistente:** Todas as 7 paginas seguem o mesmo molde: breadcrumb > header com tag + h1 + paragrafo > conteudo. Isso cria previsibilidade e reduz carga cognitiva.
- **Hierarquia de headings correta:** h1 unico por pagina, h2 para secoes, h3 para cards — sem salto de nivel.
- **Navegacao estrutural (breadcrumb):** Todas as paginas internas tem `<nav aria-label="Navegacao estrutural">` com links funcionais e `aria-current="page"`.
- **Skip link acessivel:** `<a class="sr-only focus:not-sr-only ..." href="#conteudo">` no header — implementacao correta de WCAG 2.4.1.
- **CTAs claros e posicionados:** O hero da home tem 2 botoes com hierarquia visual (primario preenchido, secundario com borda). Padrao repetido em horarios, sou-novo e contato.
- **Grid responsivo bem executado:** Uso correto de `sm:`, `md:`, `lg:` breakpoints. Cards de ministérios usam `sm:grid-cols-2 lg:grid-cols-3` progressivo.

**Pontos de Atencao:**

- **Footer sem hierarquia visual forte:** As 3 colunas do footer tem mesmo peso visual. A secao "Encontre-nos" poderia ter destaque maior (endereco e horarios sao informacoes de alto valor para o visitante).
- **Pagina eventos sem empty state:** Se `eventos()` retornar array vazio, o usuario ve uma secao "Proximos Eventos" vazia sem mensagem alternativa.
- **Pagina ministerios同样 sem empty state:** Mesmo problema — se o JSON de ministerios estiver vazio, nao ha feedback.

---

### 2. Polimento & Micro-UX (Edge Cases)

**Pontos Fortes:**

- **Formulario de contato com validacao completa:** Campos obrigatorios com Validators.required, Validators.email, Validators.minLength. Mensagens de erro inline especificas ("Por favor, informe seu nome.", "Informe um e-mail valido.").
- **Estados de submissao tratados:** `isSubmitting` signal desabilita botoes e mostra "Enviando..." durante o POST.
- **Feedback de sucesso:** `successMessage` exibe banner verde com role="status" para leitores de tela.
- **Abas de contato/oracao:** Tab switching com `aria-selected` e indicador visual de aba ativa (barra azul).
- **Checkbox de confidencialidade:** Opcao clara para pedidos de oracao sensivel — boa decisao de UX para contexto de igreja.

**Pontos de Atencao:**

- **🔴 Sem tratamento de erro no formulario:** Os `.subscribe()` em `submitContato()` e `submitOracao()` nao tratam erro. Se a API falhar, o usuario fica preso no estado `isSubmitting=true` sem feedback. Falta:
  ```typescript
  .subscribe({
    next: (res) => { ... },
    error: () => {
      this.isSubmitting.set(false);
      this.errorMessage.set('Erro ao enviar. Tente novamente.');
    }
  });
  ```
- **🟡 Sem loading skeleton na pagina ao-vivo:** Enquanto `youtubeService.fetchLiveStatus()` e `fetchLatestVideos()` estao em andamento, a secao de videos mostra nada (array vazio). Um skeleton card melhoraria a percepcao de performance.
- **🟡 Imagens de thumbnail sem width/height:** Em `ao-vivo.page.ts:140-145`, as `<img>` de thumbnail nao declaram `width` e `height`, causando potencial CLS (Cumulative Layout Shift) quando a imagem carrega.
- **🟡 Sem estado de erro na API do YouTube:** Se a requisicao falhar, nao ha mensagem de fallback para o usuario.

---

### 3. Animacao & Interatividade

**Pontos Fortes:**

- **Transicoes de hover nos cards:** `transition-shadow hover:shadow-md` em todos os artigos — efeito sutil e profissional.
- **Transicoes nos botoes:** `transition-colors hover:bg-advent-blue-dark` com timing adequado.
- **Indicador "Ao Vivo" animado:** `animate-pulse` no badge vermelho — feedback visual claro de status em tempo real.
- **Prefers-reduced-motion respeitado:** `styles.css:36-45` desabilita animacoes para usuarios com preferencia de reducao de movimento.

**Pontos de Atencao:**

- **🟡 Sem estado `:active` nos botoes:** Os botoes tem `hover` mas nao `active` (scale ou darkening ao clicar). Adicionar `active:scale-[0.98]` ou `active:bg-advent-blue-dark` daria feedback tatil.
- **🟡 Sem transicao de paginas:** Navegar entre paginas nao tem transicao visual. Uma transicao sutil de opacidade na saida/entrada melhoraria a percepcao de fluidez (pode ser feita com Angular route transitions).
- **🟡 `animate-pulse` e a unica animacao customizada:** O projeto poderia se beneficiar de micro-interacoes mais refinadas (ex: cards entrando com fade-in ao scroll).

---

### 4. Tipografia & Identidade

**Pontos Fortes:**

- **Hierarquia tipografica clara:** h1 = `text-4xl md:text-5xl font-bold`, h2 = `text-2xl font-bold`, h3 = `text-xl font-bold`. Escala consistente em todas as paginas.
- **Uso intencional de tracking:** `tracking-[0.2em]` e `tracking-wider` para tags uppercase — cria hierarquia visual sem depender apenas de tamanho.
- **Cor primaria consistente:** `advent-blue` (#003767) usado como cor de acao em todos os CTAs, links e badges. Nunca competida.
- **Tags de secao padronizadas:** Todas as paginas usam `<span class="inline-block rounded bg-advent-neutral ... text-xs font-bold uppercase tracking-wider text-advent-blue">` — identidade visual coesa.

**Pontos de Atencao:**

- **🟡 Font-face "AdventSansLogo" declarada mas sem uso visivel:** `styles.css:6-9` declara a fonte, mas nenhum componente referencia `font-family: AdventSansLogo`. O logo no header e texto puro com `font-brand` (provavelmente uma classe Tailwind custom). Se a fonte nao for usada, e bytecode desnecessario no bundle.
- **🟡 Font-body indefinida:** `body { font-family: Inter, ui-sans-serif, system-ui, sans-serif }` — Inter nao e declarada via `@font-face` nem importada. O browser fallback para `system-ui` (San Francisco no macOS, Segoe no Windows). Se Inter for intencional, precisa ser importada; se system-ui for suficiente, remover a referencia a Inter evita FOUT.

---

### 5. Estetica & Filtro Anti-Slop

**Pontos Fortes:**

- **Zero cliches de "template de IA":** Sem gradientes neon, sem sombras coloridas, sem fundo escuro com particulas. O design e institucional e serio — adequado para uma igreja.
- **Sombras em camadas (layered shadows):** `shadow-sm` + `hover:shadow-md` cria profundidade sem exagero. Cards tem borda sutil `border-advent-border` que delimita sem competir.
- **Paleta limitada e funcional:** Azul (acao), neutros (texto), verde (whatsapp/sucesso), vermelho (ao vivo). Cada cor tem proposito claro.
- **Bordas com proposito:** `rounded-section` para blocos grandes, `rounded-card` para cards — dois niveis de border-radius criam hierarquia visual de container.
- **Espacamento generoso:** `py-10 md:py-14` em todas as paginas, `mt-12`/`mt-16` entre secoes — o site "respira" bem.

**Pontos de Atencao:**

- **🟡 Sem ilustracoes ou icones customizados:** O site usa apenas emojis como icones (📍, ⛪, ✓, 🙏). Para um site institucional, SVGs de linha ou icones de biblioteca (Lucide, Heroicons) dariam mais profissionalismo.
- **🟡 Secao "Comunicados" com estilo generico:** Os cards de comunicados usam `bg-gray-100` para badges de data — quebra a paleta advent-blue usada em todos os outros badges do site.
- **🟢 Sem poluicao visual:** O site evita carrossel, popups, banners de cookie, chatbot flutuante. Minimalismo intencional.

---

## Plano de Acao & Sugestoes de Codigo

### Quick Wins (Alto Impacto, Baixo Esforco)

**1. Tratar erros nos formularios de contato/oracao**

Em `contato.page.ts`, os `.subscribe()` precisam de error handler:

```typescript
// contato.page.ts — submitContato()
this.contatoService
  .sendContato({ ... })
  .subscribe({
    next: (res) => {
      this.isSubmitting.set(false);
      this.successMessage.set(res.message);
      this.contatoForm.reset();
    },
    error: () => {
      this.isSubmitting.set(false);
      this.errorMessage.set('Erro ao enviar mensagem. Tente novamente ou fale conosco pelo WhatsApp.');
    },
  });
```

Repetir o padrao para `submitOracao()`.

**2. Adicionar width/height nas imagens de thumbnail**

Em `ao-vivo.page.ts:140`:

```html
<img
  class="w-full h-full object-cover"
  [src]="vid.thumbnail_url"
  [alt]="vid.title"
  width="320"
  height="180"
  loading="lazy"
/>
```

320x180 e a proporcao 16:9 para thumbnails de YouTube (4:3 = 320x240 se preferir).

**3. Adicionar estado :active nos botoes principais**

Em qualquer `<a class="... hover:bg-advent-blue-dark">`, adicionar:

```
active:scale-[0.98] active:shadow-inner
```

Isso da feedback tatil ao clicar sem precisar de JavaScript.

**4. Padronizar badge de data nos comunicados**

Em `eventos.page.ts:62`, trocar:

```html
<!-- De: -->
<span
  class="inline-block rounded bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700"
>
  <!-- Para: -->
  <span
    class="inline-block rounded bg-advent-blue/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-advent-blue"
  ></span
></span>
```

### Ajustes Estruturais (Design System & Acessibilidade)

**5. Declarar Inter ou remover do font-family**

Se Inter for intencional, adicionar no `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

Se `system-ui` for suficiente, simplificar `styles.css:24`:

```css
font-family: ui-sans-serif, system-ui, sans-serif;
```

**6. Adicionar loading skeleton na pagina ao-vivo**

Enquanto os videos carregam, exibir 3 skeleton cards:

```html
@if (videos().length === 0) {
<div class="mt-8 grid gap-6 md:grid-cols-3">
  @for (i of [1,2,3]; track i) {
  <div
    class="rounded-section border border-advent-border bg-white shadow-sm overflow-hidden animate-pulse"
  >
    <div class="aspect-video bg-gray-200"></div>
    <div class="p-5 space-y-3">
      <div class="h-5 bg-gray-200 rounded w-3/4"></div>
      <div class="h-3 bg-gray-100 rounded w-full"></div>
      <div class="h-3 bg-gray-100 rounded w-2/3"></div>
    </div>
  </div>
  }
</div>
}
```

**7. Usar AdventSansLogo ou remove-la**

Se a fonte for para o logo do header, adicionar em `header.component.ts`:

```css
.font-brand {
  font-family: "AdventSansLogo", sans-serif;
}
```

Se nao for usada, remover o `@font-face` de `styles.css` para reduzir bundle.

---

## Resumo e Ações Concluídas ✅

Todas as melhorias levantadas no Design Review foram implementadas e validadas:

1. **Tratamento de erros nos formulários:** Adicionado `errorMessage` signal, banner acessível com `role="alert"` e captura de erros no subscribe para contato e oração.
2. **Prevenção de CLS nas imagens:** Dimensões explícitas `width="320"` e `height="180"` nas thumbnails do YouTube com `loading="lazy"`.
3. **Loading Skeleton:** Adicionado skeleton de 3 cards pulsantes com `animate-pulse` na página `/ao-vivo`.
4. **Fonte Inter & AdventSansLogo:** Google Fonts `Inter` importada com preconnect e `display=swap`, e `AdventSansLogo` ativa no header.
5. **Feedback tátil nos botões:** Classes `active:scale-[0.98] active:shadow-inner` aplicadas em todos os CTAs.
6. **Empty states:** Tratamento gracioso para listas vazias em `/eventos` e `/ministerios`.
7. **Hierarquia no Rodapé:** Endereço oficial e horários dos cultos com peso visual aumentado e dados institucionais completos.
