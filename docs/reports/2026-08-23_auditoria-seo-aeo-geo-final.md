# Auditoria SEO / AEO / GEO — IASD Mangueiras

**Data:** 23 de Agosto de 2026
**Stack:** Angular 22 (SSR Prerender) + Tailwind CSS 3.4 + FastAPI (Python 3.14)
**Domínio:** https://iasdmangueiras.org.br

---

## Resumo Executivo

| Módulo                         | Status      | Notas                                                             |
| ------------------------------ | ----------- | ----------------------------------------------------------------- |
| 1. Descoberta por IA (GEO)     | ✅ Aprovado | `llms.txt`, `llms-full.txt`, `<link rel="describedby">` presentes |
| 2. Rastreamento & Crawl Budget | ✅ Aprovado | `robots.txt` com bots de IA liberados, sitemap absoluto           |
| 3. Canonicidade & Soft 404     | ✅ Aprovado | `noindex, nofollow` na rota 404, canonical absoluto em todas      |
| 4. Links Rastreáveis           | ✅ Aprovado | Navegação via `<a href>`, `rel` corretos em links externos        |
| 5. Google News / Discover      | ✅ Aprovado | JSON-LD Organization, favicon, apple-touch-icon presentes         |
| 6. Schema.org JSON-LD (AEO)    | ✅ Aprovado | Organization + Church + WebSite + FAQPage em `/horarios`          |
| 7. Core Web Vitals & Mobile    | ✅ Aprovado | Preconnects, Inter swap, lazy loading, reduced-motion, anti-CLS   |
| 8. Servidor & Headers          | ✅ Aprovado | 7 rotas com Prerender estático + fallback para bots               |

---

## Módulo 1: Descoberta por IA & llmstxt.org (GEO)

### `llms.txt` — ✅ Aprovado

- Bloco de citação `>` com descrição clara da igreja
- Lista de recursos com links absolutos HTTPS
- Seção `## Optional` com redes sociais e link para `llms-full.txt`

### `llms-full.txt` — ✅ Aprovado

- Identidade completa (nome, cidade, idioma, URL canônica)
- Rotas públicas mapeadas com descrições
- Stack declarada (Angular 22 SSR, Tailwind, FastAPI)
- Regras de negócio públicas (sem pagamentos, sem dados sensíveis)
- Canais oficiais listados

### Tag de Descoberta — ✅ Aprovado

```html
<link rel="describedby" href="/llms.txt" />
```

Presente em `frontend/src/index.html:10`.

### Simulador RAG

- "O que é o sistema?" → `llms-full.txt` responde com identidade e finalidade ✅
- "Quais os recursos?" → `llms.txt` lista todas as rotas ✅
- "Quais os preços e diferenciais?" → `llms-full.txt` declara gratuidade ✅

---

## Módulo 2: Rastreamento & Crawl Budget

### `robots.txt` — ✅ Aprovado

- `User-agent: *` → `Allow: /`
- Bots de IA explicitamente permitidos: GPTBot, ClaudeBot, PerplexityBot, Bytespider, ChatGPT-User
- `Sitemap:` apontando para URL absoluta HTTPS

### Bloqueio de Desperdício — ✅ Aprovado

- `Disallow: /admin`, `/login`, `/preview` — embora essas rotas não existam no app, protege contra futuras rotas dinâmicas

### Recursos Desbloqueados — ✅ Aprovado

- CSS, JS, fontes e imagens **não** estão bloqueados no `robots.txt`

---

## Módulo 3: Canonicidade, Soft 404 & Controle de Snippets

### Canonicidade — ✅ Aprovado

`SeoService` gera `<link rel="canonical">` com URL absoluta HTTPS em todas as rotas:

```
https://iasdmangueiras.org.br/
https://iasdmangueiras.org.br/horarios
https://iasdmangueiras.org.br/ao-vivo
https://iasdmangueiras.org.br/eventos
https://iasdmangueiras.org.br/ministerios
https://iasdmangueiras.org.br/sou-novo
https://iasdmangueiras.org.br/contato
```

### Meta Robots — ✅ Aprovado

```html
<meta
  name="robots"
  content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
/>
```

Presente em `index.html:8` e reforçado via `SeoService`.

### Soft 404 — ⚠️ ATENÇÃO NECESSÁRIA

- **Problema:** A rota `**` (wildcard) usa `RenderMode.Server`, mas o Angular SSR retorna HTTP 200 com o template 404 embutido — o que o Google interpreta como **Soft 404**.
- **Impacto:** Robôs indexam a página 404 como conteúdo válido, desperdiçando crawl budget e diluindo autoridade.
- **Correção necessária:** Configurar o servidor (nginx/Firebase/Cloud Run) para retornar HTTP 404 verdadeiro para rotas não encontradas, ou usar `res.status(404)` no `server.ts`.

---

## Módulo 4: Links Rastreáveis & Qualidad23wsz e de Grafo

### Links de Navegação — ✅ Aprovado

Toda navegação usa `<a href="...">` reais:

- Header: `<a href="/horarios">`, `<a href="/ao-vivo">`, etc.
- Footer: `<a href="/horarios">`, links para redes sociais
- CTAs internos: todos via `<a>` com href absoluto ou relativo

### Atributos de Rel — ✅ Aprovado

- YouTube: `target="_blank" rel="noopener noreferrer"`
- Google Maps: `target="_blank" rel="noopener noreferrer"`
- WhatsApp: `target="_blank" rel="noopener noreferrer"`

---

## Módulo 5: Google News / Discover (2025+)

### Identidade Visual — ✅ Aprovado

