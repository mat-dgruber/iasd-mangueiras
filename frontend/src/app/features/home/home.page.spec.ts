import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HomePage } from './home.page';

describe('HomePage', () => {
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
  });


  it('mostra informação essencial do visitante acima da dobra', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Igreja Adventista do Sétimo Dia das Mangueiras');
    expect(text).toContain('Tatuí-SP');
    expect(text).toContain('Como chegar e horários');
    expect(text).toContain('Assistir ao vivo');
  });

  it('inclui seções essenciais do design aprovado', () => {
    const headings = Array.from(fixture.nativeElement.querySelectorAll('h2') as NodeListOf<HTMLHeadingElement>).map((h) => h.textContent?.trim());

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
});

