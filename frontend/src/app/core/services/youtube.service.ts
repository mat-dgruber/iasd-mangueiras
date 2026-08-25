import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  VideoCategory,
  VideoItem,
  YouTubeLatestResponse,
  YouTubeLiveResponse,
} from '../models/youtube.models';

export const DEFAULT_VIDEOS: readonly VideoItem[] = [
  // Cultos de Domingo (Mais recente primeiro)
  {
    id: 'Gk7BusYGpVg',
    title: 'A Imortalidade da Alma — Ademir Mendes | Culto de Domingo',
    description: 'Culto evangelístico e estudo das verdades bíblicas na IASD Mangueiras.',
    thumbnail_url: 'https://i.ytimg.com/vi/Gk7BusYGpVg/hqdefault.jpg',
    published_at: '2026-08-23T19:30:00Z',
    video_url: 'https://www.youtube.com/watch?v=Gk7BusYGpVg',
  },
  // Cultos de Sábado
  {
    id: 'QpQF6hCmAw8',
    title: 'Saudade! - Parte 1 | Culto de Sábado',
    description: 'Culto de adoração e mensagem bíblica na IASD Mangueiras em Tatuí-SP.',
    thumbnail_url: 'https://i.ytimg.com/vi/QpQF6hCmAw8/hqdefault.jpg',
    published_at: '2026-08-22T10:15:00Z',
    video_url: 'https://www.youtube.com/watch?v=QpQF6hCmAw8',
  },
  // Cultos de Quarta
  {
    id: 'v5On3uvpMe0',
    title: 'Servir — Josy Monteiro Cesar | Culto de Quarta',
    description: 'Culto de oração e testemunho no meio de semana na IASD Mangueiras.',
    thumbnail_url: 'https://i.ytimg.com/vi/v5On3uvpMe0/hqdefault.jpg',
    published_at: '2026-08-19T19:30:00Z',
    video_url: 'https://www.youtube.com/watch?v=v5On3uvpMe0',
  },
  // Domingo
  {
    id: '2dX9krpFi_Q',
    title: 'O Ritual do Santuário Terrestre — Maurício Braga | Culto de Domingo',
    description: 'Estudo bíblico e mensagem para a família sobre o plano da salvação.',
    thumbnail_url: 'https://i.ytimg.com/vi/2dX9krpFi_Q/hqdefault.jpg',
    published_at: '2026-08-16T19:30:00Z',
    video_url: 'https://www.youtube.com/watch?v=2dX9krpFi_Q',
  },
  // Sábado
  {
    id: '7b7_ptk4gAY',
    title: 'Saudade! - Parte 2 | Culto de Sábado',
    description: 'Culto de adoração e reflexão espiritual na IASD Mangueiras em Tatuí-SP.',
    thumbnail_url: 'https://i.ytimg.com/vi/7b7_ptk4gAY/hqdefault.jpg',
    published_at: '2026-08-15T10:15:00Z',
    video_url: 'https://www.youtube.com/watch?v=7b7_ptk4gAY',
  },
  // Quarta
  {
    id: 'yvZpOUvFffU',
    title: 'Segurança Financeira da Família — Uilson Garcia | Culto de Quarta',
    description: 'Estudo bíblico prático sobre mordomia cristã e princípios financeiros.',
    thumbnail_url: 'https://i.ytimg.com/vi/yvZpOUvFffU/hqdefault.jpg',
    published_at: '2026-08-12T19:30:00Z',
    video_url: 'https://www.youtube.com/watch?v=yvZpOUvFffU',
  },
  // Domingo
  {
    id: '_Spz3atblk4',
    title: 'Por que Devo Ser Grato? | Culto da Família',
    description: 'Culto de domingo com louvor, gratidão e reflexão para o lar.',
    thumbnail_url: 'https://i.ytimg.com/vi/_Spz3atblk4/hqdefault.jpg',
    published_at: '2026-08-09T19:30:00Z',
    video_url: 'https://www.youtube.com/watch?v=_Spz3atblk4',
  },
  // Sábado
  {
    id: 'dxDPQIeWfAQ',
    title: 'Dilemas — Pr. Geraldo Beulke Jr. | Culto de Sábado',
    description: 'Mensagem inspiradora sobre escolhas e compromisso cristão na IASD Mangueiras.',
    thumbnail_url: 'https://i.ytimg.com/vi/dxDPQIeWfAQ/hqdefault.jpg',
    published_at: '2026-08-08T10:15:00Z',
    video_url: 'https://www.youtube.com/watch?v=dxDPQIeWfAQ',
  },
  // Quarta
  {
    id: 'AK7HEraJ2Y4',
    title: 'Elias 3.1 — José Newton | Culto de Oração',
    description: 'Mensagem bíblica inspiradora e momentos de intercessão coletiva.',
    thumbnail_url: 'https://i.ytimg.com/vi/AK7HEraJ2Y4/hqdefault.jpg',
    published_at: '2026-08-05T19:30:00Z',
    video_url: 'https://www.youtube.com/watch?v=AK7HEraJ2Y4',
  },
  // Domingo
  {
    id: 'scpV00KOxgw',
    title: 'Marcados para Cristo — Thiago Gaya | Culto de Domingo',
    description: 'Mensagem edificante sobre identidade cristã e entrega a Jesus.',
    thumbnail_url: 'https://i.ytimg.com/vi/scpV00KOxgw/hqdefault.jpg',
    published_at: '2026-08-02T19:30:00Z',
    video_url: 'https://www.youtube.com/watch?v=scpV00KOxgw',
  },
  // Sábado
  {
    id: 'c88PnTRA9QA',
    title: 'A Essência do Cristão | Culto de Adoração',
    description: 'Culto divino e mensagem edificante sobre o testemunho e caráter cristão.',
    thumbnail_url: 'https://i.ytimg.com/vi/c88PnTRA9QA/hqdefault.jpg',
    published_at: '2026-08-01T10:15:00Z',
    video_url: 'https://www.youtube.com/watch?v=c88PnTRA9QA',
  },
  // Quarta
  {
    id: 'b_56pMDeYiQ',
    title: 'Jesus, o Caminho — João Carlos Pereira | Culto de Quarta',
    description: 'Estudo das Escrituras e oração intercessória na igreja local.',
    thumbnail_url: 'https://i.ytimg.com/vi/b_56pMDeYiQ/hqdefault.jpg',
    published_at: '2026-07-29T19:30:00Z',
    video_url: 'https://www.youtube.com/watch?v=b_56pMDeYiQ',
  },
  // Domingo
  {
    id: 'qT1XpQpntxo',
    title: 'Deus Está no Controle — Eduardo Rueda | Culto de Domingo',
    description: 'Estudo sobre fé, segurança e esperança nas promessas divinas.',
    thumbnail_url: 'https://i.ytimg.com/vi/qT1XpQpntxo/hqdefault.jpg',
    published_at: '2026-07-26T19:30:00Z',
    video_url: 'https://www.youtube.com/watch?v=qT1XpQpntxo',
  },
  // Sábado
  {
    id: '7nL32K6DPhg',
    title: 'Haja Luz! | Culto de Sábado',
    description: 'Transmissão do culto de adoração com louvores e reflexão bíblica.',
    thumbnail_url: 'https://i.ytimg.com/vi/7nL32K6DPhg/hqdefault.jpg',
    published_at: '2026-07-25T10:15:00Z',
    video_url: 'https://www.youtube.com/watch?v=7nL32K6DPhg',
  },
  // Quarta
  {
    id: 'SdTUjLTJLAM',
    title: 'O Deus que Cuida — Sílvia Colasso | Culto de Quarta',
    description: 'Testemunhos de fé e mensagem sobre o cuidado de Deus no cotidiano.',
    thumbnail_url: 'https://i.ytimg.com/vi/SdTUjLTJLAM/hqdefault.jpg',
    published_at: '2026-07-22T19:30:00Z',
    video_url: 'https://www.youtube.com/watch?v=SdTUjLTJLAM',
  },
  // Domingo
  {
    id: 'O9MgNO_beCs',
    title: 'Oração: A Arma Mais Poderosa da Terra — Osni Hessel | Culto de Domingo',
    description: 'Mensagem especial sobre o poder da oração e comunhão com Deus.',
    thumbnail_url: 'https://i.ytimg.com/vi/O9MgNO_beCs/hqdefault.jpg',
    published_at: '2026-07-19T19:30:00Z',
    video_url: 'https://www.youtube.com/watch?v=O9MgNO_beCs',
  },
  // Sábado
  {
    id: 'Gvhydxi0AVE',
    title: 'Viva Seus Sonhos | Culto de Sábado',
    description: 'Mensagem especial sobre propósitos de vida e confiança em Deus.',
    thumbnail_url: 'https://i.ytimg.com/vi/Gvhydxi0AVE/hqdefault.jpg',
    published_at: '2026-07-18T10:15:00Z',
    video_url: 'https://www.youtube.com/watch?v=Gvhydxi0AVE',
  },
  // Quarta
  {
    id: '7a1R8KHAgj0',
    title: 'O Semeador e a Semente — Marcos Cavalcante | Culto de Quarta',
    description: 'Parábolas de Jesus e aplicação prática para o discipulado.',
    thumbnail_url: 'https://i.ytimg.com/vi/7a1R8KHAgj0/hqdefault.jpg',
    published_at: '2026-07-15T19:30:00Z',
    video_url: 'https://www.youtube.com/watch?v=7a1R8KHAgj0',
  },
];

