# Versículo & Gerador de Stories Inteligente — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Verse & Story Generator tab into a feature-rich, AI-powered devotional studio with semantic search, high-res curated photography backgrounds, user photo uploads, dual aspect ratios (9:16 Story and 1:1 Feed), and native social sharing.

**Architecture:** Standalone Angular 22 components with reactive Signals, dynamic client-side TensorFlow.js Universal Sentence Encoder for local semantic similarity matching, and a dedicated Canvas 2D engine rendering crisp 1080p graphics with WCAG AAA contrast overlays and Web Share API integration.

**Tech Stack:** Angular 22 (Signals, Standalone), TypeScript 6, Tailwind CSS, HTML5 Canvas 2D, `@tensorflow/tfjs`, `@tensorflow-models/universal-sentence-encoder`, Vitest.

## Global Constraints

- SSR Safety: All browser APIs (`window`, `document`, `HTMLCanvasElement`, `navigator.share`, `@tensorflow/tfjs`, `FileReader`) must be guarded by `isPlatformBrowser(this.platformId)`.
- Touch Targets: Interactive controls must have minimum 44px touch target.
- Color Modes: UI must support Light, Dark and High-Contrast modes.
- Strict Type Safety: 100% clean `npx tsc --noEmit` with no `any` in application contracts.
- Canvas Integrity: Zero CORS / tainted canvas issues by using local asset paths and Data URLs.

---

### Task 1: Data Models & Bible Service Expansion

**Files:**
- Create: `frontend/src/app/core/models/story.models.ts`
- Modify: `frontend/src/app/core/services/bible.service.ts`
- Test: `frontend/src/app/core/services/bible.service.spec.ts`

**Interfaces:**
- Produces:
  - `StoryFormat`: `'story' | 'feed'`
  - `BackgroundType`: `'gradient' | 'photo' | 'custom'`
  - `StoryBackground`: `{ id: string; nome: string; tipo: BackgroundType; bgGradientCss?: string; canvasColors?: [string, string, string]; imageUrl?: string; thumbnailUrl?: string; primaryTextColor: string; accentColor: string; defaultOverlayOpacity: number; }`
  - `DailyVerse`: `{ id: string; texto: string; referencia: string; tema: string; categoria: string; tagsSemanticas?: string[]; }`
  - `BibleService.getDailyVerse(date?: Date): DailyVerse`
  - `BibleService.getCuratedVerses(): DailyVerse[]`

- [ ] **Step 1: Create the Story and Verse interfaces in `story.models.ts`**

```typescript
export type StoryFormat = 'story' | 'feed'; // 9:16 (1080x1920) | 1:1 (1080x1080)

export type BackgroundType = 'gradient' | 'photo' | 'custom';

export interface StoryBackground {
  id: string;
  nome: string;
  tipo: BackgroundType;
  bgGradientCss?: string;
  canvasColors?: [string, string, string];
  imageUrl?: string;
  thumbnailUrl?: string;
  primaryTextColor: string;
  accentColor: string;
  defaultOverlayOpacity: number; // 0.3 a 0.85
}

export type VerseCategory =
  | 'paz'
  | 'esperanca'
  | 'oracao'
  | 'coragem'
  | 'amor'
  | 'gratidao'
  | 'fe'
  | 'direcao'
  | 'geral';

export interface DailyVerse {
  id: string;
  texto: string;
  referencia: string;
  tema: string;
  categoria: VerseCategory;
  tagsSemanticas?: string[];
}

export interface SemanticVerseMatch {
  verse: DailyVerse;
  similarityScore: number;
  matchPercentage: number;
}
```

- [ ] **Step 2: Write unit tests for `BibleService` deterministic verse and semantic tags**

In `frontend/src/app/core/services/bible.service.spec.ts`:
```typescript
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BibleService } from './bible.service';

describe('BibleService', () => {
  let service: BibleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BibleService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BibleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return curated verses with semantic tags', () => {
    const verses = service.getCuratedVerses();
    expect(verses.length).toBeGreaterThanOrEqual(8);
    expect(verses[0].tagsSemanticas).toBeDefined();
    expect(verses[0].tagsSemanticas!.length).toBeGreaterThan(0);
  });

  it('should return deterministic verse of the day for a specific date', () => {
    const date1 = new Date('2026-08-25T12:00:00Z');
    const date2 = new Date('2026-08-25T20:00:00Z');
    const date3 = new Date('2026-08-26T12:00:00Z');

    const verse1 = service.getDailyVerse(date1);
    const verse2 = service.getDailyVerse(date2);
    const verse3 = service.getDailyVerse(date3);

    expect(verse1.id).toBe(verse2.id);
    expect(verse1).toBeDefined();
    expect(verse3).toBeDefined();
  });
});
```

