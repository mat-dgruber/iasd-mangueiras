import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import defaultHorarios from '../../../content/horarios.json';
import defaultEventos from '../../../content/eventos.json';
import defaultComunicados from '../../../content/comunicados.json';
import defaultMinisterios from '../../../content/ministerios.json';
import defaultPgs from '../../../content/pgs.json';
import defaultEscalas from '../../../content/escalas.json';
import {
  AvisoHorarioEspecial,
  Comunicado,
  EscalaItem,
  Evento,
  Horario,
  Ministerio,
  PequenoGrupo,
} from '../models/content.models';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly firebase = inject(FirebaseService);

  private readonly _horarios = signal<readonly Horario[]>(defaultHorarios as readonly Horario[]);
  private readonly _avisosHorarios = signal<readonly AvisoHorarioEspecial[]>([]);
  private readonly _eventos = signal<readonly Evento[]>(defaultEventos as readonly Evento[]);
  private readonly _comunicados = signal<readonly Comunicado[]>(
    defaultComunicados as readonly Comunicado[],
  );
  private readonly _ministerios = signal<readonly Ministerio[]>(
    defaultMinisterios as readonly Ministerio[],
  );
  private readonly _pgs = signal<readonly PequenoGrupo[]>(defaultPgs as readonly PequenoGrupo[]);
  private readonly _escalas = signal<readonly EscalaItem[]>(defaultEscalas as readonly EscalaItem[]);

  constructor() {
    if (isPlatformBrowser(this.platformId) && this.firebase.firestore) {
      try {
        // Listener de Horários Regulares em Tempo Real
        const horariosCol = collection(this.firebase.firestore, 'horarios_regulares');
        const qHorarios = query(horariosCol, orderBy('ordem', 'asc'));
        onSnapshot(
          qHorarios,
          (snap) => {
            if (!snap.empty) {
              const list = snap.docs.map(
                (doc) => ({ id: doc.id, ...doc.data() }) as unknown as Horario,
              );
              const active = list.filter((h) => h.ativo !== false);
              this._horarios.set(active.length > 0 ? active : (defaultHorarios as readonly Horario[]));
            } else {
              this._horarios.set(defaultHorarios as readonly Horario[]);
            }
          },
          () => {},
        );

        // Listener de Avisos de Horários Especiais em Tempo Real
        const avisosCol = collection(this.firebase.firestore, 'avisos_horarios');
        onSnapshot(
          avisosCol,
          (snap) => {
            if (!snap.empty) {
              const today = new Date().toISOString().split('T')[0];
              const list = snap.docs.map(
                (doc) => ({ id: doc.id, ...doc.data() }) as unknown as AvisoHorarioEspecial,
              );
              this._avisosHorarios.set(
                list.filter((a) => a.ativo !== false && (!a.expira_em || a.expira_em >= today)),
              );
            } else {
              this._avisosHorarios.set([]);
            }
          },
          () => {},
        );

        // Listener de Eventos em Tempo Real
        const eventosCol = collection(this.firebase.firestore, 'eventos');
        const qEventos = query(eventosCol, orderBy('data', 'asc'));
        onSnapshot(
          qEventos,
          (snap) => {
            if (!snap.empty) {
              const list = snap.docs.map(
                (doc) => ({ id: doc.id, ...doc.data() }) as unknown as Evento,
              );
              this._eventos.set(list);
            }
          },
          () => {},
        );

        // Listener de Comunicados em Tempo Real
        const comunicadosCol = collection(this.firebase.firestore, 'comunicados');
        onSnapshot(
          comunicadosCol,
          (snap) => {
            if (!snap.empty) {
              const list = snap.docs.map(
                (doc) => ({ id: doc.id, ...doc.data() }) as unknown as Comunicado,
              );
              this._comunicados.set(list.filter((c) => c.ativo !== false));
            }
          },
          () => {},
        );

        // Listener de Pequenos Grupos em Tempo Real
        const pgsCol = collection(this.firebase.firestore, 'pequenos_grupos');
        onSnapshot(
          pgsCol,
          (snap) => {
            if (!snap.empty) {
              const list = snap.docs.map(
                (doc) => ({ id: doc.id, ...doc.data() }) as unknown as PequenoGrupo,
              );
              this._pgs.set(list.filter((p) => p.ativo !== false));
            }
          },
          () => {},
        );

        // Listener de Escalas dos Departamentos em Tempo Real
        const escalasCol = collection(this.firebase.firestore, 'escalas');
        onSnapshot(
          escalasCol,
          (snap) => {
            if (!snap.empty) {
              const list = snap.docs.map(
                (doc) => ({ id: doc.id, ...doc.data() }) as unknown as EscalaItem,
              );
              this._escalas.set(list);
            }
          },
          () => {},
        );

        // Listener de Ministérios em Tempo Real
        const ministeriosCol = collection(this.firebase.firestore, 'ministerios');
        onSnapshot(
          ministeriosCol,
          (snap) => {
            if (!snap.empty) {
              const list = snap.docs.map(
                (doc) => ({ id: doc.id, ...doc.data() }) as unknown as Ministerio,
              );
              this._ministerios.set(list);
            }
          },
          () => {},
        );
      } catch {
        // Silencioso se offline ou regras em modo rascunho
      }
    }
  }

  horarios(): readonly Horario[] {
    return this._horarios();
  }

  avisosHorarios(): readonly AvisoHorarioEspecial[] {
    return this._avisosHorarios();
  }

  eventos(): readonly Evento[] {
    return this._eventos();
  }

  comunicados(): readonly Comunicado[] {
    return this._comunicados();
  }

  ministerios(): readonly Ministerio[] {
    return this._ministerios();
  }

  pgs(): readonly PequenoGrupo[] {
    return this._pgs();
  }

  escalas(): readonly EscalaItem[] {
    return this._escalas();
  }
}
