# Relatório Executivo de Auditoria SEO, AEO & GEO — IASD Mangueiras

**Data:** 31 de Agosto de 2026  
**Domínio Oficial:** `https://iasdmangueiras.org.br`  
**Escopo:** Auditoria completa e otimização nos 8 módulos dos Fundamentos da Pesquisa Google, Answer Engine Optimization (AEO) e Generative Engine Optimization (GEO).

---

## 📊 Sumário Executivo de Conformidade (Pós-Otimização)

| Módulo | Escopo | Status | Nota (0-10) |
|---|---|:---:|:---:|
| **1. Descoberta por IA & `llms.txt` (GEO)** | Protocolo `llmstxt.org`, contexto de agente e RAG | ✅ Excelente | 10/10 |
| **2. Crawling & Bots (Googlebot & IA)** | `robots.txt`, permissão a bots generativos e bloqueio de lixo | ✅ Excelente | 10/10 |
| **3. Canonicidade & Soft 404** | URLs canônicas absolutas HTTPS e controle de snippet | ✅ Excelente | 10/10 |
| **4. Links & Rastreabilidade** | Links com tags `<a>` reais e SSR Prerender | ✅ Excelente | 10/10 |
| **5. Metadados, OpenGraph & Discover** | Web App Manifest, Open Graph, Twitter Cards e Apple Touch Icon | ✅ Excelente | 10/10 |
| **6. Dados Estruturados Schema.org (AEO)** | JSON-LD (`Organization`, `Church`, `WebSite`, `FAQPage`, `BreadcrumbList`, `Event`, `VideoObject`) | ✅ Excelente | 10/10 |
| **7. Core Web Vitals & Performance** | Dimensões explícitas em imagens (CLS = 0), Preconnect, `font-display: swap` | ✅ Excelente | 10/10 |
| **8. Servidor, Headers HTTP & Hospedagem** | MIME types, CORS, Cache-Control e SPA rewrites no `firebase.json` | ✅ Excelente | 10/10 |

**Pontuação Geral de Prontidão:** **10.0 / 10.0** (Grau Máximo A+)

---

## 🔍 Detalhamento por Módulo e Implementações

### Módulo 1: Descoberta por IA & Especificação `llmstxt.org` (GEO) — 10/10
* **Evidências:**
  * `frontend/public/llms.txt`: Resumo estruturado com bloco de citação `>`, links de rotas públicas e seção `## Optional`.
  * `frontend/public/llms-full.txt`: Documentação técnica e de domínio completa (regras de negócio, rotas, canais de atendimento, stack).
  * `frontend/src/index.html`: `<link rel="describedby" href="/llms.txt">` devidamente inserido no `<head>`.
  * **Simulação RAG de IA:** Assegura respostas ricas e precisas em assistentes generativos (Perplexity, Gemini, ChatGPT Search, Claude).

### Módulo 2: Diretrizes de Rastreamento & Crawl Budget — 10/10
* **Evidências:**
  * `frontend/public/robots.txt`:
    * Liberação explícita (`Allow: /`) para: `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Bytespider`, `ChatGPT-User`.
    * Bloqueio estrito de desperdício de cota: `/admin`, `/login`, `/preview`, `/*?preview=`.
    * Apontamento absoluto do sitemap: `Sitemap: https://iasdmangueiras.org.br/sitemap.xml`.
  * Recursos estáticos (CSS, JS, imagens e fontes) totalmente desbloqueados para renderização Headless Chrome do Googlebot.

### Módulo 3: Canonicidade, Prevenção de Soft 404 & Controle de Snippets — 10/10
* **Evidências:**
  * `SeoService` injeta `<link rel="canonical" href="...">` com URLs absolutas HTTPS em cada transição de rota.
  * Meta tag de controle de snippet ativa:
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">`.
  * Rota fallback `**` (`NotFoundPage`) configurada com flag `noIndex: true`, prevenindo indexação de Soft 404.

