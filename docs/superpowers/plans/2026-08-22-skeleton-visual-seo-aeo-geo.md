# Skeleton Visual + SEO/AEO/GEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar o primeiro skeleton Angular SSR do site IASD Mangueiras aplicando os guias de marca/design aprovados e já deixando SEO, AEO e GEO planejados desde a base.

**Architecture:** O frontend nasce em `frontend/` como Angular 22 standalone com SSR/prerender, Tailwind CSS 3.4.17 e rotas institucionais renderizáveis por buscadores. A identidade visual vem de `docs/design/brand-guidelines.md`; SEO/AEO/GEO entra como contrato transversal: metadata por rota, JSON-LD, `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt` e links rastreáveis desde o skeleton.

**Tech Stack:** Angular 22 SSR/prerender, Node >=24.15.0 para comandos Angular, TypeScript strict, standalone components, Angular signals, novo control flow, Tailwind CSS 3.4.17, PrimeNG 21+ somente quando economizar complexidade real, Markdown/JSON para conteúdo inicial.

## Global Constraints

- Responder e documentar em português do Brasil.
- Angular 22 com SSR/prerender é obrigatório; nunca transformar em SPA client-only.
- Comandos Angular devem usar Node >=24.15.0; no ambiente atual, usar `npx -y -p node@24.15.0 -c '<comando>'` quando o Node global estiver abaixo disso.
- Tailwind CSS 3.4.17 é obrigatório; não trocar por Angular Material, Bootstrap ou estilos inline.
- PrimeNG 21+ só quando economizar complexidade real.
- Backend FastAPI não nasce neste plano; ele só começa na Fase 3 do `docs/PLAN.md`.
- Não adicionar deploy, CI/CD, hooks, sandbox ou automações sem necessidade atual explícita.
- Usar `docs/design/brand-guidelines.md` e `docs/design/design.md` como contrato visual.
- `AdventSans-Logo.otf` é fonte de marca/display; Inter é fonte de leitura/interface.
- Site deve ser mobile-first, WCAG AA, com foco visível e corpo de texto nunca abaixo de 16px.
- Toda navegação rastreável deve usar `<a href="...">`; não depender apenas de clique JavaScript.
- SEO/AEO/GEO deve incluir canônicas absolutas HTTPS, snippet robots, JSON-LD, sitemap, robots e llms.
- Nenhuma chave da YouTube API ou segredo entra no frontend.

---

## File Structure

- Create: `frontend/` — app Angular SSR completo do MVP inicial.
- Create: `frontend/src/assets/fonts/AdventSans-Logo.otf` — cópia local da fonte de marca.
- Create: `frontend/src/assets/brand/` — cópias otimizáveis dos assets de marca locais.
- Create: `frontend/src/app/app.routes.ts` — rotas públicas do site.
- Create: `frontend/src/app/app.routes.server.ts` — render modes SSR/prerender por rota.
- Create: `frontend/src/app/core/site/site.config.ts` — dados públicos do site e canais oficiais.
- Create: `frontend/src/app/core/seo/seo.service.ts` — aplicação de title/meta/canonical/JSON-LD.
- Create: `frontend/src/app/core/seo/seo.types.ts` — interfaces de metadata.
- Create: `frontend/src/app/layout/header/header.component.ts` — header rastreável e mobile-first.
- Create: `frontend/src/app/layout/footer/footer.component.ts` — footer com endereço, horários e redes.
- Create: `frontend/src/app/features/home/home.page.ts` — home skeleton com hero, horários, live, eventos e próximo passo.
- Create: `frontend/src/app/features/horarios/horarios.page.ts` — página de horários.
- Create: `frontend/src/app/features/ao-vivo/ao-vivo.page.ts` — página de transmissão com estados básicos.
- Create: `frontend/src/app/features/eventos/eventos.page.ts` — página de eventos/comunicados inicial.
- Create: `frontend/src/app/features/ministerios/ministerios.page.ts` — página de ministérios inicial.
- Create: `frontend/src/app/features/sou-novo/sou-novo.page.ts` — página para visitante.
- Create: `frontend/src/app/features/contato/contato.page.ts` — página de contato/oração inicial.
- Create: `frontend/src/app/features/not-found/not-found.page.ts` — página 404 real no SSR.
- Create: `frontend/src/content/*.json` — conteúdo institucional inicial.
- Create: `frontend/public/robots.txt` — política de rastreamento.
- Create: `frontend/public/sitemap.xml` — sitemap inicial estático.
- Create: `frontend/public/llms.txt` — resumo para agentes/IA.
- Create: `frontend/public/llms-full.txt` — mapa completo para agentes/IA.
- Create: `frontend/public/favicon.svg` — favicon derivado da marca, se asset vetorial existir; caso contrário, usar PNG convertido em passo separado aprovado.
- Modify: `docs/PLAN.md` — marcar o plano como referência para Fase 1 e Fase 5 quando executado.

---

### Task 1: Criar o app Angular SSR mínimo

