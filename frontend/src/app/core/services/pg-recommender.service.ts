import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PequenoGrupo } from '../models/content.models';

export interface PgMatch {
  pg: PequenoGrupo;
  score: number; // 0.0 a 1.0 (afinidade semântica)
  matchPercentage: number; // 0 a 100
}

@Injectable({
  providedIn: 'root',
})
export class PgRecommenderService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly isLoading = signal<boolean>(false);
  readonly isReady = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  private model: any = null;
  private tf: any = null;
  private embeddingsCache = new Map<string, number[]>();

  /**
   * Inicializa o Universal Sentence Encoder de forma lazy e segura (apenas no browser).
   */
  async initialize(): Promise<boolean> {
    if (!this.isBrowser) return false;
    if (this.model) return true;
    if (this.isLoading()) return false;

    this.isLoading.set(true);
    this.error.set(null);

    try {
      // Import dinâmico para garantir zero impacto no bundle SSR
      const [tf, use] = await Promise.all([
        import('@tensorflow/tfjs'),
        import('@tensorflow-models/universal-sentence-encoder'),
      ]);

      this.tf = tf;
      // Garante backend pronto (webgl ou cpu)
      await tf.ready();
      this.model = await use.load();

      this.isReady.set(true);
      this.isLoading.set(false);
      return true;
    } catch (err: any) {
      console.warn('[PgRecommender] Falha ao carregar modelo TensorFlow:', err);
      this.error.set('Não foi possível carregar o modelo de IA no navegador.');
      this.isLoading.set(false);
      return false;
    }
  }

  /**
   * Recomenda os PGs com maior afinidade semântica para a consulta em linguagem natural.
   */
  async recommend(query: string, pgs: readonly PequenoGrupo[] | PequenoGrupo[], topN: number = 3): Promise<PgMatch[]> {
    if (!this.isBrowser || !query || !query.trim() || pgs.length === 0) {
      return [];
    }

    if (!this.model) {
      const initialized = await this.initialize();
      if (!initialized || !this.model) {
        return [];
      }
    }

    try {
      const cleanQuery = query.trim().toLowerCase();

      // 1. Gera embedding da query de busca
      const queryTensor = await this.model.embed([cleanQuery]);
      const queryVector = (await queryTensor.array())[0] as number[];
      queryTensor.dispose();

      // 2. Prepara textos dos PGs para embedding
      const pgTexts = pgs.map((pg) => this.buildPgCorpus(pg));

      // 3. Obtém ou calcula embeddings dos PGs
      const missingIndexes: number[] = [];
      const missingTexts: string[] = [];

      pgTexts.forEach((text, idx) => {
        if (!this.embeddingsCache.has(text)) {
          missingIndexes.push(idx);
          missingTexts.push(text);
        }
      });

      if (missingTexts.length > 0) {
        const pgsTensor = await this.model.embed(missingTexts);
        const pgsVectors = (await pgsTensor.array()) as number[][];
        pgsTensor.dispose();

        missingTexts.forEach((text, i) => {
          this.embeddingsCache.set(text, pgsVectors[i]);
        });
      }

      // 4. Calcula Cosine Similarity entre Query e cada PG
      const matches: PgMatch[] = pgs.map((pg, idx) => {
        const text = pgTexts[idx];
        const pgVector = this.embeddingsCache.get(text)!;
        const score = this.calculateCosineSimilarity(queryVector, pgVector);
        
        // Normaliza para % visual (0 a 100)
        const matchPercentage = Math.round(Math.max(0, Math.min(1, score)) * 100);

        return {
          pg,
          score,
          matchPercentage,
        };
      });

      // 5. Ordena decrescente por afinidade semântica
      matches.sort((a, b) => b.score - a.score);

      return matches.slice(0, topN);
    } catch (err) {
      console.warn('[PgRecommender] Erro no cálculo de recomendação:', err);
      return [];
    }
  }

  private buildPgCorpus(pg: PequenoGrupo): string {
    return `Pequeno Grupo ${pg.nome}. Bairro ${pg.bairro} Tatuí. Perfil de público ${pg.perfil}. Encontros aos ${pg.dia} às ${pg.horario}. ${pg.descricao} Líder ${pg.lider}.`.toLowerCase();
  }

  private calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