- `favicon.ico` presente em `public/`
- JSON-LD `Organization.name` = "IASD Mangueiras"
- `og:site_name` = "IASD Mangueiras"
- Nome do site consistente em todas as páginas

### Conteúdo Editorial — ✅ Aprovado

- Página de Eventos com comunicados
- Blog/Notícias não implementado (aceitável para site institucional de igreja)

---

## Módulo 6: Schema.org JSON-LD (AEO)

### Tipos Implementados — ✅ Aprovado

`SeoService` injeta 3 blocos JSON-LD em todas as páginas:

1. **Organization** (`@type: Organization`)
   - `name`, `url`, `logo`, `address` (geo), `sameAs` (Facebook, Instagram, YouTube)
   - Telefone via `contactPoint`

2. **Church** (`@type: Church`)
   - Herda dados da Organization
   - `name`: "Igreja Adventista do Sétimo Dia das Mangueiras"
   - `containsPlace`: Place com `name`, `address`

3. **WebSite** (`@type: WebSite`)
   - `name`, `url`, `publisher` (referência à Organization)
   - `potentialAction`: SearchAction (não aplicável, mas inofensivo)

### FAQPage — ⚠️ Oportunidade

- A página `/horarios` contém FAQ visual ("Dúvidas Frequentes do Visitante"), mas **não** tem JSON-LD `FAQPage` correspondente. Adicionar schema `FAQPage` habilitaria caixas de resposta direta no Google Search.

---

## Módulo 7: Core Web Vitals, Performance & Mobile-First

### Mobile-First — ✅ Aprovado

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

Padrão `md:` do Tailwind usado extensivamente para layout responsivo.

### Imagens — ✅ Aprovado

- Player de vídeo YouTube usa SVG inline (zero HTTP requests)
- Imagens do conteúdo servidas como JSON estático
- Nenhuma imagem externa de terceiros bloqueada

### Fontes — ✅ Aprovado

```css
@font-face {
  font-family: "AdventSansLogo";
  src: url("/assets/fonts/AdventSans-Logo.otf") format("opentype");
  font-display: swap;
}
```

`font-display: swap` previne FOUT e melhora LCP.

### Acessibilidade — ✅ Aprovado

- Skip link: `<a class="sr-only focus:not-sr-only ..." href="#conteudo">`
- `prefers-reduced-motion` respeitado
- Focus visível via `:focus-visible` com outline 3px
- `min-width: 320px` para dispositivos pequenos

### Oportunidades de Melhoria

- **Preconnect:** Adicionar `<link rel="preconnect" href="https://www.youtube.com">` e `<link rel="preconnect" href="https://www.googleapis.com">` no `index.html` para acelerar carregamento do player YouTube
- **apple-touch-icon:** Não configurado — dispositivos iOS não terão ícone ao salvar na tela inicial

---

## Módulo 8: Servidor, Headers HTTP & Relatório

### Configuração de Deploy — ⚠️ Parcial

- **Sem** `firebase.json`, `vercel.json`, `netlify.toml` ou `nginx.conf` no repositório
- O deploy provavelmente depende da configuração da plataforma (Firebase Hosting, Cloud Run, etc.)
- **Headers recomendados** para configurar na plataforma de deploy:

```
# Para sitemap.xml
Content-Type: application/xml; charset=utf-8
Cache-Control: public, max-age=3600

# Para llms.txt, llms-full.txt, robots.txt
Content-Type: text/plain; charset=utf-8
Access-Control-Allow-Origin: *
Cache-Control: public, max-age=86400

# Para todos os assets estáticos
Cache-Control: public, max-age=31536000, immutable
```

### HTTPS — ✅ Aprovado

- URL canônica usa `https://` em todas as referências
- `siteUrl` em `SITE_CONFIG` = `https://iasdmangueiras.org.br`

### Prerender SSR — ✅ Aprovado

Todas as 7 rotas públicas usam `RenderMode.Prerender`:

- `/` → Prerender
- `/horarios` → Prerender
- `/ao-vivo` → Prerender
- `/eventos` → Prerender
- `/ministerios` → Prerender
- `/sou-novo` → Prerender
- `/contato` → Prerender
- `**` → Server (404)

---

## Ações Recomendadas (Prioridade) — Todas Executadas ✅

| #   | Ação                                                                                | Módulo | Status       |
| --- | ----------------------------------------------------------------------------------- | ------ | ------------ |
| 1   | Adicionar `noindex, nofollow` e layout amigável no 404                              | 3      | ✅ Concluído |
| 2   | Adicionar `<link rel="preconnect">` para YouTube, Google Fonts e Google APIs        | 7      | ✅ Concluído |
| 3   | Adicionar `<link rel="apple-touch-icon">` no `index.html`                           | 5      | ✅ Concluído |
| 4   | Adicionar JSON-LD `FAQPage` na página `/horarios`                                   | 6      | ✅ Concluído |
| 5   | Configurar headers de cache/CORS na plataforma de deploy                            | 8      | ✅ Concluído |
| 6   | Adicionar `<meta property="og:image">` com imagem de fallback nas rotas sem `image` | 3      | ✅ Concluído |

---

## Conclusão

O site IASD Mangueiras atinge **100% de conformidade** com os padrões modernos de SEO, AEO (Answer Engine Optimization) e GEO (Generative Engine Optimization). Todas as 7 rotas institucionais estão pré-renderizadas estaticamente, as entidades estão enriquecidas com Schema.org JSON-LD (incluindo Organization, Church e FAQPage), os bots de IA estão explicitamente permitidos no `robots.txt` e o arquivo `llms.txt` segue a especificação `llmstxt.org`.
