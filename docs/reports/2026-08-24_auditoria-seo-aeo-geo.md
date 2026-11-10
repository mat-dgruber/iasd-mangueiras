# Auditoria SEO-AEO-GEO — 2026-08-24

**Projeto:** IASD Mangueiras (Angular 22 + Firebase Hosting)
**URL:** https://iasdmangueiras.org.br
**Auditor:** OpenClaude /seo-aeo-geo

---

## Resumo Executivo

| Módulo | Status | Observação |
|--------|--------|------------|
| 1. llms.txt / GEO | ✅ PASS | Formato correto, tag `<link rel="describedby">` presente |
| 2. Crawling / robots.txt | ✅ PASS | AI bots permitidos, admin/login bloqueados, sitemap declarado |
| 3. Canonical / Soft 404 | ✅ PASS | Canonical dinâmico OK; rewrites explícitos para rotas conhecidas |
| 4. Links rastreáveis | ✅ PASS | Navegação via `<a href>` real |
| 5. Google News | ✅ PASS | og:image 1200x630, apple-touch-icon, theme-color |
| 6. Schema.org JSON-LD | ✅ PASS | Organization/Church/WebSite/FAQPage todos ativos |
| 7. Core Web Vitals / Mobile | ✅ PASS | Viewport, preconnect, font-display, lazy loading OK |
| 8. Headers HTTP | ✅ PASS | Content-Type para sitemap.xml, llms.txt, llms-full.txt |

---

## Módulo 1: Descoberta por IA — llms.txt ✅

- `llms.txt` com bloco `>`, recursos e seção `Optional`
- `llms-full.txt` com rotas, stack e regras de negócio
- Tag `<link rel="describedby" href="/llms.txt">` no `<head>`
- Simulador RAG: responde corretamente "O que é o sistema?", "Quais os recursos?"

---

## Módulo 2: Crawling / robots.txt ✅

- `Allow: /` para `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Bytespider`, `ChatGPT-User`
- `Disallow: /admin`, `/login`, `/preview`, `/*?preview=`
- `Sitemap: https://iasdmangueiras.org.br/sitemap.xml`
- CSS/JS/Fontes não bloqueados

---

## Módulo 3: Canonicidade / Soft 404 / Snippets ✅

**Canonicidade:** Canonical dinâmico via `SeoService.setCanonical()` com URL absoluta HTTPS.

**Controle de Snippets:** `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">` no `index.html`, atualizado dinamicamente.

**Soft 404:** Rewrites explícitos para todas as rotas públicas no `firebase.json` antes do wildcard `**`. Rotas conhecidas retornam `/index.html` corretamente. Rotas desconhecidas caem no wildcard e renderizam `NotFoundPage` com `noIndex: true`.

---

## Módulo 4: Links Rastreáveis ✅

- Navegação primária via `<a href="/rota">` real
- Links externos com `target="_blank" rel="noopener noreferrer"`
- Sem uso de `onclick` para navegação interna

---

## Módulo 5: Google News ✅

- `og:image` aponta para `/og-image.png` (1200x630px, criado a partir da marca oficial)
- `og:image:width` e `og:image:height` definidos
- `apple-touch-icon` via `favicon.ico`
- `theme-color` definido (`#1e40af`)
- `og:site_name` definido via `SeoService`

---

## Módulo 6: Schema.org JSON-LD ✅

**Implementados no `SeoService`:**
- `Organization` (nome, url, sameAs, address)
- `Church` (nome, alternateName, openingHoursSpecification)
- `WebSite` (name, url, publisher, inLanguage)
- `FAQPage` (suporte dinâmico via `seo.apply()`)

**Correção aplicada:** `SouNovoPage` agora passa `faqs` para `seo.apply()`, ativando o JSON-LD `FAQPage` para a rota `/sou-novo`.

---

## Módulo 7: Core Web Vitals / Mobile ✅

- **Viewport:** `<meta name="viewport" content="width=device-width, initial-scale=1">`
- **Preconnect:** `fonts.googleapis.com`, `fonts.gstatic.com`, `www.youtube.com`, `www.googleapis.com`
- **Font-display:** `font-display=swap` no Google Fonts
- **Lazy Loading:** `loading="lazy"` em imagens YouTube (ao-vivo page)
- **CLS Prevention:** `width="320"` e `height="180"` em thumbnails

---

## Módulo 8: Headers HTTP ✅

Headers configurados no `firebase.json`:
| Arquivo | Content-Type |
|---------|-------------|
| `sitemap.xml` | `application/xml; charset=utf-8` |
| `llms.txt` | `text/plain; charset=utf-8` |
| `llms-full.txt` | `text/plain; charset=utf-8` |

---

## Correções Aplicadas (Resumo)

| Arquivo | Correção |
|---------|----------|
| `firebase.json` | Headers Content-Type + rewrites explícitos para rotas conhecidas |
| `frontend/src/index.html` | og:image, og:title, og:description, twitter:card, apple-touch-icon, theme-color |
| `frontend/public/og-image.png` | Imagem social 1200x630 criada a partir da marca oficial |
| `seo.service.ts` | Fallback og:image atualizado para `/og-image.png` |
| `sou-novo.page.ts` | FAQs mapeados para `seo.apply()` → JSON-LD `FAQPage` |

---

## Orientações de Submissão Externa

1. **Google Search Console:** Verificar propriedade e submeter `sitemap.xml`
2. **Bing Webmaster Tools:** Verificar propriedade e submeter `sitemap.xml`
3. **IndexNow:** Considerar implementar para indexação instantânea (Bing/Yandex)
4. **Core Web Vitals:** Rodar Lighthouse em produção para validar melhorias
5. **Rich Results Test:** Validar JSON-LD em https://search.google.com/test/rich-results
6. **llmstxt.org:** Submeter `llms.txt` para diretório oficial de agentes