**Files:**
- Create: `frontend/`
- Create: `frontend/angular.json`
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/src/main.ts`
- Create: `frontend/src/main.server.ts`
- Create: `frontend/src/app/app.config.ts`
- Create: `frontend/src/app/app.config.server.ts`
- Create: `frontend/src/app/app.routes.ts`
- Create: `frontend/src/app/app.routes.server.ts`

**Interfaces:**
- Consumes: `docs/ARCHITECTURE.md`, `docs/AI_RULES.md`, `docs/PLAN.md`.
- Produces: app Angular SSR em `frontend/` com comandos `npm run build` e `npm run serve:ssr:frontend`.

- [ ] **Step 1: Criar projeto Angular com SSR**

Run:

```bash
npx -y @angular/cli@latest new frontend --ssr --standalone --routing --style=css --strict --skip-git --package-manager=npm
```

Expected:

```text
CREATE frontend/angular.json
CREATE frontend/package.json
CREATE frontend/src/main.ts
CREATE frontend/src/main.server.ts
```

- [ ] **Step 2: Entrar no app e confirmar versões**

Run:

```bash
cd frontend && npx ng version
```

Expected:

```text
Angular CLI: 22.x.x
Node: >=24.15.0
Package Manager: npm
```

If Angular CLI latest não for 22.x, parar e pedir decisão; não trocar stack.

- [ ] **Step 3: Criar rotas públicas iniciais**

Replace `frontend/src/app/app.routes.ts` with:

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
    title: 'IASD Mangueiras — Igreja Adventista em Tatuí',
  },
  {
    path: 'horarios',
    loadComponent: () => import('./features/horarios/horarios.page').then((m) => m.HorariosPage),
    title: 'Horários — IASD Mangueiras',
  },
  {
    path: 'ao-vivo',
    loadComponent: () => import('./features/ao-vivo/ao-vivo.page').then((m) => m.AoVivoPage),
    title: 'Ao vivo — IASD Mangueiras',
  },
  {
    path: 'eventos',
    loadComponent: () => import('./features/eventos/eventos.page').then((m) => m.EventosPage),
    title: 'Eventos — IASD Mangueiras',
  },
  {
    path: 'ministerios',
    loadComponent: () => import('./features/ministerios/ministerios.page').then((m) => m.MinisteriosPage),
    title: 'Ministérios — IASD Mangueiras',
  },
  {
    path: 'sou-novo',
    loadComponent: () => import('./features/sou-novo/sou-novo.page').then((m) => m.SouNovoPage),
    title: 'Sou novo — IASD Mangueiras',
  },
  {
    path: 'contato',
    loadComponent: () => import('./features/contato/contato.page').then((m) => m.ContatoPage),
    title: 'Contato e oração — IASD Mangueiras',
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.page').then((m) => m.NotFoundPage),
    title: 'Página não encontrada — IASD Mangueiras',
  },
];
```

- [ ] **Step 4: Configurar render modes do SSR**

Replace `frontend/src/app/app.routes.server.ts` with:

```typescript
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'horarios', renderMode: RenderMode.Prerender },
  { path: 'ao-vivo', renderMode: RenderMode.Prerender },
  { path: 'eventos', renderMode: RenderMode.Prerender },
  { path: 'ministerios', renderMode: RenderMode.Prerender },
  { path: 'sou-novo', renderMode: RenderMode.Prerender },
  { path: 'contato', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Server },
];
```

- [ ] **Step 5: Criar páginas inicial compiláveis**

Create each file below with the same pattern, changing class/title/text.

`frontend/src/app/features/home/home.page.ts`:

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo" class="mx-auto max-w-6xl px-4 py-10">
      <h1>IASD Mangueiras</h1>
      <p>Igreja Adventista do Sétimo Dia das Mangueiras em Tatuí-SP.</p>
      <a href="/horarios">Conheça nossos horários</a>
    </main>
  `,
})
export class HomePage {}
```

For the other pages:

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-horarios-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo" class="mx-auto max-w-6xl px-4 py-10">
      <h1>Horários</h1>
      <p>Programações principais da IASD Mangueiras.</p>
      <a href="/">Voltar para início</a>
    </main>
  `,
})
export class HorariosPage {}
```

Use these class/selector/title pairs:

```text
AoVivoPage / app-ao-vivo-page / Ao vivo
EventosPage / app-eventos-page / Eventos
MinisteriosPage / app-ministerios-page / Ministérios
SouNovoPage / app-sou-novo-page / Sou novo por aqui?
ContatoPage / app-contato-page / Contato e oração
NotFoundPage / app-not-found-page / Página não encontrada
```

- [ ] **Step 6: Verificar build SSR**

Run:

```bash
cd frontend && npm run build
```

Expected:

```text
Application bundle generation complete
```

- [ ] **Step 7: Commit**

```bash
git add frontend
 git commit -m "feat: create angular ssr skeleton"
```

---

