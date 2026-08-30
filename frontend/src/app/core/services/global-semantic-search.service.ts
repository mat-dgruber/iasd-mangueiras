import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ContentService } from './content.service';
import { BibleService } from './bible.service';
import { YoutubeService } from './youtube.service';
import {
  SearchEntityType,
  SearchFilterOptions,
  SemanticSearchResult,
} from '../models/search.models';

const PT_STOPWORDS = new Set([
  'a', 'ao', 'aos', 'as', 'ate', 'com', 'da', 'das', 'de', 'delas', 'dele', 'deles',
  'depois', 'do', 'dos', 'e', 'ela', 'elas', 'ele', 'eles', 'em', 'entre', 'era',
  'essa', 'essas', 'esse', 'esses', 'esta', 'estao', 'este', 'eu', 'foi', 'foram',
  'fosse', 'ha', 'havia', 'isso', 'ja', 'lhe', 'lhes', 'mais', 'mas', 'me', 'mesmo',
  'meu', 'meus', 'minha', 'minhas', 'muito', 'na', 'nas', 'nao', 'nem', 'no',
  'nos', 'num', 'numa', 'o', 'os', 'ou', 'para', 'pela', 'pelas', 'pelo', 'pelos',
  'por', 'qual', 'quando', 'que', 'quem', 'se', 'seja', 'sem', 'sera', 'seu', 'seus',
  'so', 'sua', 'suas', 'tambem', 'te', 'tem', 'tenho', 'ter', 'teu', 'teus', 'tinha',
  'tu', 'tua', 'tuas', 'um', 'uma', 'voce', 'voces', 'vos', 'onde', 'como',
]);

interface CorpusItem {
  result: Omit<SemanticSearchResult, 'similarityScore' | 'matchPercentage'>;
  searchText: string;
}