export const DEFAULT_PRESENTE7_VIDEOS: readonly VideoItem[] = [
  {
    id: 'g_Xv8zP_Y1U',
    title: 'Lição 9 — Ministério Movido pelo Amor | Presente 7',
    description:
      'Estudo bíblico aprofundado e reflexão temática da série especial Presente 7 gravada na IASD Mangueiras em Tatuí-SP.',
    thumbnail_url: 'https://i.ytimg.com/vi/g_Xv8zP_Y1U/hqdefault.jpg',
    published_at: '2026-08-22T11:00:00Z',
    video_url: 'https://www.youtube.com/watch?v=g_Xv8zP_Y1U',
  },
  {
    id: 'GYHNPDQTQcY',
    title: 'Lição 8 — O Poder da Ressurreição de Cristo | Presente 7',
    description:
      'Comentários inspiradores e aplicação prática da lição da Escola Sabatina na IASD Mangueiras.',
    thumbnail_url: 'https://i.ytimg.com/vi/GYHNPDQTQcY/hqdefault.jpg',
    published_at: '2026-08-15T11:00:00Z',
    video_url: 'https://www.youtube.com/watch?v=GYHNPDQTQcY',
  },
  {
    id: 'Vscv4l3V7kA',
    title: 'Lição 7 — O Retrato do Amor | Presente 7',
    description:
      'Estudo dinâmico e edificante sobre as verdades bíblicas e a comunhão cristã.',
    thumbnail_url: 'https://i.ytimg.com/vi/Vscv4l3V7kA/hqdefault.jpg',
    published_at: '2026-08-08T11:00:00Z',
    video_url: 'https://www.youtube.com/watch?v=Vscv4l3V7kA',
  },
  {
    id: 'OQxmwqEYJkM',
    title: 'Lição 6 — Dons Espirituais | Presente 7',
    description:
      'Reflexão especial sobre dons espirituais e o propósito da igreja na vida diária.',
    thumbnail_url: 'https://i.ytimg.com/vi/OQxmwqEYJkM/hqdefault.jpg',
    published_at: '2026-08-01T11:00:00Z',
    video_url: 'https://www.youtube.com/watch?v=OQxmwqEYJkM',
  },
  {
    id: 'KPNK-aTJMNg',
    title: 'Lição 5 — Tudo para a Glória de Deus | Presente 7',
    description:
      'Comentários e reflexões sobre mordomia cristã e adoração bíblica.',
    thumbnail_url: 'https://i.ytimg.com/vi/KPNK-aTJMNg/hqdefault.jpg',
    published_at: '2026-07-25T11:00:00Z',
    video_url: 'https://www.youtube.com/watch?v=KPNK-aTJMNg',
  },
  {
    id: 'jfDgjNtIL-Y',
    title: 'Lição 4 — Pecado na Igreja | Presente 7',
    description:
      'Estudo da palavra de Deus e lições para o fortalecimento da comunidade cristã.',
    thumbnail_url: 'https://i.ytimg.com/vi/jfDgjNtIL-Y/hqdefault.jpg',
    published_at: '2026-07-18T11:00:00Z',
    video_url: 'https://www.youtube.com/watch?v=jfDgjNtIL-Y',
  },
];

