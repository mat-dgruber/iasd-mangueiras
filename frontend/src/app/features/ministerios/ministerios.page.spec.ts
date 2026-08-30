import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MinisteriosPage } from './ministerios.page';
import { ContentService } from '../../core/services/content.service';
import { Ministerio } from '../../core/models/content.models';

const baseMinisterios: Ministerio[] = [
  {
    nome: 'Recepção e Acolhimento',
    categoria: 'Comunicação & Acolhimento',
    descricao: 'Acolhimento caloroso de membros e visitantes.',
    destaque: true,
  },
  {
    nome: 'Ministério da Criança & Adolescentes',
    categoria: 'Novas Gerações & Família',
    descricao: 'Espaço educativo para ensinar valores cristãos.',
    destaque: true,
  },
  {
    nome: 'Clube de Desbravadores & Aventureiros',
    categoria: 'Novas Gerações & Família',
    descricao: 'Desenvolvimento integral de crianças e adolescentes.',
    destaque: true,
  },
  {
    nome: 'Música e Louvor',
    categoria: 'Louvor & Adoração',
    descricao: 'Ministério de louvor e adoração nos cultos.',
    destaque: false,
  },
  {
    nome: 'Ação Solidária Adventista (ASA)',
    categoria: 'Ação Social & Comunidade',
    descricao: 'Assistência a famílias em situação de vulnerabilidade.',
    destaque: true,
  },
];

function createMockContentService(ministerios: Ministerio[] = baseMinisterios) {
  return {
    ministerios: signal<Ministerio[]>(ministerios),
    loading: signal<boolean>(false),
  };
}

describe('MinisteriosPage', () => {
  let fixture: ComponentFixture<MinisteriosPage>;
  let component: MinisteriosPage;

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [MinisteriosPage],
      providers: [
        provideRouter([]),
        { provide: ContentService, useValue: createMockContentService(baseMinisterios) },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(MinisteriosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    vi.advanceTimersByTime(300);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('exibe título principal e área de envolvimento', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Ministérios da Igreja');
    expect(text).toContain('Deseja servir ou conhecer mais sobre um ministério?');
  });

  it('renderiza os ministérios ativos', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Recepção e Acolhimento');
    expect(text).toContain('Ministério da Criança');
    expect(text).toContain('Clube de Desbravadores & Aventureiros');
  });

  it('filtra ministérios por categoria', () => {
    component.setCategory('Louvor & Adoração');
    fixture.detectChanges();

    const filtered = component.filteredMinisterios();
    expect(filtered.length).toBe(1);
    expect(filtered[0].nome).toBe('Música e Louvor');
  });

  it('filtra ministérios por termo de busca', () => {
    component.onSearchInput({ target: { value: 'solidária' } } as unknown as Event);
    fixture.detectChanges();

    const filtered = component.filteredMinisterios();
    expect(filtered.length).toBe(1);
    expect(filtered[0].nome).toContain('Ação Solidária Adventista');
  });

  it('exibe mensagem amigável quando nenhum ministério é encontrado', () => {
    component.onSearchInput({ target: { value: 'termo-inexistente-xyz' } } as unknown as Event);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Nenhum ministério encontrado');

    component.resetFilters();
    fixture.detectChanges();
    expect(component.filteredMinisterios().length).toBeGreaterThan(0);
  });

  it('exibe categorias dinâmicas derivadas dos dados', () => {
    const cats = component.categories();
    expect(cats.length).toBeGreaterThan(1);
    expect(cats[0]).toBe('Todos');
    expect(cats).toContain('Louvor & Adoração');
    expect(cats).toContain('Novas Gerações & Família');
  });

  it('filtra ministérios inativos (ativo: false)', async () => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
    const dataWithInactive: Ministerio[] = [
      ...baseMinisterios,
      {
        nome: 'Ministério Inativo',
        categoria: 'Teste',
        descricao: 'Este ministério está inativo.',
        ativo: false,
      },
    ];
    await TestBed.configureTestingModule({
      imports: [MinisteriosPage],
      providers: [
        provideRouter([]),
        { provide: ContentService, useValue: createMockContentService(dataWithInactive) },
      ],
    }).compileComponents();
    vi.useFakeTimers();
    fixture = TestBed.createComponent(MinisteriosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    vi.advanceTimersByTime(300);
    fixture.detectChanges();

    const filtered = component.filteredMinisterios();
    expect(filtered.every(m => m.ativo !== false)).toBe(true);
    expect(filtered.find(m => m.nome === 'Ministério Inativo')).toBeUndefined();
  });
});