### Task 2: Aplicar tokens de marca e Tailwind

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`
- Modify: `frontend/src/styles.css`
- Create: `frontend/src/assets/fonts/AdventSans-Logo.otf`
- Create: `frontend/src/assets/brand/README.md`

**Interfaces:**
- Consumes: `docs/design/brand-guidelines.md`, `docs/refs/AdventSans-Logo.otf`.
- Produces: classes Tailwind e fonte `AdventSansLogo` disponíveis no app.

- [ ] **Step 1: Instalar Tailwind 3.4.17**

Run:

```bash
cd frontend && npm install -D tailwindcss@3.4.17 postcss autoprefixer
```

Expected:

```text
added ... packages
found 0 vulnerabilities
```

- [ ] **Step 2: Criar configuração Tailwind**

Create `frontend/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        advent: {
          blue: '#003767',
          'blue-dark': '#003366',
          black: '#000000',
          white: '#FFFFFF',
          neutral: '#F4F4F4',
          border: '#E5E7EB',
          text: '#111827',
          muted: '#4B5563',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        brand: ['AdventSansLogo', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        section: '20px',
      },
      maxWidth: {
        site: '1120px',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 3: Criar PostCSS config**

Create `frontend/postcss.config.js`:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 4: Copiar fonte de marca**

Run:

```bash
cp docs/refs/AdventSans-Logo.otf frontend/src/assets/fonts/AdventSans-Logo.otf
```

Expected:

```text
comando sem saída e arquivo presente em frontend/src/assets/fonts/AdventSans-Logo.otf
```

- [ ] **Step 5: Configurar CSS global**

Replace `frontend/src/styles.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@font-face {
  font-family: 'AdventSansLogo';
  src: url('/assets/fonts/AdventSans-Logo.otf') format('opentype');
  font-display: swap;
}

:root {
  color-scheme: light;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-width: 320px;
  background: #ffffff;
  color: #111827;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

a {
  color: inherit;
}

:focus-visible {
  outline: 3px solid #003767;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

- [ ] **Step 6: Criar nota local dos assets**

Create `frontend/src/assets/brand/README.md`:

```markdown
# Assets de marca

Fonte primária: `docs/refs/`.

Copiar para esta pasta apenas os arquivos usados pela aplicação. Não recolorir, distorcer ou aplicar efeitos decorativos na marca.
```

- [ ] **Step 7: Verificar tokens e build**

Run:

```bash
cd frontend && npm run build
```

Expected:

```text
Application bundle generation complete
```

- [ ] **Step 8: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/tailwind.config.js frontend/postcss.config.js frontend/src/styles.css frontend/src/assets
 git commit -m "feat: add brand tokens and typography"
```

---

### Task 3: Criar configuração pública do site

**Files:**
- Create: `frontend/src/app/core/site/site.config.ts`
- Create: `frontend/src/app/core/site/site.config.spec.ts`

**Interfaces:**
- Consumes: PRD, brand guidelines e canais oficiais.
- Produces: `SITE_CONFIG` usado por layout, SEO e JSON-LD.

- [ ] **Step 1: Criar teste de configuração**

Create `frontend/src/app/core/site/site.config.spec.ts`:

```typescript
import { SITE_CONFIG } from './site.config';

describe('SITE_CONFIG', () => {
  it('define identidade pública rastreável da igreja', () => {
    expect(SITE_CONFIG.name).toBe('IASD Mangueiras');
    expect(SITE_CONFIG.city).toBe('Tatuí');
    expect(SITE_CONFIG.social.youtube).toBe('https://www.youtube.com/c/IASDMangueiras');
    expect(SITE_CONFIG.social.instagram).toBe('https://www.instagram.com/iasdmangueiras/');
    expect(SITE_CONFIG.social.facebook).toBe('https://www.facebook.com/igrejadasmangueiras/?locale=pt_BR');
  });
});
```

- [ ] **Step 2: Rodar teste e confirmar falha**

Run:

```bash
cd frontend && npm test -- --watch=false --include src/app/core/site/site.config.spec.ts
```

Expected:

```text
Cannot find module './site.config'
```

- [ ] **Step 3: Criar configuração mínima**

Create `frontend/src/app/core/site/site.config.ts`:

```typescript
export const SITE_CONFIG = {
  name: 'IASD Mangueiras',
  legalName: 'Igreja Adventista do Sétimo Dia das Mangueiras',
  city: 'Tatuí',
  state: 'SP',
  locale: 'pt_BR',
  siteUrl: 'https://iasdmangueiras.org.br',
  description: 'Site oficial da Igreja Adventista do Sétimo Dia das Mangueiras em Tatuí-SP.',
  address: {
    street: 'Endereço oficial a confirmar',
    locality: 'Tatuí',
    region: 'SP',
    country: 'BR',
  },
  primaryCta: {
    label: 'Como chegar',
    href: '/horarios',
  },
  social: {
    facebook: 'https://www.facebook.com/igrejadasmangueiras/?locale=pt_BR',
    instagram: 'https://www.instagram.com/iasdmangueiras/',
    youtube: 'https://www.youtube.com/c/IASDMangueiras',
  },
} as const;
```

- [ ] **Step 4: Rodar teste e confirmar sucesso**

Run:

```bash
cd frontend && npm test -- --watch=false --include src/app/core/site/site.config.spec.ts
```

Expected:

```text
TOTAL: 1 SUCCESS
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/core/site
 git commit -m "feat: add public site configuration"
```

---

### Task 4: Criar SEO service com metadata, canonical e JSON-LD

**Files:**
- Create: `frontend/src/app/core/seo/seo.types.ts`
- Create: `frontend/src/app/core/seo/seo.service.ts`
- Create: `frontend/src/app/core/seo/seo.service.spec.ts`

**Interfaces:**
- Consumes: `SITE_CONFIG` from `frontend/src/app/core/site/site.config.ts`.
- Produces: `SeoService.apply(page: SeoPage): void` and `SeoService.organizationJsonLd(): object`.

- [ ] **Step 1: Criar teste do SEO service**

Create `frontend/src/app/core/seo/seo.service.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  it('aplica title, description, robots e canonical absoluto', () => {
    const service = TestBed.inject(SeoService);
    const document = TestBed.inject(DOCUMENT);

    service.apply({
      title: 'Horários — IASD Mangueiras',
      description: 'Conheça os horários da IASD Mangueiras em Tatuí-SP.',
      path: '/horarios',
    });

    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');

    expect(document.title).toBe('Horários — IASD Mangueiras');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toContain('Conheça os horários');
    expect(robots?.getAttribute('content')).toBe('index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    expect(canonical?.href).toBe('https://iasdmangueiras.org.br/horarios');
  });

  it('gera JSON-LD Organization com sameAs', () => {
    const service = TestBed.inject(SeoService);
    const json = service.organizationJsonLd();

    expect(json).toEqual(jasmine.objectContaining({
      '@type': 'Organization',
      name: 'IASD Mangueiras',
      url: 'https://iasdmangueiras.org.br',
      sameAs: jasmine.arrayContaining([
        'https://www.instagram.com/iasdmangueiras/',
        'https://www.youtube.com/c/IASDMangueiras',
      ]),
    }));
  });
});
```

- [ ] **Step 2: Rodar teste e confirmar falha**

Run:

```bash
cd frontend && npm test -- --watch=false --include src/app/core/seo/seo.service.spec.ts
```

Expected:

```text
Cannot find module './seo.service'
```

- [ ] **Step 3: Criar tipos SEO**

Create `frontend/src/app/core/seo/seo.types.ts`:

```typescript
export interface SeoPage {
  title: string;
  description: string;
  path: `/${string}` | '';
  image?: string;
}
```

- [ ] **Step 4: Implementar service mínimo**

Create `frontend/src/app/core/seo/seo.service.ts`:

```typescript
import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SITE_CONFIG } from '../site/site.config';
import { SeoPage } from './seo.types';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  apply(page: SeoPage): void {
    const url = `${SITE_CONFIG.siteUrl}${page.path}`;

    this.title.setTitle(page.title);
    this.meta.updateTag({ name: 'description', content: page.description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' });
    this.meta.updateTag({ property: 'og:title', content: page.title });
    this.meta.updateTag({ property: 'og:description', content: page.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_CONFIG.name });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.setCanonical(url);
    this.setJsonLd('organization-jsonld', this.organizationJsonLd());
    this.setJsonLd('website-jsonld', this.websiteJsonLd());
  }

  organizationJsonLd(): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      legalName: SITE_CONFIG.legalName,
      url: SITE_CONFIG.siteUrl,
      sameAs: Object.values(SITE_CONFIG.social),
      address: {
        '@type': 'PostalAddress',
        addressLocality: SITE_CONFIG.address.locality,
        addressRegion: SITE_CONFIG.address.region,
        addressCountry: SITE_CONFIG.address.country,
      },
    };
  }

  private websiteJsonLd(): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.siteUrl,
      publisher: {
        '@type': 'Organization',
        name: SITE_CONFIG.name,
      },
      inLanguage: 'pt-BR',
    };
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }

    link.href = url;
  }

  private setJsonLd(id: string, data: object): void {
    let script = this.document.getElementById(id) as HTMLScriptElement | null;

    if (!script) {
      script = this.document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }

    script.text = JSON.stringify(data);
  }
}
```

- [ ] **Step 5: Rodar teste e confirmar sucesso**

Run:

```bash
cd frontend && npm test -- --watch=false --include src/app/core/seo/seo.service.spec.ts
```

Expected:

```text
TOTAL: 2 SUCCESS
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/core/seo
 git commit -m "feat: add seo metadata service"
```

---

### Task 5: Criar layout rastreável e acessível

**Files:**
- Modify: `frontend/src/app/app.html` or `frontend/src/app/app.component.html`
- Modify: `frontend/src/app/app.ts` or `frontend/src/app/app.component.ts`
- Create: `frontend/src/app/layout/header/header.component.ts`
- Create: `frontend/src/app/layout/footer/footer.component.ts`
- Create: `frontend/src/app/layout/header/header.component.spec.ts`

**Interfaces:**
- Consumes: `SITE_CONFIG`.
- Produces: header/footer standalone com links `<a href>` para todas as rotas principais.

- [ ] **Step 1: Criar teste do header**

Create `frontend/src/app/layout/header/header.component.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HeaderComponent] }).compileComponents();
    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
  });

  it('renderiza navegação rastreável com links reais', () => {
    const links = Array.from(fixture.nativeElement.querySelectorAll('a')).map((a: HTMLAnchorElement) => a.getAttribute('href'));

    expect(links).toContain('/horarios');
    expect(links).toContain('/ao-vivo');
    expect(links).toContain('/eventos');
    expect(links).toContain('/contato');
  });

  it('oferece pulo para conteúdo principal', () => {
    const skip = fixture.nativeElement.querySelector('a[href="#conteudo"]');
    expect(skip?.textContent).toContain('Ir para o conteúdo');
  });
});
```

- [ ] **Step 2: Rodar teste e confirmar falha**

Run:

```bash
cd frontend && npm test -- --watch=false --include src/app/layout/header/header.component.spec.ts
```

Expected:

```text
Cannot find module './header.component'
```

- [ ] **Step 3: Criar HeaderComponent**

Create `frontend/src/app/layout/header/header.component.ts`:

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE_CONFIG } from '../../core/site/site.config';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-card focus:bg-white focus:px-4 focus:py-2 focus:text-advent-blue" href="#conteudo">Ir para o conteúdo</a>
    <header class="border-b border-advent-border bg-white">
      <div class="mx-auto flex max-w-site flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <a class="font-brand text-xl text-advent-blue" href="/" aria-label="IASD Mangueiras — início">{{ site.name }}</a>
        <nav aria-label="Navegação principal">
          <ul class="flex flex-wrap gap-4 text-base text-advent-text">
            <li><a class="hover:text-advent-blue" href="/horarios">Horários</a></li>
            <li><a class="hover:text-advent-blue" href="/ao-vivo">Ao vivo</a></li>
            <li><a class="hover:text-advent-blue" href="/eventos">Eventos</a></li>
            <li><a class="hover:text-advent-blue" href="/ministerios">Ministérios</a></li>
            <li><a class="hover:text-advent-blue" href="/sou-novo">Sou novo</a></li>
            <li><a class="rounded-card bg-advent-blue px-4 py-2 text-white hover:bg-advent-blue-dark" href="/contato">Contato</a></li>
          </ul>
        </nav>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  protected readonly site = SITE_CONFIG;
}
```

- [ ] **Step 4: Criar FooterComponent**

Create `frontend/src/app/layout/footer/footer.component.ts`:

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE_CONFIG } from '../../core/site/site.config';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="mt-16 bg-advent-blue text-white">
      <div class="mx-auto grid max-w-site gap-8 px-4 py-10 md:grid-cols-3">
        <section>
          <h2 class="font-brand text-xl">{{ site.name }}</h2>
          <p class="mt-3 text-white/85">{{ site.description }}</p>
        </section>
        <section>
          <h2 class="text-lg font-semibold">Encontre-nos</h2>
          <p class="mt-3 text-white/85">{{ site.city }}-{{ site.state }}</p>
          <a class="mt-2 inline-block underline" href="/horarios">Ver horários e localização</a>
        </section>
        <section>
          <h2 class="text-lg font-semibold">Canais oficiais</h2>
          <ul class="mt-3 space-y-2 text-white/85">
            <li><a class="underline" [href]="site.social.instagram">Instagram</a></li>
            <li><a class="underline" [href]="site.social.facebook">Facebook</a></li>
            <li><a class="underline" [href]="site.social.youtube">YouTube</a></li>
          </ul>
        </section>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly site = SITE_CONFIG;
}
```