@Injectable({
  providedIn: 'root',
})
export class GlobalSemanticSearchService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly contentService = inject(ContentService);
  private readonly bibleService = inject(BibleService);
  private readonly youtubeService = inject(YoutubeService);

  private readonly _isLoading = signal<boolean>(false);
  readonly isLoading = this._isLoading.asReadonly();

  private readonly _isModelReady = signal<boolean>(false);
  readonly isModelReady = this._isModelReady.asReadonly();

  private model: any = null;
  private tf: any = null;
  private embeddingsMatrix: any = null;
  private embeddedCorpusIds: string[] = [];
  private initPromise?: Promise<boolean>;

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Agrega todos os itens de conteúdo em um único corpus unificado
  readonly corpus = computed<CorpusItem[]>(() => {
    const items: CorpusItem[] = [];

    // 1. Horários de Culto
    for (const h of this.contentService.horarios()) {
      if (h.ativo === false) continue;
      items.push({
        result: {
          id: `horario-${h.id || h.titulo}`,
          type: 'horario',
          title: h.titulo,
          description: `${h.dia} às ${h.horario}. ${h.descricao || ''}`,
          url: '/horarios',
          badgeText: 'Horário de Culto',
          departmentOrCategory: 'Cultos & Programação',
          tags: ['culto', 'igreja', 'sabado', 'quarta', 'oracao', 'louvor', h.dia.toLowerCase()],
        },
        searchText: `${h.titulo} ${h.dia} ${h.horario} ${h.descricao || ''} culto igreja sabado domingo quarta`,
      });
    }

    // 2. Eventos
    for (const ev of this.contentService.eventos()) {
      if (ev.status === 'rascunho') continue;
      items.push({
        result: {
          id: `evento-${ev.id || ev.titulo}`,
          type: 'evento',
          title: ev.titulo,
          description: `${ev.data} às ${ev.horario}. ${ev.descricao}`,
          url: '/eventos',
          badgeText: ev.destaque ? '⭐ Evento Destaque' : 'Evento Especial',
          departmentOrCategory: ev.departamento || 'Geral',
          tags: [
            'evento',
            'programacao',
            ev.departamento?.toLowerCase() || '',
            ev.palestrante?.toLowerCase() || '',
            ev.publico_alvo?.toLowerCase() || '',
          ].filter(Boolean),
          metadata: {
            data: ev.data,
            local: ev.local || ev.endereco,
            link_inscricao: ev.link_inscricao,
          },
        },
        searchText: `${ev.titulo} ${ev.descricao} ${ev.departamento || ''} ${ev.palestrante || ''} ${ev.publico_alvo || ''} ${ev.data} ${ev.local || ''}`,
      });
    }

    // 3. Ministérios
    for (const m of this.contentService.ministerios()) {
      items.push({
        result: {
          id: `ministerio-${m.id || m.nome}`,
          type: 'ministerio',
          title: m.nome,
          description: m.descricao,
          url: '/ministerios',
          badgeText: 'Ministério / Departamento',
          departmentOrCategory: m.lideres || m.categoria || 'Igreja',
          tags: [
            'ministerio',
            'departamento',
            'servico',
            'voluntario',
            'envolvimento',
            m.nome.toLowerCase(),
            ...(m.atividades || []).map((a) => a.toLowerCase()),
          ],
        },
        searchText: `${m.nome} ${m.descricao} ${m.lideres || ''} ${(m.atividades || []).join(' ')} servir voluntariado`,
      });
    }

    // 4. Pequenos Grupos (PGs)
    for (const pg of this.contentService.pgs()) {
      if (pg.ativo === false) continue;
      items.push({
        result: {
          id: `pg-${pg.id || pg.nome}`,
          type: 'pg',
          title: pg.nome,
          description: `${pg.dia} às ${pg.horario}. Líder: ${pg.lider}. Bairro: ${pg.bairro}.`,
          url: '/estudos',
          badgeText: 'Pequeno Grupo',
          departmentOrCategory: pg.perfil || 'Comunidade',
          tags: ['pg', 'pequeno grupo', 'comunhao', 'oracao', 'estudo', pg.bairro.toLowerCase(), pg.perfil.toLowerCase()],
          metadata: {
            bairro: pg.bairro,
            telefone: pg.telefone,
          },
        },
        searchText: `${pg.nome} ${pg.dia} ${pg.horario} ${pg.lider} ${pg.bairro} ${pg.perfil} ${pg.descricao} pequeno grupo comunhao amizade`,
      });
    }

    // 5. Versículos e Temas Bíblicos
    for (const v of this.bibleService.getCuratedVerses()) {
      items.push({
        result: {
          id: `versiculo-${v.referencia}`,
          type: 'versiculo',
          title: `${v.tema} — ${v.referencia}`,
          description: `"${v.texto}"`,
          url: '/estudos',
          badgeText: `Bíblia • ${v.categoria}`,
          departmentOrCategory: v.categoria,
          tags: ['biblia', 'versiculo', 'palavra de deus', ...(v.tagsSemanticas || [])],
        },
        searchText: `${v.tema} ${v.texto} ${v.referencia} ${v.categoria} ${(v.tagsSemanticas || []).join(' ')}`,
      });
    }

    // 6. Vídeos e Pregações do YouTube (se carregados)
    for (const vid of this.youtubeService.videos()) {
      items.push({
        result: {
          id: `video-${vid.id}`,
          type: 'video',
          title: vid.title,
          description: vid.description || 'Mensagem gravada na IASD Mangueiras.',
          url: '/ao-vivo',
          badgeText: 'Vídeo / Pregação',
          departmentOrCategory: 'Ao Vivo',
          tags: ['video', 'sermão', 'pregacao', 'youtube', 'louvor'],
          metadata: {
            thumbnail_url: vid.thumbnail_url,
            video_url: vid.video_url,
          },
        },
        searchText: `${vid.title} ${vid.description || ''} video pregacao sermão`,
      });
    }

    return items;
  });

  async initializeNeuralModel(): Promise<boolean> {
    if (this._isModelReady()) return true;
    if (this.initPromise) return this.initPromise;
    if (!this.isBrowser) return false;

    this.initPromise = (async () => {
      this._isLoading.set(true);
      try {
        const [tfModule, useModule] = await Promise.all([
          import('@tensorflow/tfjs'),
          import('@tensorflow-models/universal-sentence-encoder'),
        ]);

        this.tf = tfModule;
        this.model = await useModule.load();

        await this.rebuildEmbeddings();

        this._isModelReady.set(true);
        return true;
      } catch {
        this._isModelReady.set(false);
        return false;
      } finally {
        this._isLoading.set(false);
      }
    })();

    return this.initPromise;
  }

  private async rebuildEmbeddings(): Promise<void> {
    if (!this.model) return;
    const currentCorpus = this.corpus();
    if (currentCorpus.length === 0) return;

    if (this.embeddingsMatrix) {
      this.embeddingsMatrix.dispose();
      this.embeddingsMatrix = null;
    }

    const textsToEmbed = currentCorpus.map((item) => item.searchText);
    this.embeddingsMatrix = await this.model.embed(textsToEmbed);
    this.embeddedCorpusIds = currentCorpus.map((item) => item.result.id);
  }

  async search(
    query: string,
    options: SearchFilterOptions = {},
  ): Promise<SemanticSearchResult[]> {
    const cleanQuery = query.trim();
    const maxResults = options.maxResults ?? 12;
    const category = options.category ?? 'all';

    let currentCorpus = this.corpus();
    if (category !== 'all') {
      currentCorpus = currentCorpus.filter((item) => item.result.type === category);
    }

    if (!cleanQuery) {
      return currentCorpus.slice(0, maxResults).map((item, index) => ({
        ...item.result,
        similarityScore: Math.max(0.5, 1 - index * 0.05),
        matchPercentage: Math.round(Math.max(50, 100 - index * 5)),
      }));
    }

    // Se o modelo neural estiver pronto, usa Inferência Neural via Tensor
    if (this._isModelReady() && this.model && this.embeddingsMatrix && this.tf) {
      try {
        return await this.neuralSearch(cleanQuery, currentCorpus, maxResults, options.minScore);
      } catch {
        return this.heuristicSearch(cleanQuery, currentCorpus, maxResults, options.minScore);
      }
    }

    // Fallback heurístico ultra-rápido
    return this.heuristicSearch(cleanQuery, currentCorpus, maxResults, options.minScore);
  }

  private async neuralSearch(
    query: string,
    filteredCorpus: CorpusItem[],
    maxResults: number,
    minScore = 0.2,
  ): Promise<SemanticSearchResult[]> {
    const allCorpus = this.corpus();
    const queryEmbedding = await this.model.embed([query]);

    try {
      const scoresArray: Float32Array = this.tf.tidy(() => {
        const similarity = this.tf.matMul(
          this.embeddingsMatrix,
          queryEmbedding,
          false,
          true,
        );
        return similarity.squeeze().dataSync();
      });

      const results: SemanticSearchResult[] = [];

      for (let i = 0; i < allCorpus.length; i++) {
        const corpusItem = allCorpus[i];
        if (!filteredCorpus.some((fc) => fc.result.id === corpusItem.result.id)) {
          continue;
        }

        const rawScore = scoresArray[i] ?? 0;
        // Normaliza de [-1, 1] para [0, 1]
        const normalized = Math.max(0, Math.min(1, (rawScore + 1) / 2));

        if (normalized >= minScore) {
          results.push({
            ...corpusItem.result,
            similarityScore: Number(normalized.toFixed(4)),
            matchPercentage: Math.round(normalized * 100),
          });
        }
      }

      return results
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, maxResults);
    } finally {
      queryEmbedding.dispose();
    }
  }

  private heuristicSearch(
    query: string,
    corpus: CorpusItem[],
    maxResults: number,
    minScore = 0.1,
  ): SemanticSearchResult[] {
    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) {
      return corpus.slice(0, maxResults).map((c) => ({
        ...c.result,
        similarityScore: 0.5,
        matchPercentage: 50,
      }));
    }

    const scored: SemanticSearchResult[] = [];

    for (const item of corpus) {
      let score = 0;
      const titleNorm = this.normalizeText(item.result.title);
      const descNorm = this.normalizeText(item.result.description);
      const tagsNorm = (item.result.tags || []).map((t) => this.normalizeText(t));
      const deptNorm = this.normalizeText(item.result.departmentOrCategory || '');

      for (const token of queryTokens) {
        if (titleNorm.includes(token)) score += 3.5;
        if (tagsNorm.some((t) => t.includes(token))) score += 2.5;
        if (deptNorm.includes(token)) score += 1.8;
        if (descNorm.includes(token)) score += 1.0;
      }

      const maxPossible = queryTokens.length * 4.0;
      const normalizedScore = Math.min(0.99, Math.max(0.05, score / maxPossible));

      if (normalizedScore >= minScore) {
        scored.push({
          ...item.result,
          similarityScore: Number(normalizedScore.toFixed(4)),
          matchPercentage: Math.round(normalizedScore * 100),
        });
      }
    }

    return scored
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, maxResults);
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
      .filter((word) => word.length >= 2 && !PT_STOPWORDS.has(word));
  }
}
