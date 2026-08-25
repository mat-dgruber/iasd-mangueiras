import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { DailyVerse, VerseCategory } from '../models/story.models';

export type { DailyVerse, VerseCategory };

interface BibleApiResponse {
  reference?: string;
  text?: string;
  verses?: Array<{
    book_name?: string;
    chapter?: number;
    verse?: number;
    text?: string;
  }>;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BibleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://bible-api.com';
  private readonly verseCache = new Map<string, DailyVerse>();

  private readonly defaultVerses: DailyVerse[] = [
    {
      id: 'salmos-23',
      texto:
        'O Senhor é o meu pastor; nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.',
      referencia: 'Salmos 23:1-2',
      tema: 'Confiança & Paz',
      categoria: 'paz',
      tagsSemanticas: [
        'ansiedade',
        'calmaria',
        'cuidado',
        'pastor',
        'tranquilidade',
        'protecao',
        'descanso',
      ],
    },
    {
      id: 'jeremias-29',
      texto:
        'Porque sou eu que conheço os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.',
      referencia: 'Jeremias 29:11',
      tema: 'Esperança & Futuro',
      categoria: 'esperanca',
      tagsSemanticas: [
        'futuro',
        'planos',
        'proposito',
        'esperanca',
        'prosperidade',
        'confianca',
      ],
    },
    {
      id: 'filipenses-4',
      texto:
        'Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus.',
      referencia: 'Filipenses 4:6',
      tema: 'Oração & Serenidade',
      categoria: 'oracao',
      tagsSemanticas: [
        'ansiedade',
        'oracao',
        'gratidao',
        'suplica',
        'paz',
        'serenidade',
        'preocupacao',
      ],
    },
    {
      id: 'mateus-11',
      texto:
        'Venham a mim, todos os que estão cansados e sobrecarregados, e eu darei descanso a vocês.',
      referencia: 'Mateus 11:28',
      tema: 'Descanso em Jesus',
      categoria: 'paz',
      tagsSemanticas: [
        'cansaco',
        'sobrecarga',
        'descanso',
        'alivio',
        'acolhimento',
        'jesus',
        'paz',
      ],
    },
    {
      id: 'isaias-41',
      texto:
        'Por isso não tema, pois estou com você; não tenha medo, pois sou o seu Deus. Eu o fortalecerei e o ajudarei; eu o segurarei com a minha mão direita vitoriosa.',
      referencia: 'Isaías 41:10',
      tema: 'Coragem & Força',
      categoria: 'coragem',
      tagsSemanticas: [
        'medo',
        'coragem',
        'forca',
        'amparo',
        'vitoria',
        'ajuda',
        'fortalecimento',
      ],
    },
    {
      id: 'joao-3',
      texto:
        'Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.',
      referencia: 'João 3:16',
      tema: 'Amor Incondicional',
      categoria: 'amor',
      tagsSemanticas: [
        'salvacao',
        'amor',
        'graca',
        'vida eterna',
        'jesus',
        'evangelho',
        'fe',
      ],
    },
    {
      id: 'romanos-8',
      texto:
        'Sabemos que Deus age em todas as coisas para o bem daqueles que o amam, dos que foram chamados de acordo com o seu propósito.',
      referencia: 'Romanos 8:28',
      tema: 'Fé & Soberania',
      categoria: 'fe',
      tagsSemanticas: [
        'soberania',
        'proposito',
        'providencia',
        'fe',
        'confianca',
        'bem',
      ],
    },
    {
      id: 'salmos-91',
      texto:
        'Aquele que habita no abrigo do Altíssimo e descansa à sombra do Todo-poderoso pode dizer ao Senhor: Tu és o meu refúgio e a minha fortaleza, o meu Deus, em quem confio.',
      referencia: 'Salmos 91:1-2',
      tema: 'Proteção & Refúgio',
      categoria: 'coragem',
      tagsSemanticas: [
        'refugio',
        'protecao',
        'fortaleza',
        'seguranca',
        'confianca',
        'abrigo',
      ],
    },
    {
      id: 'proverbios-3',
      texto:
        'Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.',
      referencia: 'Provérbios 3:5-6',
      tema: 'Confiança & Direção',
      categoria: 'direcao',
      tagsSemanticas: [
        'direcao',
        'sabedoria',
        'caminhos',
        'confianca',
        'orientacao',
        'guia',
      ],
    },
    {
      id: '2-timoteo-1',
      texto:
        'Porque Deus não nos deu espírito de covardia, mas de poder, de amor e de moderação.',
      referencia: '2 Timóteo 1:7',
      tema: 'Coragem & Poder',
      categoria: 'coragem',
      tagsSemanticas: [
        'covardia',
        'poder',
        'amor',
        'moderacao',
        'equilibrio',
        'dominio proprio',
        'coragem',
      ],
    },
    {
      id: 'salmos-46',
      texto:
        'Aquietai-vos e sabei que eu sou Deus; serei exaltado entre as nações, serei exaltado sobre a terra.',
      referencia: 'Salmos 46:10',
      tema: 'Silêncio & Presença',
      categoria: 'paz',
      tagsSemanticas: [
        'aquietar',
        'silencio',
        'presenca',
        'paz',
        'soberania',
        'deus',
      ],
    },
    {
      id: '2-corintios-12',
      texto:
        'Disse-me ele: A minha graça te é suficiente, porque o meu poder se aperfeiçoa na fraqueza. De boa vontade, pois, me gloriarei nas minhas fraquezas, para que sobre mim repouse o poder de Cristo.',
      referencia: '2 Coríntios 12:9',
      tema: 'Graça & Fraqueza',
      categoria: 'amor',
      tagsSemanticas: [
        'graca',
        'fraqueza',
        'superacao',
        'poder de cristo',
        'suficiencia',
        'conforto',
      ],
    },
    {
      id: 'josue-1',
      texto:
        'Não te ordenei eu? Sê forte e corajoso! Não te atemorizes nem te desanimes, porque o Senhor, teu Deus, estará contigo por onde quer que andares.',
      referencia: 'Josué 1:9',
      tema: 'Força & Ânimo',
      categoria: 'coragem',
      tagsSemanticas: [
        'animo',
        'coragem',
        'forca',
        'desanimo',
        'presenca divina',
        'fidelidade',
      ],
    },
    {
      id: 'efesios-3',
      texto:
        'Àquele que é poderoso para fazer muito mais abundantemente além de tudo quanto pedimos ou pensamos, de acordo com o poder que opera em nós.',
      referencia: 'Efésios 3:20',
      tema: 'Abundância & Fé',
      categoria: 'fe',
      tagsSemanticas: [
        'milagre',
        'abundancia',
        'fe',
        'poder',
        'oracao',
        'impossivel',
      ],
    },
    {
      id: 'lucas-11',
      texto:
        'E eu vos digo: Pedi e dar-se-vos-á; buscai e achareis; batei e abrir-se-vos-á.',
      referencia: 'Lucas 11:9',
      tema: 'Oração & Perseverança',
      categoria: 'oracao',
      tagsSemanticas: [
        'oracao',
        'perseveranca',
        'busca',
        'resposta',
        'fe',
        'clamor',
      ],
    },
    {
      id: 'salmos-103',
      texto:
        'Bendize, ó minha alma, ao Senhor, e tudo o que há em mim bendiga ao seu santo nome. Bendize, ó minha alma, ao Senhor, e não te esqueças de nenhum de seus benefícios.',
      referencia: 'Salmos 103:1-2',
      tema: 'Louvor & Gratidão',
      categoria: 'gratidao',
      tagsSemanticas: [
        'gratidao',
        'louvor',
        'bencaos',
        'agradecimento',
        'beneficios',
        'alma',
      ],
    },
  ];

