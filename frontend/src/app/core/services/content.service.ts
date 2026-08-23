import { Injectable } from '@angular/core';
import horarios from '../../../content/horarios.json';
import eventos from '../../../content/eventos.json';
import comunicados from '../../../content/comunicados.json';
import ministerios from '../../../content/ministerios.json';
import { Comunicado, Evento, Horario, Ministerio } from '../models/content.models';

@Injectable({ providedIn: 'root' })
export class ContentService {
  horarios(): readonly Horario[] {
    return horarios as readonly Horario[];
  }

  eventos(): readonly Evento[] {
    return eventos as readonly Evento[];
  }

  comunicados(): readonly Comunicado[] {
    return comunicados as readonly Comunicado[];
  }

  ministerios(): readonly Ministerio[] {
    return ministerios as readonly Ministerio[];
  }
}
