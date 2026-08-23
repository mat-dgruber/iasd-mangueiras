# Frontend — IASD Mangueiras ⛪

Aplicação web institucional oficial da **Igreja Adventista do Sétimo Dia das Mangueiras (Tatuí-SP)**, desenvolvida em **Angular 22** com **SSR e Prerender estático** (`@angular/ssr`), **Tailwind CSS 3.4.17** e foco total em **acessibilidade (WCAG AA)**, **SEO**, **AEO** e **GEO**.

---

## 🛠️ Stack Tecnológica

- **Framework:** [Angular 22](https://angular.dev/) (Standalone Components, Signals, novo Control Flow `@if`/`@for`, TypeScript strict)
- **Renderização:** Server-Side Rendering (SSR) & Prerender Estático de 7 rotas com `@angular/ssr`
- **Estilização:** [Tailwind CSS 3.4.17](https://tailwindcss.com/) com paleta de cores institucional da IASD
- **Tipografia:** `Inter` (leitura/interface) e `AdventSansLogo` (display/identidade)
- **Testes Unitários:** [Vitest](https://vitest.dev/) via `@angular/build`
- **SEO & AEO/GEO:**
  - Dados Estruturados Schema.org (`Organization`, `WebSite`, `Church`)
  - `robots.txt` com autorização explícita para agentes de IA (GPTBot, ClaudeBot, PerplexityBot, Bytespider, etc.)
  - Sitemap XML absoluto (`https://iasdmangueiras.org.br/sitemap.xml`)
  - Mapas para LLMs (`public/llms.txt`, `public/llms-full.txt` e `<link rel="describedby">`)

---

## 📂 Estrutura de Pastas

```text
frontend/
├── public/                        # Arquivos públicos e estáticos
│   ├── favicon.ico
│   ├── llms.txt                   # Resumo indexável para agentes de IA
│   ├── llms-full.txt              # Mapa completo do site para agentes de IA
│   ├── robots.txt                 # Políticas de rastreamento para bots e IA
│   └── sitemap.xml                # Sitemap XML das rotas canônicas
├── scripts/
│   ├── verify-prerender-content.mjs # Validador de HTML pré-renderizado
│   └── verify-public-seo.mjs        # Validador de arquivos SEO/GEO
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── models/            # Interfaces tipadas (content.models, youtube.models, contato.models)
│   │   │   ├── seo/               # SeoService e tipos de metadados/JSON-LD
│   │   │   ├── services/          # ContentService, YoutubeService, ContatoService
│   │   │   └── site/              # Configuração global pública (site.config.ts)
│   │   ├── features/
│   │   │   ├── home/              # Página inicial (hero, horários, live, eventos, ministérios)
│   │   │   ├── horarios/          # Horários semanais, localização com Google Maps e FAQ
│   │   │   ├── ao-vivo/           # Player ao vivo, série Presente 7 e mensagens gravadas
│   │   │   ├── eventos/           # Agenda de eventos e avisos gerais
│   │   │   ├── ministerios/       # Ministérios ativos e área de voluntariado
│   │   │   ├── sou-novo/          # Guia de acolhimento e perguntas frequentes do visitante
│   │   │   ├── contato/           # Formulários reativos (Fale Conosco / Pedido de Oração) + WhatsApp
│   │   │   └── not-found/         # Página 404 personalizada
│   │   ├── layout/
│   │   │   ├── header/            # Header responsivo com acesso a horários e WhatsApp
│   │   │   └── footer/            # Rodapé institucional com redes oficiais e link de dízimos
│   │   ├── app.config.ts          # Providers standalone (provideHttpClient com fetch, Router, etc.)
│   │   ├── app.routes.ts          # Definição das rotas públicas
│   │   └── app.routes.server.ts   # Render modes (Prerender por rota)
│   ├── assets/
│   │   ├── brand/                 # Logos e marcas oficiais locais
│   │   └── fonts/                 # AdventSans-Logo.otf
│   ├── content/                   # Arquivos de dados JSON editáveis (horários, eventos, avisos, ministérios)
│   ├── styles.css                 # Importações Tailwind e estilos base
│   └── index.html                 # HTML base com meta robots e discovery link
├── angular.json
├── package.json
└── tailwind.config.js
```

---

## 🧭 Rotas Pré-renderizadas

| Rota           | Descrição                                                            |
| -------------- | -------------------------------------------------------------------- |
| `/`            | Página inicial com destaques, próximo encontro e CTAs                |
| `/horarios`    | Programação de cultos (sábados 9h/10h15, quartas 19h30), mapa e rota |
| `/ao-vivo`     | Transmissão de cultos ao vivo, série _Presente 7_ e mensagens        |
| `/eventos`     | Agenda de semanas especiais, eventos comunitários e avisos           |
| `/ministerios` | Ministérios da igreja e oportunidades de serviço                     |
| `/sou-novo`    | Guia completo de primeira visita para novos amigos                   |
| `/contato`     | Formulários de contato, pedidos de oração e link direto do WhatsApp  |

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos

- Node.js >= `24.15.0` (ou utilize `npx -y -p node@24.15.0 -c '<comando>'`).

### 2. Instalar dependências

```bash
cd frontend
npm install
```

### 3. Iniciar o servidor de desenvolvimento (SPA com live reload)

```bash
npm start
# ou: ng serve
```

Acesse em: `http://localhost:4200`

### 4. Build de Produção com SSR & Prerender

```bash
npm run build
```

O build compila o bundle do cliente em `dist/frontend/browser` e o servidor Node/Express em `dist/frontend/server`, gerando o HTML estático de todas as 7 rotas públicas.

### 5. Executar o Servidor SSR Localmente

```bash
npm run serve:ssr:frontend
```

Acesse em: `http://localhost:4000`

---

## 🧪 Testes e Verificações Automatizadas

### Rodar testes unitários (Vitest)

```bash
npm test -- --watch=false
```

### Validar arquivos de SEO/GEO e Descoberta por IA

```bash
node scripts/verify-public-seo.mjs
```

### Validar conteúdo renderizado no HTML estático do Prerender

```bash
node scripts/verify-prerender-content.mjs
```

### Executar pipeline completa de verificação

```bash
npm test -- --watch=false && npm run build && node scripts/verify-public-seo.mjs && node scripts/verify-prerender-content.mjs
```