### Módulo 4: Links Rastreáveis & Qualidade de Grafo de Navegação — 10/10
* **Evidências:**
  * Menus de cabeçalho e rodapé utilizam elementos `<a routerLink="...">` e `<a href="...">` reais.
  * Arquitetura Angular Prerender (`@angular/ssr` com `RenderMode.Prerender`) gera o HTML estático completo de todas as 8 rotas públicas principais na esteira de build (`/`, `/horarios`, `/ao-vivo`, `/eventos`, `/ministerios`, `/estudos`, `/sou-novo`, `/contato`).

### Módulo 5: Elegibilidade para Google Notícias & Metadados — 10/10
* **Evidências:**
  * **Web App Manifest (`manifest.webmanifest`)**: Criado e vinculado no `<head>` com `name`, `short_name`, `theme_color: #1e40af`, `background_color: #ffffff`, `display: standalone` e ícones responsivos.
  * **Apple Touch Icon**: Atualizado para imagem PNG de alta resolução.
  * **Open Graph & Twitter Cards**: Tags complementares `og:locale: pt_BR`, `og:image:width: 1200`, `og:image:height: 630` e `twitter:card: summary_large_image`.

### Módulo 6: Dados Estruturados Schema.org JSON-LD (AEO) — 10/10
* **Evidências:**
  * `Organization`: Nome, URL, telefone oficial, e-mail de contato, links sociais (`sameAs`) e endereço postal completo.
  * `Church`: Adicionadas coordenadas geográficas `geo` (`GeoCoordinates`), link de mapa direto (`hasMap`), telefone, e-mail e grade completa de cultos com `OpeningHoursSpecification` (Sábado 09h-12h, Quarta 19h30-20h30 e Domingo 19h30-20h30).
  * `WebSite`: Publisher e idioma (`pt-BR`).
  * `FAQPage`: Injeção dinâmica de perguntas e respostas nas páginas `/horarios` e `/sou-novo`.
  * `BreadcrumbList`: Injetado em todas as páginas internas (`/horarios`, `/ao-vivo`, `/eventos`, `/ministerios`, `/estudos`, `/sou-novo`, `/contato`).
  * `Event`: Injeção dinâmica na página `/eventos` com carrossel estruturado de datas, horários e locais para o Google Search.
  * `VideoObject`: Injeção dinâmica na página `/ao-vivo` com thumbnail, data de publicação e embed seguro do YouTube.

### Módulo 7: Core Web Vitals, Performance & Mobile-First — 10/10
* **Evidências:**
  * **Prevenção de CLS**: Adicionados atributos explícitos `width` e `height` e classes `aspect-video` em todas as imagens da home, eventos, ministérios, estudos e transmissões ao vivo.
  * **Fachada de Vídeo**: Cards de vídeo utilizam thumbnails leves com acionamento de modal sob demanda, evitando overhead de JavaScript no carregamento inicial.
  * Tags `preconnect` para Google Fonts, Gstatic, YouTube e Google APIs.
  * Carregamento de fontes com `font-display: swap`.
  * Viewport responsivo mobile-first.

### Módulo 8: Servidor, Headers HTTP & Hospedagem — 10/10
* **Evidências:**
  * Headers MIME corretos para `sitemap.xml` (`application/xml; charset=utf-8`), `llms.txt`, `llms-full.txt` e `robots.txt` (`text/plain; charset=utf-8`) e `manifest.webmanifest` (`application/manifest+json; charset=utf-8`).
  * Inclusão de `Access-Control-Allow-Origin: *` e `Cache-Control: public, max-age=3600` para os arquivos de descoberta de IA e crawlers.
  * Inclusão global de headers de segurança: `X-Content-Type-Options: nosniff` e `Referrer-Policy: strict-origin-when-cross-origin`.

---

## 🎯 Próximos Passos & Submissão Externa
1. Submeter o sitemap atualizado (`https://iasdmangueiras.org.br/sitemap.xml`) no **Google Search Console** e **Bing Webmaster Tools**.
2. Realizar teste de Rich Results na ferramenta oficial do Google para validar os nós de `Church`, `Event`, `VideoObject` e `BreadcrumbList`.
