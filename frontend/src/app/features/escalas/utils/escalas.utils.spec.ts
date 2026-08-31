import { describe, it, expect, vi } from 'vitest';
import { EscalaItem } from '../../../core/models/content.models';
import {
  groupEscalasByCulto,
  generateGoogleCalendarUrl,
  generateIcsBlob,
  downloadIcsFile,
  generateWhatsAppTrocaUrl,
  formatEscalaShareText,
  filterEscalas,
  normalizeText,
  formatDateBr,
} from './escalas.utils';

describe('escalas.utils', () => {
  const mockEscalas: EscalaItem[] = [
    {
      id: '1',
      data: '2026-09-05',
      dia_semana: 'Sábado',
      departamento: 'Sonorização & Transmissão',
      oficiais: ['Matheus Diniz', 'Lucas Oliveira'],
      horario: '08:45',
      observacoes: 'Ensaio geral',
    },
    {
      id: '2',
      data: '2026-09-05',
      dia_semana: 'Sábado',
      departamento: 'Diaconato',
      oficiais: ['João Santos'],
      horario: '08:30',
    },
    {
      id: '3',
      data: '2026-09-12',
      dia_semana: 'Sábado',
      departamento: 'Recepção',
      oficiais: ['Ana Lima'],
      horario: '08:45',
    },
    {
      id: '4',
      data: '2026-08-20',
      dia_semana: 'Quarta',
      departamento: 'Música & Louvor',
      oficiais: ['Paulo Silva'],
      horario: '19:30',
    },
  ];

  const refDate = new Date('2026-09-01T12:00:00Z');

  describe('normalizeText', () => {
    it('deve remover acentos e converter para minúsculas', () => {
      expect(normalizeText('João São Paulo')).toBe('joao sao paulo');
      expect(normalizeText('MÚSICA & LOUVOR')).toBe('musica & louvor');
    });
  });

  describe('formatDateBr', () => {
    it('deve formatar data no padrão pt-BR', () => {
      const res = formatDateBr('2026-09-05');
      expect(res).toContain('05');
      expect(res.toLowerCase()).toContain('setembro');
      expect(res).toContain('2026');
    });

    it('deve tratar entradas inválidas ou vazias', () => {
      expect(formatDateBr('')).toBe('');
      expect(formatDateBr('data-invalida')).toBe('data-invalida');
    });
  });

  describe('filterEscalas', () => {
    it('deve filtrar por termo de busca em oficiais ou departamento', () => {
      const res = filterEscalas(mockEscalas, 'matheus', 'todos');
      expect(res.length).toBe(1);
      expect(res[0].departamento).toBe('Sonorização & Transmissão');
    });

    it('deve filtrar por departamento específico', () => {
      const res = filterEscalas(mockEscalas, '', 'Diaconato');
      expect(res.length).toBe(1);
      expect(res[0].id).toBe('2');
    });

    it('deve retornar todas quando filtros forem vazios', () => {
      const res = filterEscalas(mockEscalas, '', 'todos');
      expect(res.length).toBe(4);
    });

    it('deve buscar em observações', () => {
      const res = filterEscalas(mockEscalas, 'ensaio', 'todos');
      expect(res.length).toBe(1);
      expect(res[0].id).toBe('1');
    });
  });

  describe('groupEscalasByCulto', () => {
    it('deve agrupar escalas por data e ordenar cronologicamente', () => {
      const groups = groupEscalasByCulto(mockEscalas, refDate);
      expect(groups.length).toBe(3); // 2026-08-20, 2026-09-05, 2026-09-12

      const sept05 = groups.find((g) => g.data === '2026-09-05');
      expect(sept05).toBeDefined();
      expect(sept05?.escalas.length).toBe(2);
      expect(sept05?.isProximoCulto).toBe(true);
      expect(sept05?.isPassado).toBe(false);

      const aug20 = groups.find((g) => g.data === '2026-08-20');
      expect(aug20?.isPassado).toBe(true);
    });

    it('deve identificar culto de hoje quando data coincidir', () => {
      const todayRef = new Date('2026-09-05T10:00:00Z');
      const groups = groupEscalasByCulto(mockEscalas, todayRef);
      const sept05 = groups.find((g) => g.data === '2026-09-05');
      expect(sept05?.isHoje).toBe(true);
    });
  });

  describe('generateGoogleCalendarUrl', () => {
    it('deve gerar URL do Google Calendar com parâmetros corretos', () => {
      const url = generateGoogleCalendarUrl(mockEscalas[0]);
      expect(url).toContain('https://calendar.google.com/calendar/render?action=TEMPLATE');
      expect(url).toContain('text=Escala%3A+Sonoriza%C3%A7%C3%A3o');
      expect(url).toContain('details=');
    });

    it('deve usar horário padrão quando horario não for fornecido', () => {
      const semHorario: EscalaItem = {
        id: '5',
        data: '2026-09-19',
        dia_semana: 'Sábado',
        departamento: 'Recepção',
        oficiais: ['Carla'],
      };
      const url = generateGoogleCalendarUrl(semHorario);
      expect(url).toContain('https://calendar.google.com/calendar/render?action=TEMPLATE');
    });
  });

  describe('generateIcsBlob', () => {
    it('deve gerar um Blob com formato VCALENDAR válido', async () => {
      const blob = generateIcsBlob(mockEscalas[0]);
      expect(blob).toBeInstanceOf(Blob);
      const text = await blob.text();
      expect(text).toContain('BEGIN:VCALENDAR');
      expect(text).toContain('SUMMARY:Escala: Sonorização & Transmissão');
      expect(text).toContain('END:VCALENDAR');
    });
  });

  describe('downloadIcsFile', () => {
    it('deve criar link temporário e disparar download', () => {
      const blob = new Blob(['test'], { type: 'text/calendar' });
      const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
      const revokeObjectURLMock = vi.fn();
      globalThis.URL.createObjectURL = createObjectURLMock;
      globalThis.URL.revokeObjectURL = revokeObjectURLMock;

      const clickMock = vi.fn();
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
        set href(val: string) {},
        set download(val: string) {},
        click: clickMock,
      } as unknown as HTMLAnchorElement);

      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

      downloadIcsFile(blob, 'escala.ics');

      expect(createObjectURLMock).toHaveBeenCalledWith(blob);
      expect(clickMock).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });

  describe('generateWhatsAppTrocaUrl', () => {
    it('deve gerar link do WhatsApp com mensagem pré-formatada', () => {
      const url = generateWhatsAppTrocaUrl(mockEscalas[0], 'Matheus Diniz');
      expect(url).toContain('https://wa.me/?text=');
      expect(url).toContain('Matheus');
      expect(url).toContain('Sonoriza%C3%A7%C3%A3o');
    });

    it('deve gerar link mesmo sem nome de oficial especificado', () => {
      const url = generateWhatsAppTrocaUrl(mockEscalas[0]);
      expect(url).toContain('https://wa.me/?text=');
      expect(url).toContain('Estou');
    });
  });

  describe('formatEscalaShareText', () => {
    it('deve formatar texto legível para compartilhamento em grupos', () => {
      const groups = groupEscalasByCulto(mockEscalas, refDate);
      const sept05 = groups.find((g) => g.data === '2026-09-05')!;
      const text = formatEscalaShareText(sept05);

      expect(text).toContain('📋 *ESCALA DO CULTO');
      expect(text).toContain('Sonorização & Transmissão');
      expect(text).toContain('Diaconato');
      expect(text).toContain('Matheus Diniz');
    });
  });
});
