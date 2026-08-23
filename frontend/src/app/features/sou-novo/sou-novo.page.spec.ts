import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SouNovoPage } from './sou-novo.page';

describe('SouNovoPage', () => {
  let fixture: ComponentFixture<SouNovoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SouNovoPage] }).compileComponents();
    fixture = TestBed.createComponent(SouNovoPage);
    fixture.detectChanges();
  });

  it('exibe título e orientações principais para visitantes', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Primeira vez conosco?');
    expect(text).toContain('O que esperar na sua visita');
    expect(text).toContain('Recepção Calorosa');
    expect(text).toContain('Escola Sabatina');
    expect(text).toContain('Culto de Adoração');
    expect(text).toContain('Espaço para Crianças');
  });

  it('inclui seção de perguntas frequentes', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Perguntas Frequentes de Visitantes');
    expect(text).toContain('Preciso ser membro ou ter alguma religião para visitar?');
  });
});