- [ ] **Step 3: Update `BibleService` with expanded verses and `getDailyVerse`**

In `frontend/src/app/core/services/bible.service.ts`:
- Import types from `../models/story.models`.
- Add `tagsSemanticas` to each curated verse (e.g. `['ansiedade', 'calmaria', 'cuidado', 'pastor']`).
- Implement `getDailyVerse(date: Date = new Date()): DailyVerse` based on day-of-year modulo arithmetic.

- [ ] **Step 4: Run unit tests to verify**

Run: `cd frontend && npm test -- src/app/core/services/bible.service.spec.ts --run`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add frontend/src/app/core/models/story.models.ts frontend/src/app/core/services/bible.service.ts frontend/src/app/core/services/bible.service.spec.ts
git commit -m "feat(bible): expand curated verses with semantic tags and deterministic daily verse"
```

---

### Task 2: AI Semantic Verse Recommender Service

**Files:**
- Create: `frontend/src/app/core/services/verse-ai.service.ts`
- Create: `frontend/src/app/core/services/verse-ai.service.spec.ts`

**Interfaces:**
- Consumes: `BibleService.getCuratedVerses()`, `DailyVerse`, `SemanticVerseMatch`
- Produces:
  - `VerseAiService.initialize(): Promise<boolean>`
  - `VerseAiService.findRelevantVerses(query: string, maxResults?: number): Promise<SemanticVerseMatch[]>`
  - `VerseAiService.isLoading: Signal<boolean>`
  - `VerseAiService.isReady: Signal<boolean>`

- [ ] **Step 1: Write unit tests for `VerseAiService`**

In `frontend/src/app/core/services/verse-ai.service.spec.ts`:
```typescript
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { VerseAiService } from './verse-ai.service';
import { BibleService } from './bible.service';

describe('VerseAiService', () => {
  let service: VerseAiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VerseAiService, BibleService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(VerseAiService);
  });

  it('should be created with initial idle state', () => {
    expect(service).toBeTruthy();
    expect(service.isLoading()).toBe(false);
  });

  it('should perform fallback keyword matching if model is not loaded', async () => {
    const results = await service.findRelevantVerses('paz e tranquilidade', 3);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].similarityScore).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Implement `VerseAiService`**

In `frontend/src/app/core/services/verse-ai.service.ts`:
- Use dynamic import for `@tensorflow/tfjs` and `@tensorflow-models/universal-sentence-encoder`.
- Implement cosine similarity calculation between query embedding and verse embeddings (generated by concatenating text, theme, and `tagsSemanticas`).
- Include fast fallback heuristic (TF-IDF keyword matching on tags) in case WebGL or offline environments cannot download the weights.

- [ ] **Step 3: Run unit tests to verify**

Run: `cd frontend && npm test -- src/app/core/services/verse-ai.service.spec.ts --run`
Expected: PASS

- [ ] **Step 4: Commit changes**

```bash
git add frontend/src/app/core/services/verse-ai.service.ts frontend/src/app/core/services/verse-ai.service.spec.ts
git commit -m "feat(ai): implement VerseAiService with semantic neural search and fallback"
```

---

### Task 3: Background Presets & Canvas 2D Story Engine Service

**Files:**
- Create: `frontend/src/app/core/constants/story-presets.ts`
- Create: `frontend/src/app/core/services/story-canvas.service.ts`
- Create: `frontend/src/app/core/services/story-canvas.service.spec.ts`

**Interfaces:**
- Consumes: `StoryBackground`, `DailyVerse`, `StoryFormat`
- Produces:
  - `STORY_BACKGROUND_PRESETS: StoryBackground[]`
  - `StoryCanvasService.renderStoryToBlob(options: RenderOptions): Promise<Blob>`
  - `StoryCanvasService.shareStory(options: ShareOptions): Promise<boolean>`
  - `StoryCanvasService.downloadStory(blob: Blob, filename: string): void`

- [ ] **Step 1: Define `STORY_BACKGROUND_PRESETS` in `story-presets.ts`**

In `frontend/src/app/core/constants/story-presets.ts`:
- Include 4 Royal Gradients: `azul-imperial`, `dourado-aurora`, `verde-esperanca`, `noite-celestial`.
- Include 6 Photorealistic Presets: `alvorada-montanhas`, `ceu-estrelado`, `floresta-raios`, `por-do-sol-ouro`, `biblia-luz`, `nuvens-celestes` with optimized Unsplash CDN URLs (with `auto=format&fit=crop&w=1080&q=80`) and verified fallback colors.

- [ ] **Step 2: Write unit tests for `StoryCanvasService`**