@Injectable({ providedIn: 'root' })
export class YoutubeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/youtube`;

  readonly videos = signal<readonly VideoItem[]>(DEFAULT_VIDEOS);
  readonly presente7Videos = signal<readonly VideoItem[]>(DEFAULT_PRESENTE7_VIDEOS);
  readonly isLive = signal<boolean>(false);
  readonly liveVideo = signal<VideoItem | null>(null);
  readonly loading = signal<boolean>(false);

  fetchLatestVideos(): Observable<readonly VideoItem[]> {
    this.loading.set(true);
    return this.http.get<YouTubeLatestResponse>(`${this.apiUrl}/latest`).pipe(
      map((res) => (res.videos && res.videos.length > 0 ? res.videos : DEFAULT_VIDEOS)),
      tap((vids) => {
        this.videos.set(vids);
        this.loading.set(false);
      }),
      catchError(() => {
        this.videos.set(DEFAULT_VIDEOS);
        this.loading.set(false);
        return of(DEFAULT_VIDEOS);
      }),
    );
  }

  fetchCatalogVideos(): Observable<readonly VideoItem[]> {
    this.loading.set(true);
    return this.http.get<YouTubeLatestResponse>(`${this.apiUrl}/catalog`).pipe(
      map((res) => (res.videos && res.videos.length > 0 ? res.videos : DEFAULT_VIDEOS)),
      tap((vids) => {
        this.videos.set(vids);
        this.loading.set(false);
      }),
      catchError(() => {
        this.videos.set(DEFAULT_VIDEOS);
        this.loading.set(false);
        return of(DEFAULT_VIDEOS);
      }),
    );
  }

  fetchPlaylistVideos(category: VideoCategory): Observable<readonly VideoItem[]> {
    if (category === 'todos') {
      return this.fetchCatalogVideos();
    }
    if (category === 'presente7') {
      return this.fetchPresente7Videos();
    }
    return this.http.get<YouTubeLatestResponse>(`${this.apiUrl}/playlist/${category}`).pipe(
      map((res) => res.videos || []),
      catchError(() => of([])),
    );
  }

  fetchPresente7Videos(): Observable<readonly VideoItem[]> {
    return this.http.get<YouTubeLatestResponse>(`${this.apiUrl}/presente7`).pipe(
      map((res) => (res.videos && res.videos.length > 0 ? res.videos : DEFAULT_PRESENTE7_VIDEOS)),
      tap((vids) => {
        this.presente7Videos.set(vids);
      }),
      catchError(() => {
        this.presente7Videos.set(DEFAULT_PRESENTE7_VIDEOS);
        return of(DEFAULT_PRESENTE7_VIDEOS);
      }),
    );
  }

  fetchLiveStatus(): Observable<YouTubeLiveResponse> {
    return this.http.get<YouTubeLiveResponse>(`${this.apiUrl}/live`).pipe(
      tap((res) => {
        this.isLive.set(res.is_live);
        this.liveVideo.set(res.live_video || null);
      }),
      catchError(() => {
        const fallback: YouTubeLiveResponse = { is_live: false, live_video: null };
        this.isLive.set(false);
        this.liveVideo.set(null);
        return of(fallback);
      }),
    );
  }
}
