import { describe, it, expect } from 'vitest';
import { EscalaItem, CultoEscalaGroup } from './content.models';

describe('content.models - Escala e CultoEscalaGroup', () => {
  it('deve validar a estrutura de CultoEscalaGroup', () => {
    const mockEscala: EscalaItem = {
      id: 'esc-1',
      data: '2026-09-05',
      dia_semana: 'Sábado',
      departamento: 'Sonorização & Transmissão',
      oficiais: ['Matheus Diniz', 'Lucas Oliveira'],
      horario: '08:45',
      observacoes: 'Chegar 15 min antes',
    };

    const group: CultoEscalaGroup = {
      data: '2026-09-05',
      dataFormatada: '05 de Setembro de 2026',
      diaSemana: 'Sábado',
      isHoje: false,
      isProximoCulto: true,
      isPassado: false,
      escalas: [mockEscala],
    };

    expect(group.data).toBe('2026-09-05');
    expect(group.escalas.length).toBe(1);
    expect(group.escalas[0].departamento).toBe('Sonorização & Transmissão');
  });
});
