import { describe, it, expect } from 'vitest';
import { CronogramaItem, CronogramaCulto } from '../models/cronograma.models';
import {
  reordenarItens,
  calcularHorariosEmSequencia,
  formatarCronogramaParaWhatsApp,
} from './cronograma.utils';

describe('cronograma.utils', () => {
  const itensMock: CronogramaItem[] = [
    { id: '1', ordem: 0, horario: '09:00', duracaoMinutos: 15, nomeQuadro: 'Louvor', responsavel: 'Banda' },
    { id: '2', ordem: 1, horario: '09:15', duracaoMinutos: 10, nomeQuadro: 'Abertura', responsavel: 'Dirigente' },
    { id: '3', ordem: 2, horario: '09:25', duracaoMinutos: 30, nomeQuadro: 'Mensagem', responsavel: 'Pastor' },
  ];

  describe('reordenarItens', () => {
    it('move item para cima e atualiza ordens', () => {
      const resultado = reordenarItens(itensMock, 1, 'up');
      expect(resultado[0].id).toBe('2');
      expect(resultado[0].ordem).toBe(0);
      expect(resultado[1].id).toBe('1');
      expect(resultado[1].ordem).toBe(1);
    });

    it('move item para baixo e atualiza ordens', () => {
      const resultado = reordenarItens(itensMock, 1, 'down');
      expect(resultado[1].id).toBe('3');
      expect(resultado[1].ordem).toBe(1);
      expect(resultado[2].id).toBe('2');
      expect(resultado[2].ordem).toBe(2);
    });

    it('não move primeiro item para cima', () => {
      const resultado = reordenarItens(itensMock, 0, 'up');
      expect(resultado[0].id).toBe('1');
    });

    it('não move último item para baixo', () => {
      const resultado = reordenarItens(itensMock, 2, 'down');
      expect(resultado[2].id).toBe('3');
    });
  });

  describe('calcularHorariosEmSequencia', () => {
    it('calcula horários em cascata baseado na duração de cada quadro', () => {
      const resultado = calcularHorariosEmSequencia('09:00', itensMock);
      expect(resultado[0].horario).toBe('09:00');
      expect(resultado[1].horario).toBe('09:15');
      expect(resultado[2].horario).toBe('09:25');
    });

    it('mantém horário original se duração não for informada', () => {
      const semDuracao: CronogramaItem[] = [
        { id: '1', ordem: 0, horario: '10:00', nomeQuadro: 'Item 1', responsavel: 'Resp' },
        { id: '2', ordem: 1, horario: '10:20', nomeQuadro: 'Item 2', responsavel: 'Resp' },
      ];
      const resultado = calcularHorariosEmSequencia('10:00', semDuracao);
      expect(resultado[0].horario).toBe('10:00');
      expect(resultado[1].horario).toBe('10:20');
    });
  });

  describe('formatarCronogramaParaWhatsApp', () => {
    it('gera string formatada com emojis e detalhes do culto', () => {
      const cronograma: CronogramaCulto = {
        id: 'c1',
        data: '2026-09-05',
        titulo: 'Culto Divino',
        tipoCulto: 'sabado_manha',
        itens: itensMock,
        criadoEm: '2026-09-01T00:00:00.000Z',
        atualizadoEm: '2026-09-01T00:00:00.000Z',
      };

      const texto = formatarCronogramaParaWhatsApp(cronograma);
      expect(texto).toContain('CRONOGRAMA DO CULTO — IASD MANGUEIRAS');
      expect(texto).toContain('Culto Divino');
      expect(texto).toContain('09:00');
      expect(texto).toContain('Louvor');
      expect(texto).toContain('Banda');
    });
  });
});
