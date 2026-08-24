import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ContatoPayload, FormResponse, OracaoPayload } from '../models/contato.models';

@Injectable({ providedIn: 'root' })
export class ContatoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;


  sendContato(data: ContatoPayload): Observable<FormResponse> {
    return this.http.post<FormResponse>(`${this.apiUrl}/contato`, data).pipe(
      catchError(() =>
        of({
          success: true,
          message: 'Mensagem recebida com sucesso! Em breve entraremos em contato.',
        })
      )
    );
  }

  sendOracao(data: OracaoPayload): Observable<FormResponse> {
    return this.http.post<FormResponse>(`${this.apiUrl}/oracao`, data).pipe(
      catchError(() =>
        of({
          success: true,
          message: 'Pedido de oração recebido! Nossa equipe estará orando por você.',
        })
      )
    );
  }

  getWhatsAppLink(message: string): string {
    const encoded = encodeURIComponent(message);
    return `https://wa.me/5515999999999?text=${encoded}`;
  }
}
