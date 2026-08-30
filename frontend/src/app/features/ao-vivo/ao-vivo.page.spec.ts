import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import {
  AoVivoPage,
  calculateNextLiveCountdown,
  OFFICIAL_LIVE_SERVICES,
} from './ao-vivo.page';
import { environment } from '../../../environments/environment';
import { YoutubeService } from '../../core/services/youtube.service';
import { VideoItem } from '../../core/models/youtube.models';

const MOCK_TEST_VIDEOS: VideoItem[] = [
  {
    id: 'sab-1',
    title: 'Saudade! - Parte 1 | Culto de Sábado',
    description: 'Culto de adoração e mensagem bíblica na IASD Mangueiras em Tatuí-SP.',
    thumbnail_url: 'https://i.ytimg.com/vi/QpQF6hCmAw8/hqdefault.jpg',
    published_at: '2026-08-22T10:15:00Z',
    video_url: 'https://www.youtube.com/watch?v=QpQF6hCmAw8',
  },
  {
    id: 'dom-1',
    title: 'A Imortalidade da Alma — Ademir Mendes | Culto de Domingo',
    description: 'Culto evangelístico e estudo das verdades bíblicas na IASD Mangueiras.',
    thumbnail_url: 'https://i.ytimg.com/vi/Gk7BusYGpVg/hqdefault.jpg',
    published_at: '2026-08-23T19:30:00Z',
    video_url: 'https://www.youtube.com/watch?v=Gk7BusYGpVg',
  },
  {
    id: 'qua-1',
    title: 'Servir — Josy Monteiro Cesar | Culto de Quarta',
    description: 'Culto de oração e testemunho no meio de semana na IASD Mangueiras.',
    thumbnail_url: 'https://i.ytimg.com/vi/v5On3uvpMe0/hqdefault.jpg',
    published_at: '2026-08-19T19:30:00Z',
    video_url: 'https://www.youtube.com/watch?v=v5On3uvpMe0',
  },
];

const MOCK_TEST_PRESENTE7_VIDEOS: VideoItem[] = [
  {
    id: 'p7-1',
    title: 'Lição 9 — Ministério Movido pelo Amor | Presente 7',
    description: 'Estudo bíblico aprofundado e reflexão temática da série especial Presente 7.',
    thumbnail_url: 'https://i.ytimg.com/vi/g_Xv8zP_Y1U/hqdefault.jpg',
    published_at: '2026-08-22T11:00:00Z',
    video_url: 'https://www.youtube.com/watch?v=g_Xv8zP_Y1U',
  },
  {
    id: 'p7-2',
    title: 'Lição 8 — O Poder da Ressurreição de Cristo | Presente 7',
    description: 'Comentários inspiradores e aplicação prática da lição da Escola Sabatina.',
    thumbnail_url: 'https://i.ytimg.com/vi/GYHNPDQTQcY/hqdefault.jpg',
    published_at: '2026-08-15T11:00:00Z',
    video_url: 'https://www.youtube.com/watch?v=GYHNPDQTQcY',
  },
];

