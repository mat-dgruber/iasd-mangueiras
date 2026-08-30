import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { SeoService } from '../../core/seo/seo.service';
import { EventosPage } from './eventos.page';

const eventos = [
  {
    id: 'familia',
    titulo: 'Semana de Oração da Família',
    data: '15 a 22 de Março',
    horario: '19:30',
    descricao: 'Encontros especiais de oração para fortalecer os lares.',
    href: '/contato',
    destaque: true,
    departamento: 'Família',
    link_inscricao: 'https://example.com/inscricao',
    data_inicio: '2099-03-15',
    data_fim: '2099-03-22',
    endereco: 'Rua Alcântara, 301 - Mangueiras, Belo Horizonte - MG',
    whatsapp_contato: '5531999999999',
  },
  {
    id: 'jovens',
    titulo: 'Culto Jovem Especial de Louvor',
    data: 'Último Sábado do Mês',
    horario: '17:00',
    descricao: 'Uma tarde de música e testemunhos com a juventude.',
    departamento: 'Jovens',
    // Sem link_inscricao nem href para exibir 'Falar com a igreja'
  },
  {
    id: 'encerrado',
    titulo: 'Mutirão da Solidariedade',
    data: '10 de Janeiro',
    horario: '09:00',
    descricao: 'Ação comunitária já encerrada.',
    departamento: 'ASA',
    status: 'encerrado' as const,
    data_inicio: '2020-01-10',
  },
];

const comunicados = [
  {
    id: 'aviso',
    titulo: 'Reunião administrativa',
    mensagem: 'Encontro após o culto.',
    data: 'Hoje',
    ativo: true,
    tipo: 'aviso_geral' as const,
  },
];

describe('EventosPage', () => {
  let fixture: ComponentFixture<EventosPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventosPage],
      providers: [
        provideRouter([]),
        { provide: ContentService, useValue: { eventos: () => eventos, comunicados: () => comunicados } },
        { provide: SeoService, useValue: { apply: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventosPage);
    fixture.detectChanges();
  });

  it('exibe título e seções de eventos e comunicados', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Eventos e Programações');
    expect(text).toContain('Próximos');
    expect(text).toContain('Comunicados');
  });

  it('renderiza hero quando há evento em destaque', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Evento em destaque');
    expect(text).toContain('Semana de Oração da Família');
  });

  it('filtra eventos por departamento e termo de busca', () => {
    const component = fixture.componentInstance;

    component.departmentFilter.set('Família');
    component.searchTerm.set('oração');
    fixture.detectChanges();

    expect(component.filteredEventos().map((evento) => evento.titulo)).toEqual([
      'Semana de Oração da Família',
    ]);
  });

  it('mostra estado vazio quando filtros removem todos os resultados', () => {
    fixture.componentInstance.searchTerm.set('evento inexistente');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nenhum evento encontrado');
  });

  it('exibe CTAs conforme inscrição e data estruturada', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Inscrever-se');
    expect(text).toContain('Adicionar à agenda');
    expect(text).toContain('Compartilhar');
    expect(text).toContain('Falar com a igreja');
  });
});