- [ ] **Step 5: Conectar layout no AppComponent**

Update the root app component template to:

```html
<app-header />
<router-outlet />
<app-footer />
```

Update the root app component imports to include `RouterOutlet`, `HeaderComponent`, and `FooterComponent`.

- [ ] **Step 6: Rodar teste e build**

Run:

```bash
cd frontend && npm test -- --watch=false --include src/app/layout/header/header.component.spec.ts && npm run build
```

Expected:

```text
TOTAL: 2 SUCCESS
Application bundle generation complete
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app
 git commit -m "feat: add accessible site layout"
```

---

### Task 6: Aplicar home skeleton conforme design aprovado

**Files:**
- Modify: `frontend/src/app/features/home/home.page.ts`
- Create: `frontend/src/app/features/home/home.page.spec.ts`

**Interfaces:**
- Consumes: `SeoService`, `SITE_CONFIG`.
- Produces: home mobile-first com hero, horários, YouTube inicial, eventos e próximo passo.

- [ ] **Step 1: Criar teste da home**

Create `frontend/src/app/features/home/home.page.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomePage } from './home.page';

describe('HomePage', () => {
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HomePage] }).compileComponents();
    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
  });

  it('mostra informação essencial do visitante acima da dobra', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Igreja Adventista do Sétimo Dia das Mangueiras');
    expect(text).toContain('Tatuí-SP');
    expect(text).toContain('Como chegar');
    expect(text).toContain('Assistir ao vivo');
  });

  it('inclui seções essenciais do design aprovado', () => {
    const headings = Array.from(fixture.nativeElement.querySelectorAll('h2')).map((h: HTMLHeadingElement) => h.textContent?.trim());
    expect(headings).toEqual(jasmine.arrayContaining(['Horários e localização', 'Ao vivo e mensagens', 'Próximos passos']));
  });
});
```

