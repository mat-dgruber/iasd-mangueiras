import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { HomePage } from './home.page';
import { environment } from '../../../environments/environment';
import { DEFAULT_VIDEOS } from '../../core/services/youtube.service';

describe('HomePage', () => {
  let fixture: ComponentFixture<HomePage>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    // Responde à requisição inicial de vídeos
    const req = httpMock.expectOne(`${environment.apiUrl}/youtube/latest`);
    req.flush({ videos: DEFAULT_VIDEOS });
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('mostra informação essencial do visitante acima da dobra', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Igreja Adventista do Sétimo Dia das Mangueiras');
    expect(text).toContain('Tatuí-SP');
    expect(text).toContain('Como chegar e horários');
    expect(text).toContain('Assistir ao vivo');
  });

  it('inclui seções essenciais do design aprovado', () => {
    const headings = Array.from(
      fixture.nativeElement.querySelectorAll('h2') as NodeListOf<HTMLHeadingElement>,
    ).map((h) => h.textContent?.trim());

    expect(headings).toContain('Horários e localização');
    expect(headings).toContain('Ao vivo e mensagens');
    expect(headings).toContain('Eventos e destaques');
    expect(headings).toContain('Nossos ministérios');
    expect(headings).toContain('Próximos passos');
  });

  it('renderiza horários vindos do ContentService', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Escola Sabatina');
    expect(text).toContain('Culto Divino / Adoração');
  });

  it('renderiza a miniatura (thumbnail) do vídeo de destaque do YouTube', () => {
    const img = fixture.nativeElement.querySelector('img[alt]');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')).toContain('ytimg.com');
  });
});
