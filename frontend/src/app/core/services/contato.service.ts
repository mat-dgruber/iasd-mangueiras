import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContatoPayload, FormResponse, OracaoPayload } from '../models/contato.models';
import { SITE_CONFIG } from '../site/site.config';

@Injectable({ providedIn: 'root' })
export class ContatoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  sendContato(data: ContatoPayload): Observable<FormResponse> {
    return this.http.post<FormResponse>(`${this.apiUrl}/contato`, data);
  }

  sendOracao(data: OracaoPayload): Observable<FormResponse> {
    return this.http.post<FormResponse>(`${this.apiUrl}/oracao`, data);
  }

  getWhatsAppLink(message: string): string {
    const encoded = encodeURIComponent(message);
    const phone = SITE_CONFIG.contact?.phoneClean || '5515997864835';
    return `https://wa.me/${phone}?text=${encoded}`;
  }
}