- [ ] **Step 2: Rodar teste e confirmar falha útil**

Run:

```bash
cd frontend && npm test -- --watch=false --include src/app/features/home/home.page.spec.ts
```

Expected:

```text
Expected ... to contain 'Como chegar'
```

- [ ] **Step 3: Implementar home mínima**

Replace `frontend/src/app/features/home/home.page.ts` with:

```typescript
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '../../core/seo/seo.service';
import { SITE_CONFIG } from '../../core/site/site.config';

@Component({
  selector: 'app-home-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo">
      <section class="bg-advent-blue text-white">
        <div class="mx-auto grid max-w-site gap-8 px-4 py-14 md:grid-cols-[1.2fr_0.8fr] md:items-center md:py-20">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">{{ site.city }}-{{ site.state }}</p>
            <h1 class="mt-4 text-4xl font-bold leading-tight md:text-5xl">Igreja Adventista do Sétimo Dia das Mangueiras</h1>
            <p class="mt-5 max-w-2xl text-lg text-white/85">Um ponto de encontro para adoração, esperança, estudo da Bíblia e serviço à comunidade.</p>
            <div class="mt-8 flex flex-col gap-3 sm:flex-row">
              <a class="rounded-card bg-white px-5 py-3 text-center font-semibold text-advent-blue" href="/horarios">Como chegar</a>
              <a class="rounded-card border border-white/40 px-5 py-3 text-center font-semibold text-white" href="/ao-vivo">Assistir ao vivo</a>
            </div>
          </div>
          <aside class="rounded-section bg-white/10 p-6">
            <h2 class="text-2xl font-semibold">Próximo encontro</h2>
            <p class="mt-3 text-white/85">Sábado, Escola Sabatina e Culto de Adoração.</p>
            <a class="mt-5 inline-block underline" href="/horarios">Ver todos os horários</a>
          </aside>
        </div>
      </section>

      <section class="mx-auto max-w-site px-4 py-12">
        <h2 class="text-3xl font-bold text-advent-text">Horários e localização</h2>
        <p class="mt-3 max-w-2xl text-advent-muted">Encontre as principais programações e planeje sua visita à IASD Mangueiras em Tatuí-SP.</p>
      </section>

      <section class="bg-advent-neutral">
        <div class="mx-auto max-w-site px-4 py-12">
          <h2 class="text-3xl font-bold text-advent-text">Ao vivo e mensagens</h2>
          <p class="mt-3 max-w-2xl text-advent-muted">Quando não houver transmissão ao vivo, o site apresenta as mensagens e séries mais recentes do canal.</p>
        </div>
      </section>

      <section class="mx-auto max-w-site px-4 py-12">
        <h2 class="text-3xl font-bold text-advent-text">Próximos passos</h2>
        <div class="mt-6 grid gap-4 md:grid-cols-3">
          <a class="rounded-card border border-advent-border p-5" href="/sou-novo">Sou novo por aqui</a>
          <a class="rounded-card border border-advent-border p-5" href="/contato">Pedido de oração</a>
          <a class="rounded-card border border-advent-border p-5" href="/eventos">Ver eventos</a>
        </div>
      </section>
    </main>
  `,
})
export class HomePage {
  protected readonly site = SITE_CONFIG;
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.apply({
      title: 'IASD Mangueiras — Igreja Adventista em Tatuí-SP',
      description: SITE_CONFIG.description,
      path: '',
    });
  }
}
```

- [ ] **Step 4: Rodar teste e build**

Run:

```bash
cd frontend && npm test -- --watch=false --include src/app/features/home/home.page.spec.ts && npm run build
```

Expected:

```text
TOTAL: 2 SUCCESS
Application bundle generation complete
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/features/home
 git commit -m "feat: add branded home skeleton"
```

---

### Task 7: Criar arquivos GEO e rastreamento público

**Files:**
- Create: `frontend/public/robots.txt`
- Create: `frontend/public/sitemap.xml`
- Create: `frontend/public/llms.txt`
- Create: `frontend/public/llms-full.txt`
- Modify: `frontend/src/index.html`
- Create: `frontend/scripts/verify-public-seo.mjs`

**Interfaces:**
- Consumes: `SITE_CONFIG.siteUrl` value `https://iasdmangueiras.org.br`.
- Produces: arquivos estáticos legíveis por crawlers e agentes de IA.

- [ ] **Step 1: Criar verificador antes dos arquivos**

Create `frontend/scripts/verify-public-seo.mjs`:

