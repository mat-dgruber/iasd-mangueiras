import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EscalasPage } from './escalas.page';
import { ContentService } from '../../core/services/content.service';
import { SeoService } from '../../core/seo/seo.service';
import { signal } from '@angular/core';
import { EscalaItem } from '../../core/models/content.models';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('EscalasPage', () => {
  let component: EscalasPage;
  let fixture: ComponentFixture<EscalasPage>;

  const mockEscalas: EscalaItem[] = [
    {
      id: '1',
      data: '2099-09-05',
      dia_semana: 'Sábado',
      departamento: 'Sonorização & Transmissão',
      oficiais: ['Matheus Diniz'],
      horario: '08:45',
    },
    {
      id: '2',
      data: '2099-09-05',
      dia_semana: 'Sábado',
      departamento: 'Diaconato',
      oficiais: ['Carlos Silva'],
      horario: '08:30',
    },
    {
      id: '3',
      data: '2099-09-12',
      dia_semana: 'Sábado',
      departamento: 'Recepção',
      oficiais: ['Ana Lima'],
      horario: '08:45',
    },
  ];

  const mockContentService = {
    escalas: signal<readonly EscalaItem[]>(mockEscalas),
  };

  const mockSeoService = {
    apply: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscalasPage],
      providers: [
        { provide: ContentService, useValue: mockContentService },
        { provide: SeoService, useValue: mockSeoService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EscalasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve inicializar e configurar metadados de SEO', () => {
    expect(mockSeoService.apply).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Escalas & Voluntários — IASD Mangueiras',
        path: '/escalas',
      }),
    );
  });

  it('deve renderizar a lista de cultos agrupados', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Escalas & Voluntários');
    expect(element.textContent).toContain('Matheus Diniz');
    expect(element.textContent).toContain('Carlos Silva');
    expect(element.textContent).toContain('Ana Lima');
  });

  it('deve filtrar escalas quando o usuário digita no campo de busca', () => {
    component.searchTerm.set('Carlos');
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Carlos Silva');
    expect(element.textContent).not.toContain('Ana Lima');
    expect(element.textContent).not.toContain('Matheus Diniz');
  });

  it('deve filtrar escalas por chip de departamento', () => {
    component.selectedDepartment.set('Recepção');
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Ana Lima');
    expect(element.textContent).not.toContain('Carlos Silva');
    expect(element.textContent).not.toContain('Matheus Diniz');
  });

  it('deve exibir empty state quando nenhum resultado for encontrado', () => {
    component.searchTerm.set('NomeInexistenteXYZ');
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Nenhuma escala encontrada');
  });
});
