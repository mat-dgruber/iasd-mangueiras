import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AoVivoPage } from './ao-vivo.page';

describe('AoVivoPage', () => {
  let fixture: ComponentFixture<AoVivoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AoVivoPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(AoVivoPage);
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
});
