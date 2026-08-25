import { TestBed } from '@angular/core/testing';
import { ContentService } from './content.service';
import { FirebaseService } from '../firebase/firebase.service';
import { AvisoHorarioEspecial } from '../models/content.models';

describe('ContentService', () => {
  let service: ContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContentService, FirebaseService],
    });
    service = TestBed.inject(ContentService);
  });

  it('carrega horários institucionais iniciais do JSON padrão', () => {
    const horarios = service.horarios();
    expect(horarios.length).toBeGreaterThan(0);
    expect(horarios[0].titulo).toBeTruthy();
    expect(horarios[0].dia).toBeTruthy();
    expect(horarios[0].horario).toBeTruthy();
    expect(horarios[0].descricao).toBeTruthy();
  });

  it('mantém fallback de horários padrão quando Firestore não tem dados', () => {
    const horarios = service.horarios();
    expect(horarios.some((h) => h.titulo.includes('Escola Sabatina'))).toBe(true);
    expect(horarios.some((h) => h.titulo.includes('Culto Divino'))).toBe(true);
  });

  it('inicializa com array vazio de avisos de horários especiais', () => {
    expect(service.avisosHorarios()).toEqual([]);
  });

  it('filtra corretamente avisos expirados ou inativos', () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const mockAvisos: AvisoHorarioEspecial[] = [
      { id: '1', titulo: 'Aviso Ativo e Válido', mensagem: 'Hoje', ativo: true, expira_em: tomorrow },
      { id: '2', titulo: 'Aviso Expirado', mensagem: 'Ontem', ativo: true, expira_em: yesterday },
      { id: '3', titulo: 'Aviso Desativado', mensagem: 'Desativado', ativo: false, expira_em: tomorrow },
      { id: '4', titulo: 'Aviso Sem Data de Expiração', mensagem: 'Sem data', ativo: true },
    ];

    const filtered = mockAvisos.filter(
      (a) => a.ativo !== false && (!a.expira_em || a.expira_em >= today),
    );

    expect(filtered.length).toBe(2);
    expect(filtered.map((a) => a.id)).toEqual(['1', '4']);
  });
});