In `frontend/src/app/core/services/story-canvas.service.spec.ts`:
```typescript
import { TestBed } from '@angular/core/testing';
import { StoryCanvasService } from './story-canvas.service';

describe('StoryCanvasService', () => {
  let service: StoryCanvasService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StoryCanvasService],
    });
    service = TestBed.inject(StoryCanvasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

- [ ] **Step 3: Implement `StoryCanvasService`**

In `frontend/src/app/core/services/story-canvas.service.ts`:
- Render at 1080×1920 (for `'story'`) or 1080×1080 (for `'feed'`).
- Handle background drawing:
  - Gradients: `createLinearGradient`.
  - Images (preset or user upload data URL): Load `new Image()`, wait `onload`, compute `cover` destination coords `(dx, dy, dWidth, dHeight)`.
- Apply dark overlay rect with user-selected opacity (0.35 to 0.85).
- Draw decorative borders, corner accents, and church branding (*IASD Mangueiras • Tatuí*).
- Break text lines dynamically based on font size and canvas width.
- Draw reference pill and website footer.
- Implement `shareStory`: uses `navigator.share` with `File` array if available; falls back to download.

- [ ] **Step 4: Run unit tests to verify**

Run: `cd frontend && npm test -- src/app/core/services/story-canvas.service.spec.ts --run`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add frontend/src/app/core/constants/story-presets.ts frontend/src/app/core/services/story-canvas.service.ts frontend/src/app/core/services/story-canvas.service.spec.ts
git commit -m "feat(canvas): implement StoryCanvasService with dual formats and rich photo presets"
```

---

### Task 4: Estudos Page UI/UX Redesign & Integration

**Files:**
- Modify: `frontend/src/app/features/estudos/estudos.page.ts`
- Modify: `frontend/src/app/features/estudos/estudos.page.spec.ts`

**Interfaces:**
- Injects: `VerseAiService`, `StoryCanvasService`, `BibleService`
- Signals:
  - `selectedFormat: Signal<StoryFormat>` ('story' | 'feed')
  - `selectedBackground: Signal<StoryBackground>`
  - `overlayOpacity: Signal<number>`
  - `aiQuery: Signal<string>`
  - `aiMatches: Signal<SemanticVerseMatch[]>`
  - `customImagePreview: Signal<string | null>`

- [ ] **Step 1: Write tests for the updated `EstudosPage`**

In `frontend/src/app/features/estudos/estudos.page.spec.ts`:
- Test format toggle (`story` vs `feed`).
- Test background selection (gradient vs photo vs custom upload).
- Test AI search trigger.
- Test export actions (Download & Share).

- [ ] **Step 2: Update `estudos.page.ts` with the new Studio UI**

In `frontend/src/app/features/estudos/estudos.page.ts`:
- Add Format Switcher: Story 9:16 vs Feed 1:1.
- Add AI Input Box: *"Como você está se sentindo hoje? (Ex: ansioso, grato, precisando de paz)"* with instant recommendations.
- Add Background Studio:
  - Tab "Fotos Reais" (grid of preset thumbnails).
  - Tab "Gradientes Nobres" (color chips).
  - Button "Usar Minha Foto" with hidden file input and instant preview.
  - Slider "Escurecimento do Fundo" (35% a 85%) for custom contrast adjustment.
- Add Interactive Live Preview:
  - Shows 9:16 phone mockup or 1:1 square post based on `selectedFormat()`.
- Add Export Actions:
  - "Compartilhar no Instagram / WhatsApp" (calls `storyCanvas.shareStory`).
  - "Baixar Imagem em Alta Resolução" (PNG 1080p).
  - "Copiar Citação Bíblica".

- [ ] **Step 3: Run component tests**

Run: `cd frontend && npm test -- src/app/features/estudos/estudos.page.spec.ts --run`
Expected: PASS

- [ ] **Step 4: Commit changes**

```bash
git add frontend/src/app/features/estudos/estudos.page.ts frontend/src/app/features/estudos/estudos.page.spec.ts
git commit -m "feat(estudos): integrate AI verse search and advanced story studio in Estudos page"
```

---

### Task 5: End-to-End Build & Static Verification

**Files:**
- None created; runs global validation across all frontend files.

- [ ] **Step 1: Run TypeScript compiler check**

Run: `cd frontend && npx tsc --noEmit`
Expected: Zero errors.

- [ ] **Step 2: Run all frontend unit tests**

Run: `cd frontend && npm test -- --run`
Expected: 100% tests passing.

- [ ] **Step 3: Verify Angular production build**

Run: `cd frontend && npm run build`
Expected: Build succeeds with SSR bundle generated.

- [ ] **Step 4: Commit and finalize branch**

```bash
git add .
git commit -m "chore: verify build and finalize verse and story generator upgrade"
```
