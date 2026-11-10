import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BibleService } from './bible.service';
import { DailyVerse, SemanticVerseMatch } from '../models/story.models';

const PT_STOPWORDS = new Set([
  'a', 'ao', 'aos', 'as', 'ate', 'com', 'da', 'das', 'de', 'delas', 'dele', 'deles',
  'depois', 'do', 'dos', 'e', 'ela', 'elas', 'ele', 'eles', 'em', 'entre', 'era',
  'essa', 'essas', 'esse', 'esses', 'esta', 'estao', 'este', 'eu', 'foi', 'foram',
  'fosse', 'ha', 'havia', 'isso', 'ja', 'lhe', 'lhes', 'mais', 'mas', 'me', 'mesmo',
  'meu', 'meus', 'minha', 'minhas', 'muito', 'na', 'nas', 'nao', 'nem', 'no',
  'nos', 'num', 'numa', 'o', 'os', 'ou', 'para', 'pela', 'pelas', 'pelo', 'pelos',
  'por', 'qual', 'quando', 'que', 'quem', 'se', 'seja', 'sem', 'sera', 'seu', 'seus',
  'so', 'sua', 'suas', 'tambem', 'te', 'tem', 'tenho', 'ter', 'teu', 'teus', 'tinha',
  'tu', 'tua', 'tuas', 'um', 'uma', 'voce', 'voces', 'vos',
]);

@Injectable({
  providedIn: 'root',
})
export class VerseAiService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly bibleService = inject(BibleService);

  private readonly _isLoading = signal<boolean>(false);
  readonly isLoading = this._isLoading.asReadonly();

  private readonly _isReady = signal<boolean>(false);
  readonly isReady = this._isReady.asReadonly();

  private model: any = null;
  private tf: any = null;
  private verseEmbeddings: any = null;
  private initPromise?: Promise<boolean>;

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  async initialize(): Promise<boolean> {
    if (this._isReady()) {
      return true;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    if (!this.isBrowser) {
      return false;
    }

    this.initPromise = (async () => {
      this._isLoading.set(true);
      try {
        const [tfModule, useModule] = await Promise.all([
          import('@tensorflow/tfjs'),
          import('@tensorflow-models/universal-sentence-encoder'),
        ]);

        this.tf = tfModule;
        this.model = await useModule.load();

        const curated = this.bibleService.getCuratedVerses();
        const verseTexts = curated.map((v) => this.buildVerseContext(v));

        if (verseTexts.length > 0) {
          this.verseEmbeddings = await this.model.embed(verseTexts);
        }

        this._isReady.set(true);
        return true;
      } catch {
        // Fallback silently if weights fail to download or WebGL is unsupported
        this._isReady.set(false);
        return false;
      } finally {
        this._isLoading.set(false);
      }
    })();

    return this.initPromise;
  }

  async findRelevantVerses(
    query: string,
    maxResults = 3,
  ): Promise<SemanticVerseMatch[]> {
    const curated = this.bibleService.getCuratedVerses();
    const cleanQuery = query.trim();

    if (!cleanQuery) {
      return curated.slice(0, maxResults).map((verse, index) => ({
        verse,
        similarityScore: Math.max(0.5, 1 - index * 0.1),
        matchPercentage: Math.round(Math.max(50, 100 - index * 10)),
      }));
    }

    if (this._isReady() && this.model && this.verseEmbeddings && this.tf) {
      try {
        return await this.neuralSearch(cleanQuery, curated, maxResults);
      } catch {
        // Se a inferência neural falhar por qualquer motivo, recorre ao fallback
        return this.heuristicSearch(cleanQuery, curated, maxResults);
      }
    }

    return this.heuristicSearch(cleanQuery, curated, maxResults);
  }

  private async neuralSearch(
    query: string,
    verses: DailyVerse[],
    maxResults: number,
  ): Promise<SemanticVerseMatch[]> {
    const queryEmbedding = await this.model.embed([query]);

    try {
      const scoresArray: Float32Array = this.tf.tidy(() => {
        // queryEmbedding: [1, 512], verseEmbeddings: [N, 512]
        const similarity = this.tf.matMul(
          this.verseEmbeddings,
          queryEmbedding,
          false,
          true,
        );
        return similarity.squeeze().dataSync();
      });

      const matches: SemanticVerseMatch[] = verses.map((verse, index) => {
        const rawScore = scoresArray[index] ?? 0;
        const normalizedScore = Math.max(0, Math.min(1, (rawScore + 1) / 2));
        return {
          verse,
          similarityScore: normalizedScore,
          matchPercentage: Math.round(normalizedScore * 100),
        };
      });

      return matches
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, maxResults);
    } finally {
      queryEmbedding.dispose();
    }
  }

  private heuristicSearch(
    query: string,
    verses: DailyVerse[],
    maxResults: number,
  ): SemanticVerseMatch[] {
    const queryTokens = this.tokenize(query);

    const scored = verses.map((verse) => {
      let score = 0;
      const tags = (verse.tagsSemanticas || []).map((t) => this.normalizeText(t));
      const tema = this.normalizeText(verse.tema);
      const categoria = this.normalizeText(verse.categoria);
      const texto = this.normalizeText(verse.texto);

      if (queryTokens.length === 0) {
        score = 0.5;
      } else {
        for (const token of queryTokens) {
          // Pontuação para tags semânticas (peso alto)
          for (const tag of tags) {
            if (tag === token) {
              score += 3.0;
            } else if (tag.includes(token) || token.includes(tag)) {
              score += 1.8;
            }
          }

          // Pontuação para tema
          if (tema.includes(token)) {
            score += 1.5;
          }

          // Pontuação para categoria
          if (categoria.includes(token)) {
            score += 1.2;
          }

          // Pontuação para texto do versículo
          if (texto.includes(token)) {
            score += 0.8;
          }
        }
      }

      // Normaliza a pontuação entre 0.1 e 0.98
      const maxPossible = Math.max(1, queryTokens.length * 3.5);
      const normalizedScore = Math.min(
        0.98,
        Math.max(0.15, score / maxPossible),
      );

      return {
        verse,
        similarityScore: Number(normalizedScore.toFixed(4)),
        matchPercentage: Math.round(normalizedScore * 100),
      };
    });

    return scored
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, maxResults);
  }

  private buildVerseContext(verse: DailyVerse): string {
    const tags = (verse.tagsSemanticas || []).join(' ');
    return `${verse.tema}. ${tags}. ${verse.texto} (${verse.referencia})`;
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .trim();
  }

  private tokenize(text: string): string[] {
    return this.normalizeText(text)
      .split(/\s+/)
      .filter((word) => word.length >= 3 && !PT_STOPWORDS.has(word));
  }
}
