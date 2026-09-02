import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { AdminCronogramaService } from './admin-cronograma.service';
import { FirebaseService } from '../firebase/firebase.service';

describe('AdminCronogramaService', () => {
  let service: AdminCronogramaService;
  let mockFirebaseService: Partial<FirebaseService>;

  beforeEach(() => {
    mockFirebaseService = {
      firestore: null as any,
    };

    TestBed.configureTestingModule({
      providers: [
        AdminCronogramaService,
        { provide: FirebaseService, useValue: mockFirebaseService },
      ],
    });

    service = TestBed.inject(AdminCronogramaService);
  });

  it('inicializa com sinais reativos e templates nativos', () => {
    expect(service.cronogramas()).toEqual([]);
    expect(service.cronogramaSelecionado()).toBeNull();
    expect(service.templates().length).toBeGreaterThanOrEqual(6);
    expect(service.carregando()).toBe(false);
  });

  it('retorna listas vazias quando firestore está indisponível', async () => {
    await service.carregarCronogramas();
    await service.carregarTemplatesCustomizados();

    expect(service.cronogramas()).toEqual([]);
    expect(service.templatesCustomizados()).toEqual([]);
  });

  it('cria novo cronograma a partir de um template', () => {
    const template = service.templates()[0];
    const novo = service.criarNovoCronogramaDeTemplate(template, '2026-09-05');

    expect(novo.data).toBe('2026-09-05');
    expect(novo.titulo).toBe(template.nome);
    expect(novo.tipoCulto).toBe(template.tipoCulto);
    expect(novo.itens.length).toBe(template.itens.length);
    expect(novo.itens[0].id).toBeTruthy();
  });

  it('permite selecionar e desselecionar cronograma', () => {
    const template = service.templates()[0];
    const novo = service.criarNovoCronogramaDeTemplate(template, '2026-09-05');

    service.selecionarCronograma(novo);
    expect(service.cronogramaSelecionado()).toEqual(novo);

    service.selecionarCronograma(null);
    expect(service.cronogramaSelecionado()).toBeNull();
  });

  it('lança erro ao tentar operações com firestore indisponível', async () => {
    await expect(service.salvarCronograma({ titulo: 'Culto' })).rejects.toThrow(
      'Firestore indisponível',
    );
    await expect(service.excluirCronograma('id-123')).rejects.toThrow('Firestore indisponível');
    await expect(
      service.salvarTemplateCustomizado({
        nome: 'Template',
        tipoCulto: 'personalizado',
        itens: [],
        criadoEm: '',
        isNativo: false,
      }),
    ).rejects.toThrow('Firestore indisponível');
    await expect(service.excluirTemplateCustomizado('id-123')).rejects.toThrow(
      'Firestore indisponível',
    );
  });
});