```javascript
import { readFileSync, existsSync } from 'node:fs';

const files = ['public/robots.txt', 'public/sitemap.xml', 'public/llms.txt', 'public/llms-full.txt'];

for (const file of files) {
  if (!existsSync(file)) throw new Error(`Missing ${file}`);
}

const robots = readFileSync('public/robots.txt', 'utf8');
const sitemap = readFileSync('public/sitemap.xml', 'utf8');
const llms = readFileSync('public/llms.txt', 'utf8');
const index = readFileSync('src/index.html', 'utf8');

for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Bytespider', 'ChatGPT-User']) {
  if (!robots.includes(`User-agent: ${bot}`)) throw new Error(`Missing bot ${bot}`);
}

if (!robots.includes('Sitemap: https://iasdmangueiras.org.br/sitemap.xml')) throw new Error('Missing absolute sitemap');
if (!sitemap.includes('<loc>https://iasdmangueiras.org.br/</loc>')) throw new Error('Missing home in sitemap');
if (!llms.includes('> Site oficial da IASD Mangueiras')) throw new Error('Missing llms citation block');
if (!index.includes('<link rel="describedby" href="/llms.txt">')) throw new Error('Missing llms discovery link');

console.log('public SEO/GEO files verified');
```

- [ ] **Step 2: Rodar verificador e confirmar falha**

Run:

```bash
cd frontend && node scripts/verify-public-seo.mjs
```

Expected:

```text
Error: Missing public/robots.txt
```

- [ ] **Step 3: Criar robots.txt**

Create `frontend/public/robots.txt`:

```text
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bytespider
Allow: /

User-agent: ChatGPT-User
Allow: /

Disallow: /admin
Disallow: /login
Disallow: /preview
Disallow: /*?preview=

Sitemap: https://iasdmangueiras.org.br/sitemap.xml
```

- [ ] **Step 4: Criar sitemap.xml**

Create `frontend/public/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://iasdmangueiras.org.br/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://iasdmangueiras.org.br/horarios</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>https://iasdmangueiras.org.br/ao-vivo</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>https://iasdmangueiras.org.br/eventos</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://iasdmangueiras.org.br/ministerios</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://iasdmangueiras.org.br/sou-novo</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://iasdmangueiras.org.br/contato</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
</urlset>
```

- [ ] **Step 5: Criar llms.txt**

Create `frontend/public/llms.txt`:

```markdown
# IASD Mangueiras

> Site oficial da IASD Mangueiras, Igreja Adventista do Sétimo Dia das Mangueiras em Tatuí-SP. O site informa horários, localização, transmissão ao vivo, eventos, ministérios e canais de contato.

## Recursos principais

- [Horários e localização](https://iasdmangueiras.org.br/horarios)
- [Transmissão ao vivo](https://iasdmangueiras.org.br/ao-vivo)
- [Eventos e comunicados](https://iasdmangueiras.org.br/eventos)
- [Ministérios](https://iasdmangueiras.org.br/ministerios)
- [Sou novo](https://iasdmangueiras.org.br/sou-novo)
- [Contato e oração](https://iasdmangueiras.org.br/contato)

## Optional

- Instagram: https://www.instagram.com/iasdmangueiras/
- Facebook: https://www.facebook.com/igrejadasmangueiras/?locale=pt_BR
- YouTube: https://www.youtube.com/c/IASDMangueiras
- Documento completo para agentes: https://iasdmangueiras.org.br/llms-full.txt
```

- [ ] **Step 6: Criar llms-full.txt**

Create `frontend/public/llms-full.txt`:

```markdown
# IASD Mangueiras — mapa completo para agentes

## Identidade

Nome: IASD Mangueiras  
Nome completo: Igreja Adventista do Sétimo Dia das Mangueiras  
Cidade: Tatuí-SP  
Idioma: português do Brasil  
Site canônico: https://iasdmangueiras.org.br

## Finalidade do site

O site é o ponto oficial para visitantes e membros encontrarem horários, localização, programação ao vivo, eventos, ministérios e contato.

## Rotas públicas

- `/` — página inicial com resumo, CTAs e destaques.
- `/horarios` — horários e localização.
- `/ao-vivo` — transmissão ao vivo e mensagens recentes.
- `/eventos` — eventos e comunicados.
- `/ministerios` — ministérios da igreja.
- `/sou-novo` — orientação para visitantes.
- `/contato` — contato e pedido de oração.

## Stack

Frontend: Angular 22 com SSR/prerender, standalone components e TypeScript strict.  
Estilo: Tailwind CSS 3.4.17.  
Backend planejado: Python 3.14+ FastAPI apenas para YouTube e formulários, sem banco de dados no MVP.

## Regras de negócio públicas

- O site não processa pagamentos ou dízimos.
- Dados sensíveis de membros não são armazenados no MVP.
- YouTube é integrado pelo backend para proteger a API key.
- Eventos e comunicados iniciais vêm de JSON no repositório.

## Canais oficiais

- Instagram: https://www.instagram.com/iasdmangueiras/
- Facebook: https://www.facebook.com/igrejadasmangueiras/?locale=pt_BR
- YouTube: https://www.youtube.com/c/IASDMangueiras
```

- [ ] **Step 7: Adicionar descoberta llms e viewport no index**

Ensure `frontend/src/index.html` contains:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="describedby" href="/llms.txt">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
```

- [ ] **Step 8: Rodar verificador e build**

Run:

```bash
cd frontend && node scripts/verify-public-seo.mjs && npm run build
```

Expected:

```text
public SEO/GEO files verified
Application bundle generation complete
```

- [ ] **Step 9: Commit**

```bash
git add frontend/public frontend/scripts frontend/src/index.html
 git commit -m "feat: add seo geo public files"
```

---

### Task 8: Aplicar metadata em todas as páginas públicas

**Files:**
- Modify: `frontend/src/app/features/horarios/horarios.page.ts`
- Modify: `frontend/src/app/features/ao-vivo/ao-vivo.page.ts`
- Modify: `frontend/src/app/features/eventos/eventos.page.ts`
- Modify: `frontend/src/app/features/ministerios/ministerios.page.ts`
- Modify: `frontend/src/app/features/sou-novo/sou-novo.page.ts`
- Modify: `frontend/src/app/features/contato/contato.page.ts`
- Modify: `frontend/src/app/features/not-found/not-found.page.ts`
- Create: `frontend/scripts/verify-prerender-content.mjs`

**Interfaces:**
- Consumes: `SeoService.apply(page)`.
- Produces: cada rota com título, descrição, canonical absoluto e conteúdo SSR verificável.

- [ ] **Step 1: Criar verificador de HTML renderizado**

Create `frontend/scripts/verify-prerender-content.mjs`:

```javascript
import { readFileSync, existsSync } from 'node:fs';