describe('AoVivoPage', () => {
  let fixture: ComponentFixture<AoVivoPage>;
  let component: AoVivoPage;
  let httpMock: HttpTestingController;
  let youtubeService: YoutubeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AoVivoPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    youtubeService = TestBed.inject(YoutubeService);
    fixture = TestBed.createComponent(AoVivoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Responde às requisições do YouTube
    const reqLive = httpMock.match(`${environment.apiUrl}/youtube/live`);
    reqLive.forEach((r) => r.flush({ is_live: false, live_video: null }));

    const reqLatest = httpMock.match(`${environment.apiUrl}/youtube/latest`);
    reqLatest.forEach((r) => r.flush({ videos: MOCK_TEST_VIDEOS }));

    const reqCatalog = httpMock.match(`${environment.apiUrl}/youtube/catalog`);
    reqCatalog.forEach((r) => r.flush({ videos: MOCK_TEST_VIDEOS }));

    const reqPresente7 = httpMock.match(`${environment.apiUrl}/youtube/presente7`);
    reqPresente7.forEach((r) => r.flush({ videos: MOCK_TEST_PRESENTE7_VIDEOS }));

    const reqPlSabado = httpMock.match(`${environment.apiUrl}/youtube/playlist/sabado`);
    reqPlSabado.forEach((r) => r.flush({ videos: [MOCK_TEST_VIDEOS[0]] }));

    const reqPlDomingo = httpMock.match(`${environment.apiUrl}/youtube/playlist/domingo`);
    reqPlDomingo.forEach((r) => r.flush({ videos: [MOCK_TEST_VIDEOS[1]] }));

    const reqPlQuarta = httpMock.match(`${environment.apiUrl}/youtube/playlist/quarta`);
    reqPlQuarta.forEach((r) => r.flush({ videos: [MOCK_TEST_VIDEOS[2]] }));

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('exibe título principal, séries e catálogo de mensagens', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Transmissões e Mensagens');
    expect(text).toContain('Série Presente 7');
    expect(text).toContain('Catálogo de Mensagens');
  });

  it('inclui episódios recentes da série Presente 7', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Lição 9 — Ministério Movido pelo Amor');
    expect(text).toContain('Lição 8 — O Poder da Ressurreição de Cristo');
  });

  it('abre e fecha o player modal de vídeo inline seguro', () => {
    expect(fixture.nativeElement.querySelector('iframe')).toBeNull();

    component.openModal({
      id: 'test-vid-123',
      title: 'Culto Especial de Teste',
      description: 'Descrição de teste',
      thumbnail_url: 'https://img.youtube.com/vi/test-vid-123/hqdefault.jpg',
      published_at: '2026-08-20T10:00:00Z',
      video_url: 'https://www.youtube.com/watch?v=test-vid-123',
    });
    fixture.detectChanges();

    const iframe = fixture.nativeElement.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe.src).toContain('https://www.youtube-nocookie.com/embed/test-vid-123?autoplay=1');
    expect(fixture.nativeElement.textContent).toContain('Culto Especial de Teste');

    // Fechamento via escape
    component.onEscape();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('iframe')).toBeNull();

    // Reabertura e fechamento direto
    component.openModal(MOCK_TEST_VIDEOS[0]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('iframe')).not.toBeNull();

    component.closeModal();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('iframe')).toBeNull();
  });

  it('exibe contagem regressiva em tempo real quando isLive é false', () => {
    expect(youtubeService.isLive()).toBe(false);

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Próxima Transmissão');
    expect(text).toContain('Dias');
    expect(text).toContain('Horas');
    expect(text).toContain('Min');
    expect(text).toContain('Seg');
    expect(text).toContain('+ Adicionar à Agenda');
    expect(text).toContain('Convidar');
    expect(text).toContain('Última Mensagem Gravada');
  });

  it('exibe a barra de recursos e apoio ao culto (7me, lição, bíblia e oração)', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Pedido de Oração');
    expect(text).toContain('Dízimos & Ofertas');
    expect(text).toContain('Lição da Semana');
    expect(text).toContain('Bíblia Online');
  });

  it('calcula a contagem regressiva corretamente para datas de referência', () => {
    // 1. Sábado antes do culto (2026-08-22 08:00:00) -> Próximo: Sábado 10:15
    const satMorning = new Date(2026, 7, 22, 8, 0, 0); // Dia 6
    const resSat = calculateNextLiveCountdown(satMorning);
    expect(resSat.targetService.dayOfWeek).toBe(6);
    expect(resSat.days).toBe(0);
    expect(resSat.hours).toBe(2);
    expect(resSat.minutes).toBe(15);
    expect(resSat.seconds).toBe(0);

    // 2. Sábado à tarde após o culto (2026-08-22 15:00:00) -> Próximo: Domingo 19:30
    const satAfternoon = new Date(2026, 7, 22, 15, 0, 0);
    const resSun = calculateNextLiveCountdown(satAfternoon);
    expect(resSun.targetService.dayOfWeek).toBe(0);
    expect(resSun.days).toBe(1);
    expect(resSun.hours).toBe(4);
    expect(resSun.minutes).toBe(30);

    // 3. Domingo à noite após culto (2026-08-23 21:00:00) -> Próximo: Quarta 19:30
    const sunNight = new Date(2026, 7, 23, 21, 0, 0);
    const resWed = calculateNextLiveCountdown(sunNight);
    expect(resWed.targetService.dayOfWeek).toBe(3);
    expect(resWed.days).toBe(2);
    expect(resWed.hours).toBe(22);
    expect(resWed.minutes).toBe(30);
  });

  it('exibe banner de transmissão ao vivo quando isLive é true', () => {
    youtubeService.isLive.set(true);
    youtubeService.liveVideo.set({
      id: 'live-now-123',
      title: 'Transmissão Ao Vivo do Culto Divino',
      description: 'Estamos ao vivo transmitindo o louvor e adoração.',
      thumbnail_url: 'https://img.youtube.com/vi/live-now-123/hqdefault.jpg',
      published_at: '2026-08-25T10:00:00Z',
      video_url: 'https://www.youtube.com/watch?v=live-now-123',
    });

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Ao Vivo Agora');
    expect(text).toContain('Transmissão Ao Vivo do Culto Divino');
    expect(text).toContain('Abrir no YouTube ↗');
  });

  it('filtra vídeos do catálogo por categoria de forma reativa', () => {
    // Categoria padrão: 'todos'
    expect(component.selectedCategory()).toBe('todos');
    const totalCount = component.filteredVideos().length;
    expect(totalCount).toBeGreaterThan(0);

    // Categoria 'presente7'
    component.selectCategory('presente7');
    httpMock.match(`${environment.apiUrl}/youtube/presente7`).forEach((r) => r.flush({ videos: MOCK_TEST_PRESENTE7_VIDEOS }));
    fixture.detectChanges();
    expect(component.selectedCategory()).toBe('presente7');
    expect(component.filteredVideos().every((v) => v.title.includes('Presente 7'))).toBe(true);

    // Categoria 'sabado'
    component.selectCategory('sabado');
    httpMock.match(`${environment.apiUrl}/youtube/playlist/sabado`).forEach((r) => r.flush({ videos: [MOCK_TEST_VIDEOS[0]] }));
    fixture.detectChanges();
    expect(component.selectedCategory()).toBe('sabado');
    expect(
      component.filteredVideos().every((v) => {
        const t = `${v.title} ${v.description}`.toLowerCase();
        return (
          t.includes('sábado') ||
          t.includes('sabado') ||
          t.includes('adoração') ||
          t.includes('adoracao') ||
          t.includes('identidade') ||
          t.includes('divino') ||
          t.includes('escola sabatina')
        );
      }),
    ).toBe(true);

    // Categoria 'semana'
    component.selectCategory('semana');
    httpMock.match(`${environment.apiUrl}/youtube/playlist/semana`).forEach((r) => r.flush({ videos: [] }));
    fixture.detectChanges();
    expect(component.selectedCategory()).toBe('semana');
  });

  it('filtra vídeos instantaneamente pelo campo de busca', () => {
    component.onSearchInput({ target: { value: 'Saudade' } } as unknown as Event);
    fixture.detectChanges();

    expect(component.searchQuery()).toBe('Saudade');
    expect(component.filteredVideos().length).toBeGreaterThan(0);
    expect(
      component.filteredVideos().every((v) =>
        v.title.toLowerCase().includes('saudade') ||
        v.description.toLowerCase().includes('saudade')
      )
    ).toBe(true);

    // Limpa busca
    component.clearSearch();
    fixture.detectChanges();
    expect(component.searchQuery()).toBe('');
  });

  it('exibe empty state amigável quando a busca não encontra correspondências', () => {
    component.onSearchInput({
      target: { value: 'termo_inexistente_de_busca_xyz_123' },
    } as unknown as Event);
    fixture.detectChanges();

    expect(component.filteredVideos().length).toBe(0);
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Nenhuma mensagem encontrada');
    expect(text).toContain('Limpar Busca e Filtros');

    // Ao clicar em limpar filtros
    component.resetFilters();
    fixture.detectChanges();
    expect(component.searchQuery()).toBe('');
    expect(component.selectedCategory()).toBe('todos');
    expect(component.filteredVideos().length).toBeGreaterThan(0);
  });

  it('gera links válidos para Google Agenda, WhatsApp e Pedido de Oração', () => {
    const gCalUrl = component.getGoogleCalendarUrl();
    expect(gCalUrl).toContain('https://calendar.google.com/calendar/render?');
    expect(gCalUrl).toContain('IASD+Mangueiras');

    const whatsInvite = component.getWhatsAppInviteUrl();
    expect(whatsInvite).toContain('https://api.whatsapp.com/send?text=');
    expect(whatsInvite).toContain('IASD%20Mangueiras');

    const prayerWhats = component.getPrayerWhatsAppUrl();
    expect(prayerWhats).toContain('https://api.whatsapp.com/send?phone=5515997864835');
    expect(prayerWhats).toContain('ora%C3%A7%C3%A3o');
  });

  it('gerencia o menu suspenso de adicionar à agenda', () => {
    expect(component.openCalendarMenu()).toBe(false);

    component.toggleCalendarMenu();
    expect(component.openCalendarMenu()).toBe(true);

    component.closeCalendarMenu();
    expect(component.openCalendarMenu()).toBe(false);
  });

  it('exibe o card acolhedor de Pedido de Oração e Intercessão', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Precisa de Oração?');
    expect(text).toContain('Cuidado e Intercessão');
    expect(text).toContain('Pedir Oração no WhatsApp');
    expect(text).toContain('Falar Conosco');
  });
});

