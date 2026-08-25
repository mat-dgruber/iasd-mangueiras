import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { VideoItem, YouTubeLatestResponse, YouTubeLiveResponse } from '../models/youtube.models';

export const DEFAULT_VIDEOS: readonly VideoItem[] = [
  {
    id: 'QpQF6hCmAw8',
    title: 'Saudade! - Parte 1 | Culto de Sábado',
    description: 'Culto de adoração e mensagem bíblica na IASD Mangueiras em Tatuí-SP.',
    thumbnail_url: 'https://i.ytimg.com/vi/QpQF6hCmAw8/hqdefault.jpg',
    published_at: '2026-08-22T12:00:00Z',
    video_url: 'https://www.youtube.com/watch?v=QpQF6hCmAw8',
  },
  {
    id: 'Gk7BusYGpVg',
    title: 'A Imortalidade da Alma — Ademir Mendes | Culto de Domingo',
    description: 'Culto evangelístico e estudo das profecias bíblicas na IASD Mangueiras.',
    thumbnail_url: 'https://i.ytimg.com/vi/Gk7BusYGpVg/hqdefault.jpg',
    published_at: '2026-08-16T22:30:00Z',
    video_url: 'https://www.youtube.com/watch?v=Gk7BusYGpVg',
  },
  {
    id: 'v5On3uvpMe0',
    title: 'Servir — Josy Monteiro Cesar | Culto de Quarta',
    description: 'Culto de oração e testemunho no meio de semana na IASD Mangueiras.',
    thumbnail_url: 'https://i.ytimg.com/vi/v5On3uvpMe0/hqdefault.jpg',
    published_at: '2026-08-19T22:30:00Z',
    video_url: 'https://www.youtube.com/watch?v=v5On3uvpMe0',
  },
  {
    id: 'g_Xv8zP_Y1U',
    title: 'Lição 9 — Ministério Movido pelo Amor | Presente 7',
    description: 'Estudo bíblico e discussão da lição da Escola Sabatina na IASD Mangueiras.',
    thumbnail_url: 'https://i.ytimg.com/vi/g_Xv8zP_Y1U/hqdefault.jpg',
    published_at: '2026-08-22T11:00:00Z',
    video_url: 'https://www.youtube.com/watch?v=g_Xv8zP_Y1U',
  },
  {
    id: 'dxDPQIeWfAQ',
    title: 'Dilemas — Pr. Geraldo Beulke Jr. | Culto de Sábado',
    description: 'Mensagem inspiradora sobre escolhas e compromisso cristão na IASD Mangueiras.',
    thumbnail_url: 'https://i.ytimg.com/vi/dxDPQIeWfAQ/hqdefault.jpg',
    published_at: '2026-08-08T12:00:00Z',
    video_url: 'https://www.youtube.com/watch?v=dxDPQIeWfAQ',
  },
  {
    id: '2dX9krpFi_Q',
    title: 'O Ritual do Santuário Terrestre — Maurício Braga | Culto de Domingo',
    description: 'Estudo bíblico sobre a tipologia do santuário e salvação na IASD Mangueiras.',
    thumbnail_url: 'https://i.ytimg.com/vi/2dX9krpFi_Q/hqdefault.jpg',
    published_at: '2026-08-09T22:30:00Z',
    video_url: 'https://www.youtube.com/watch?v=2dX9krpFi_Q',
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
