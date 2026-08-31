import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EscalaMinisterioRowComponent } from './escala-ministerio-row.component';
import { EscalaItem } from '../../../core/models/content.models';
import { describe, it, expect, beforeEach } from 'vitest';

describe('EscalaMinisterioRowComponent', () => {
  let component: EscalaMinisterioRowComponent;
  let fixture: ComponentFixture<EscalaMinisterioRowComponent>;

  const mockEscala: EscalaItem = {
    id: '1',
    data: '2026-09-05',
    dia_semana: 'Sábado',
    departamento: 'Sonorização & Transmissão',
    oficiais: ['Matheus Diniz', 'Lucas Oliveira'],
    horario: '08:45',
    observacoes: 'Operar mesa digital',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscalaMinisterioRowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EscalaMinisterioRowComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('escala', mockEscala);
    fixture.detectChanges();
  });

  it('deve renderizar o nome do departamento e o horário', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Sonorização & Transmissão');
    expect(element.textContent).toContain('08:45');
    expect(element.textContent).toContain('Matheus Diniz');
    expect(element.textContent).toContain('Lucas Oliveira');
  });

  it('deve realçar o oficial quando corresponder ao termo de busca', () => {
    fixture.componentRef.setInput('highlightName', 'Matheus');
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    const highlighted = element.querySelector('.highlight-oficial');
    expect(highlighted?.textContent).toContain('Matheus Diniz');
  });
});