  constructor() {
    // Popula o cache inicial com os versículos padrão
    for (const v of this.defaultVerses) {
      this.verseCache.set(this.normalizeKey(v.referencia), v);
    }
  }

  getCuratedVerses(): DailyVerse[] {
    return [...this.defaultVerses];
  }

  getDailyVerse(date: Date = new Date()): DailyVerse {
    const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 1);
    const currentUtc = Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    );
    const dayOfYear = Math.floor(
      (currentUtc - startOfYear) / (1000 * 60 * 60 * 24),
    );
    const index = Math.abs(dayOfYear) % this.defaultVerses.length;
    return this.defaultVerses[index];
  }

  fetchPassage(
    passage: string,
    tema = 'Palavra Inspiradora',
    categoria: VerseCategory = 'geral',
  ): Observable<DailyVerse> {
    const trimmed = passage.trim();
    if (!trimmed) {
      return of(this.defaultVerses[0]);
    }

    const key = this.normalizeKey(trimmed);
    if (this.verseCache.has(key)) {
      return of(this.verseCache.get(key)!);
    }

    const url = `${this.baseUrl}/${encodeURIComponent(trimmed)}?translation=almeida`;

    return this.http.get<BibleApiResponse>(url).pipe(
      map((res) => {
        if (!res || res.error || !res.text) {
          throw new Error(res?.error || 'Passagem não encontrada na Bíblia');
        }

        const cleanText = this.sanitizeBibleText(res.text);
        const ref = res.reference || trimmed;

        const newVerse: DailyVerse = {
          id: `api-${key}-${Date.now()}`,
          texto: cleanText,
          referencia: ref,
          tema,
          categoria,
        };

        this.verseCache.set(key, newVerse);
        return newVerse;
      }),
      catchError(() => {
        // Tenta encontrar um fallback parecido ou retorna erro
        const fallback = this.findFallback(trimmed);
        if (fallback) {
          return of(fallback);
        }
        throw new Error(
          `Não foi possível carregar a passagem "${trimmed}". Verifique a referência (ex: "João 3:16" ou "Salmos 23:1").`,
        );
      }),
    );
  }

  private normalizeKey(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  private sanitizeBibleText(raw: string): string {
    return raw
      .replace(/\u00a0/g, ' ')
      .replace(/[\r\n]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  private findFallback(query: string): DailyVerse | undefined {
    const norm = this.normalizeKey(query);
    return this.defaultVerses.find((v) =>
      this.normalizeKey(v.referencia).includes(norm),
    );
  }
}