const checks = [
  ['dist/frontend/browser/index.html', 'IASD Mangueiras'],
  ['dist/frontend/browser/horarios/index.html', 'Horários'],
  ['dist/frontend/browser/ao-vivo/index.html', 'Ao vivo'],
  ['dist/frontend/browser/eventos/index.html', 'Eventos'],
  ['dist/frontend/browser/ministerios/index.html', 'Ministérios'],
  ['dist/frontend/browser/sou-novo/index.html', 'Sou novo'],
  ['dist/frontend/browser/contato/index.html', 'Contato'],
];

for (const [file, expected] of checks) {
  if (!existsSync(file)) throw new Error(`Missing prerendered file: ${file}`);
  const html = readFileSync(file, 'utf8');
  if (!html.includes(expected)) throw new Error(`Missing text ${expected} in ${file}`);
  if (!html.includes('rel="canonical"')) throw new Error(`Missing canonical in ${file}`);
  if (!html.includes('application/ld+json')) throw new Error(`Missing JSON-LD in ${file}`);
}

console.log('prerendered SEO content verified');
```

- [ ] **Step 2: Aplicar padrão nas páginas**

For each page component, inject `SeoService` and call `this.seo.apply(...)` in constructor.

Example for `frontend/src/app/features/horarios/horarios.page.ts`:

```typescript
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-horarios-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo" class="mx-auto max-w-site px-4 py-10">
      <h1 class="text-4xl font-bold text-advent-text">Horários</h1>
      <p class="mt-4 text-lg text-advent-muted">Conheça os horários principais da IASD Mangueiras em Tatuí-SP.</p>
    </main>
  `,
})
export class HorariosPage {
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.apply({
      title: 'Horários — IASD Mangueiras',
      description: 'Conheça os horários principais da Igreja Adventista do Sétimo Dia das Mangueiras em Tatuí-SP.',
      path: '/horarios',
    });
  }
}
```

Use these page values:

```text
Ao vivo — IASD Mangueiras | Transmissões e mensagens da IASD Mangueiras. | /ao-vivo
Eventos — IASD Mangueiras | Próximos eventos e comunicados da IASD Mangueiras. | /eventos
Ministérios — IASD Mangueiras | Conheça os ministérios da IASD Mangueiras. | /ministerios
Sou novo — IASD Mangueiras | Informações para quem quer visitar a IASD Mangueiras pela primeira vez. | /sou-novo
Contato e oração — IASD Mangueiras | Fale com a IASD Mangueiras e envie seu pedido de oração. | /contato
Página não encontrada — IASD Mangueiras | A página solicitada não foi encontrada no site da IASD Mangueiras. | /pagina-nao-encontrada
```

- [ ] **Step 3: Build e verificar HTML prerenderizado**

Run:

```bash
cd frontend && npm run build && node scripts/verify-prerender-content.mjs
```

Expected:

```text
Application bundle generation complete
prerendered SEO content verified
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/features frontend/scripts/verify-prerender-content.mjs
 git commit -m "feat: apply seo metadata to public pages"
```

---

### Task 9: Criar conteúdo JSON inicial e cards mínimos

**Files:**
- Create: `frontend/src/content/horarios.json`
- Create: `frontend/src/content/eventos.json`
- Create: `frontend/src/content/comunicados.json`
- Create: `frontend/src/content/ministerios.json`
- Create: `frontend/src/app/core/models/content.models.ts`
- Create: `frontend/src/app/core/services/content.service.ts`
- Create: `frontend/src/app/core/services/content.service.spec.ts`

**Interfaces:**
- Produces: `ContentService.horarios()`, `ContentService.eventos()`, `ContentService.comunicados()`, `ContentService.ministerios()` returning typed readonly arrays.

- [ ] **Step 1: Criar teste do ContentService**

Create `frontend/src/app/core/services/content.service.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { ContentService } from './content.service';

describe('ContentService', () => {
  it('carrega horários institucionais iniciais', () => {
    const service = TestBed.inject(ContentService);
    expect(service.horarios().length).toBeGreaterThan(0);
    expect(service.horarios()[0].titulo).toBeTruthy();
    expect(service.horarios()[0].dia).toBeTruthy();
  });
});
```

- [ ] **Step 2: Criar JSON inicial**

Create `frontend/src/content/horarios.json`:

```json
[
  {
    "titulo": "Escola Sabatina",
    "dia": "Sábado",
    "horario": "Horário a confirmar",
    "descricao": "Estudo da Bíblia em classes para todas as idades."
  },
  {
    "titulo": "Culto de Adoração",
    "dia": "Sábado",
    "horario": "Horário a confirmar",
    "descricao": "Momento de louvor, oração e mensagem bíblica."
  }
]
```

Create `frontend/src/content/eventos.json`:

```json
[]
```

Create `frontend/src/content/comunicados.json`:

```json
[]
```

Create `frontend/src/content/ministerios.json`:

```json
[
  {
    "nome": "Recepção",
    "descricao": "Acolhimento de membros e visitantes."
  },
  {
    "nome": "Comunicação",
    "descricao": "Apoio aos canais digitais e transmissões."
  }
]
```

- [ ] **Step 3: Criar modelos**

Create `frontend/src/app/core/models/content.models.ts`:

```typescript
export interface Horario {
  titulo: string;
  dia: string;
  horario: string;
  descricao: string;
}

export interface Evento {
  titulo: string;
  data: string;
  horario: string;
  descricao: string;
  href?: string;
}

export interface Comunicado {
  titulo: string;
  descricao: string;
  data: string;
}

export interface Ministerio {
  nome: string;
  descricao: string;
}
```

- [ ] **Step 4: Criar ContentService mínimo**

