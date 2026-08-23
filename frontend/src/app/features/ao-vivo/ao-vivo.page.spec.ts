import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AoVivoPage } from './ao-vivo.page';

describe('AoVivoPage', () => {
  let fixture: ComponentFixture<AoVivoPage>;
  let component: AoVivoPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AoVivoPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(AoVivoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exibe título principal, séries e mensagens recentes', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Transmissões e Mensagens');
    expect(text).toContain('Série Presente 7');
    expect(text).toContain('Mensagens Recentes');
  });

  it('inclui episódios da série Presente 7', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('O Princípio da Criação');
    expect(text).toContain('Um Dia de Descanso e Cura');
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
