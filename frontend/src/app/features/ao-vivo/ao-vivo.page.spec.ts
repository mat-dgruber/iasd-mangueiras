import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AoVivoPage } from './ao-vivo.page';
import { environment } from '../../../environments/environment';
import { DEFAULT_VIDEOS, DEFAULT_PRESENTE7_VIDEOS } from '../../core/services/youtube.service';

describe('AoVivoPage', () => {
  let fixture: ComponentFixture<AoVivoPage>;
  let component: AoVivoPage;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AoVivoPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AoVivoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Responde às requisições do YouTube se houverem
    const reqLive = httpMock.match(`${environment.apiUrl}/youtube/live`);
    reqLive.forEach((r) => r.flush({ is_live: false, live_video: null }));

    const reqLatest = httpMock.match(`${environment.apiUrl}/youtube/latest`);
    reqLatest.forEach((r) => r.flush({ videos: DEFAULT_VIDEOS }));

    const reqPresente7 = httpMock.match(`${environment.apiUrl}/youtube/presente7`);
    reqPresente7.forEach((r) => r.flush({ videos: DEFAULT_PRESENTE7_VIDEOS }));

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('exibe título principal, séries e mensagens recentes', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Transmissões e Mensagens');
    expect(text).toContain('Série Presente 7');
    expect(text).toContain('Mensagens Recentes');
  });

  it('inclui episódios recentes da série Presente 7', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Série Presente 7 — Lição da Semana');
    expect(text).toContain('Série Presente 7 — Princípios e Fundamentos da Fé');
  });

  it('abre e fecha o player modal de vídeo inline', () => {
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

    expect(fixture.nativeElement.querySelector('iframe')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Culto Especial de Teste');

    component.closeModal();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('iframe')).toBeNull();
  });
});
