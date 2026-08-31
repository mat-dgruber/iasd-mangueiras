import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EscalaCultoCardComponent } from './escala-culto-card.component';
import { CultoEscalaGroup } from '../../../core/models/content.models';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('EscalaCultoCardComponent', () => {
  let component: EscalaCultoCardComponent;
  let fixture: ComponentFixture<EscalaCultoCardComponent>;

  const mockGroup: CultoEscalaGroup = {
    data: '2026-09-05',
    dataFormatada: '05 de Setembro de 2026',
    diaSemana: 'Sábado',
    isHoje: false,
    isProximoCulto: true,
    isPassado: false,
    escalas: [
      {
        id: '1',
        data: '2026-09-05',
        dia_semana: 'Sábado',
        departamento: 'Diaconato',
        oficiais: ['Carlos Silva'],
        horario: '08:30',
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscalaCultoCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EscalaCultoCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('group', mockGroup);
    fixture.detectChanges();
  });

  it('deve exibir o cabeçalho do culto com badge de Próximo Culto', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Sábado');
    expect(element.textContent).toContain('05 de Setembro de 2026');
    expect(element.textContent).toContain('Próximo Culto');
  });

  it('deve exibir badge de Hoje quando isHoje for true', () => {
    fixture.componentRef.setInput('group', {
      ...mockGroup,
      isHoje: true,
      isProximoCulto: false,
    });
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Hoje');
  });

  it('deve disparar cópia de texto ao clicar no botão de compartilhar', async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextSpy },
    });

    const shareButton = fixture.nativeElement.querySelector('button[aria-label="Compartilhar escala do culto"]');
    shareButton.click();

    expect(writeTextSpy).toHaveBeenCalled();
  });
});