Create `frontend/src/app/core/services/content.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import horarios from '../../../content/horarios.json';
import eventos from '../../../content/eventos.json';
import comunicados from '../../../content/comunicados.json';
import ministerios from '../../../content/ministerios.json';
import { Comunicado, Evento, Horario, Ministerio } from '../models/content.models';

@Injectable({ providedIn: 'root' })
export class ContentService {
  horarios(): readonly Horario[] {
    return horarios as readonly Horario[];
  }

  eventos(): readonly Evento[] {
    return eventos as readonly Evento[];
  }

  comunicados(): readonly Comunicado[] {
    return comunicados as readonly Comunicado[];
  }

  ministerios(): readonly Ministerio[] {
    return ministerios as readonly Ministerio[];
  }
}
```

- [ ] **Step 5: Habilitar resolveJsonModule se necessário**

If TypeScript build fails on JSON imports, add to `frontend/tsconfig.json` under `compilerOptions`:

```json
"resolveJsonModule": true,
"esModuleInterop": true
```

- [ ] **Step 6: Rodar teste e build**

Run:

```bash
cd frontend && npm test -- --watch=false --include src/app/core/services/content.service.spec.ts && npm run build
```

Expected:

```text
TOTAL: 1 SUCCESS
Application bundle generation complete
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/content frontend/src/app/core
 git commit -m "feat: add initial content service"
```

---

### Task 10: Rodar auditoria final local SEO/AEO/GEO e atualizar PLAN.md

**Files:**
- Modify: `docs/PLAN.md`
- Create: `docs/reports/2026-08-22_auditoria-seo-aeo-geo-planejada.md`

**Interfaces:**
- Consumes: output dos scripts `verify-public-seo.mjs` e `verify-prerender-content.mjs`.
- Produces: relatório local e marcação dos passos correspondentes do `PLAN.md` quando concluídos.

- [ ] **Step 1: Criar diretório de relatórios**

Run:

```bash
mkdir -p docs/reports
```

- [ ] **Step 2: Rodar verificação final**

Run:

```bash
cd frontend && npm test -- --watch=false && npm run build && node scripts/verify-public-seo.mjs && node scripts/verify-prerender-content.mjs
```

Expected:

```text
TOTAL: ... SUCCESS
Application bundle generation complete
public SEO/GEO files verified
prerendered SEO content verified
```

- [ ] **Step 3: Criar relatório SEO/AEO/GEO planejado**

Create `docs/reports/2026-08-22_auditoria-seo-aeo-geo-planejada.md`:

```markdown
# Auditoria SEO/AEO/GEO planejada — IASD Mangueiras

Data: 2026-08-22

## Status dos módulos

| Módulo | Status | Evidência local |
| --- | --- | --- |
| Descoberta por IA | Planejado no skeleton | `llms.txt`, `llms-full.txt`, `link rel="describedby"` |
| Rastreamento | Planejado no skeleton | `robots.txt` com sitemap absoluto e bots de IA permitidos |
| Indexação | Planejado no skeleton | canonical absoluto, meta robots e rotas prerenderizadas |
| Links rastreáveis | Planejado no layout | navegação principal em `<a href>` |
| Identidade visual para Search | Parcial | favicon/logotipo dependem de asset final aprovado |
| Dados estruturados | Planejado no skeleton | JSON-LD Organization e WebSite |
| Core Web Vitals | Parcial | Tailwind, SSR e font-display; imagens finais dependem de conteúdo real |
| Headers HTTP | Pendente de hospedagem | configurar no provedor escolhido na Fase 5 |

## Próximas validações externas

- Google Search Console após domínio final.
- Teste de resultados ricos do Google após deploy.
- Lighthouse mobile após conteúdo e imagens finais.
- Inspeção de `robots.txt`, `sitemap.xml`, `llms.txt` e `llms-full.txt` no domínio público.
```

- [ ] **Step 4: Atualizar PLAN.md sem reordenar fases**

In `docs/PLAN.md`, add under Fase 1 after Passo 10:

```markdown
- [ ] Passo 10.1: Validar base visual com `docs/design/brand-guidelines.md` e `docs/design/design.md`
- [ ] Passo 10.2: Validar base SEO/AEO/GEO inicial (`robots.txt`, `sitemap.xml`, `llms.txt`, canônicas e JSON-LD`)
```

In Fase 5 after Passo 40, add:

```markdown
- [ ] Passo 40.1: Gerar relatório SEO/AEO/GEO em `docs/reports/` antes do deploy
```

- [ ] **Step 5: Verificar relatório e plano**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
plan = Path('docs/PLAN.md').read_text(encoding='utf-8')
report = Path('docs/reports/2026-08-22_auditoria-seo-aeo-geo-planejada.md').read_text(encoding='utf-8')
assert 'Passo 10.2' in plan
assert 'Passo 40.1' in plan
assert 'llms.txt' in report
assert 'JSON-LD' in report
print('plan and SEO/AEO/GEO report verified')
PY
```

Expected:

```text
plan and SEO/AEO/GEO report verified
```

- [ ] **Step 6: Commit**

```bash
git add docs/PLAN.md docs/reports frontend
 git commit -m "feat: verify seo geo skeleton"
```

---

## Self-Review

**Spec coverage:**
- Marca, cor, tipografia, mobile-first e acessibilidade: Tasks 2, 5, 6.
- Angular SSR/prerender: Tasks 1, 8.
- SEO/AEO/GEO: Tasks 4, 7, 8, 10.
- Conteúdo inicial por JSON: Task 9.
- Backend fora do setup inicial: Global Constraints.

**Scan de marcadores:**
- O plano não usa marcadores de implementação indefinida. Valores que dependem da liderança local, como endereço e horários exatos, entram como conteúdo institucional “a confirmar” para não inventar dado factual.

**Type consistency:**
- `SITE_CONFIG`, `SeoService.apply(page: SeoPage)`, `SeoService.organizationJsonLd()` e `ContentService` são definidos antes de serem consumidos.

**Scope control:**
- O plano não cria backend, deploy, CI/CD, CMS, autenticação, pagamentos ou automações.
- O plano aplica SEO/AEO/GEO planejado ao skeleton, mas deixa headers HTTP e validações externas para a Fase 5, quando houver domínio/hospedagem.
