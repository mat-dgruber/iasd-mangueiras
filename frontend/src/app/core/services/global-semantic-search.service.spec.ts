import { TestBed } from '@angular/core/testing';
import { GlobalSemanticSearchService } from './global-semantic-search.service';
import { ContentService } from './content.service';
import { BibleService } from './bible.service';
import { YoutubeService } from './youtube.service';
import { Evento, Horario, Ministerio, PequenoGrupo } from '../models/content.models';
import { DailyVerse } from '../models/story.models';

describe('GlobalSemanticSearchService', () => {
  let service: GlobalSemanticSearchService;

  const mockHorarios: Partial<Horario>[] = [
    {
      id: 'sabado',
      titulo: 'Culto Divino',
      dia: 'Sábado',
      horario: '10:15',
      descricao: 'Momento solene de adoração da congregação.',
      ativo: true,
    },
  ];

  const mockEventos: Partial<Evento>[] = [
    {
      id: 'oracao',
      titulo: 'Semana de Oração da Família',
      data: '15 a 22 de Março',
      horario: '19:30',
      descricao: 'Encontros de restauração do lar e oração pelos filhos.',
      departamento: 'Família',
      destaque: true,
      status: 'publicado',
    },
  ];

  const mockMinisterios: Partial<Ministerio>[] = [
    {
      id: 'desbravadores',
      nome: 'Clube de Desbravadores Guardiões da Colina',
      descricao: 'Atividades ao ar livre, acampamentos e desenvolvimento para juvenis e adolescentes.',
      lideres: 'Diretoria do Clube',
      atividades: ['Acampamentos', 'Nós e Amarras', 'Ordem Unida'],
    },
    {
      id: 'asa',
      nome: 'Ação Solidária Adventista (ASA)',
      descricao: 'Arrecadação e distribuição de cestas básicas e agasalhos para famílias carentes em Tatuí.',
      lideres: 'Equipe ASA',
      atividades: ['Cestas Básicas', 'Bazar Solidário'],
    },
  ];

  const mockPgs: Partial<PequenoGrupo>[] = [
    {
      id: 'pg-jovem',
      nome: 'PG Jovens Conectados',
      dia: 'Sexta-feira',
      horario: '20:00',
      lider: 'Lucas & Mariana',
      bairro: 'Jardim Wanderley',
      telefone: '15999999999',
      perfil: 'Jovens (JA)',
      descricao: 'Estudo dinâmico da Bíblia e comunhão com jovens.',
      ativo: true,
    },
  ];

  const mockVerses: DailyVerse[] = [
    {
      id: 'v1',
      referencia: 'Filipenses 4:6-7',
      texto: 'Não andeis ansiosos por coisa alguma; antes, as vossas petições sejam conhecidas diante de Deus pela oração...',
      tema: 'Paz e Ansiedade',
      categoria: 'oracao',
      tagsSemanticas: ['ansiedade', 'paz', 'oracao', 'medo', 'confiança'],
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GlobalSemanticSearchService,
        {
          provide: ContentService,
          useValue: {
            horarios: () => mockHorarios,
            eventos: () => mockEventos,
            ministerios: () => mockMinisterios,
            pgs: () => mockPgs,
          },
        },
        {
          provide: BibleService,
          useValue: {
            getCuratedVerses: () => mockVerses,
          },
        },
        {
          provide: YoutubeService,
          useValue: {
            videos: () => [],
          },
        },
      ],
    });

    service = TestBed.inject(GlobalSemanticSearchService);
  });

  it('constrói o corpus agregando eventos, cultos, ministérios, PGs e versículos', () => {
    const corpus = service.corpus();
    expect(corpus.length).toBeGreaterThanOrEqual(5);

    const types = corpus.map((c) => c.result.type);
    expect(types).toContain('horario');
    expect(types).toContain('evento');
    expect(types).toContain('ministerio');
    expect(types).toContain('pg');
    expect(types).toContain('versiculo');
  });

  it('encontra ministério de caridade buscando por "alimentos e cestas básicas"', async () => {
    const results = await service.search('alimentos e cestas');
    expect(results.length).toBeGreaterThan(0);
    const topResult = results[0];
    expect(topResult.title).toContain('Ação Solidária Adventista');
    expect(topResult.type).toBe('ministerio');
  });

  it('encontra versículo de paz buscando por "ansiedade e medo"', async () => {
    const results = await service.search('estou com muita ansiedade');
    expect(results.length).toBeGreaterThan(0);
    const versiculo = results.find((r) => r.type === 'versiculo');
    expect(versiculo).toBeDefined();
    expect(versiculo?.title).toContain('Filipenses');
  });

  it('encontra evento de oração buscando por "oração para família"', async () => {
    const results = await service.search('oração pelos lares e família');
    expect(results.length).toBeGreaterThan(0);
    const evento = results.find((r) => r.type === 'evento');
    expect(evento).toBeDefined();
    expect(evento?.title).toContain('Semana de Oração da Família');
  });

  it('filtra por categoria específica quando solicitado', async () => {
    const results = await service.search('jovens', { category: 'pg' });
    expect(results.every((r) => r.type === 'pg')).toBe(true);
    expect(results[0].title).toContain('PG Jovens');
  });
});
