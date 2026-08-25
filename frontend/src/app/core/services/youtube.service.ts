import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { VideoItem, YouTubeLatestResponse, YouTubeLiveResponse } from '../models/youtube.models';

export const DEFAULT_VIDEOS: readonly VideoItem[] = [
  {
    id: 'YyFgCdgq_So',
    title: 'Uma Nova Identidade — Série Identidade | Pr. Osmar Borges',
    description: 'Transmissão do culto de adoração da IASD Mangueiras em Tatuí-SP.',
    thumbnail_url: 'https://i.ytimg.com/vi/YyFgCdgq_So/hqdefault.jpg',
    published_at: '2026-08-24T11:48:40Z',
    video_url: 'https://www.youtube.com/watch?v=YyFgCdgq_So',
  },
  {
    id: 'EWYzMii3Jj4',
    title: 'Filho da Escrava ou da Livre? | Pr. Paulo Pinheiro',
    description: 'Culto de adoração e mensagem bíblica na IASD Mangueiras em Tatuí-SP.',
    thumbnail_url: 'https://i.ytimg.com/vi/EWYzMii3Jj4/hqdefault.jpg',
    published_at: '2026-08-23T02:57:44Z',
    video_url: 'https://www.youtube.com/watch?v=EWYzMii3Jj4',
  },
  {
    id: 'oarhiElXlSk',
    title: 'A Plenitude do Tempo | Pr. Gabriel Pilon',
    description: 'Mensagem inspiradora e estudo da palavra de Deus na IASD Mangueiras.',
    thumbnail_url: 'https://i.ytimg.com/vi/oarhiElXlSk/hqdefault.jpg',
    published_at: '2026-08-17T11:25:59Z',
    video_url: 'https://www.youtube.com/watch?v=oarhiElXlSk',
  },
  {
    id: 'o3aiUSbprt8',
    title: 'Culto de Sábado: Vasilhas Vazias | Pr. Osmar Borges',
    description: 'Mensagem sobre fé, entrega e milagres na vida diária.',
    thumbnail_url: 'https://i.ytimg.com/vi/o3aiUSbprt8/hqdefault.jpg',
    published_at: '2026-08-02T03:10:18Z',
    video_url: 'https://www.youtube.com/watch?v=o3aiUSbprt8',
  },
];

export const DEFAULT_PRESENTE7_VIDEOS: readonly VideoItem[] = [
  {
    id: 'YyFgCdgq_So',
    title: 'Série Presente 7 — Lição da Semana | Pr. Michelson Borges & Pr. Osmar Borges',
    description: 'Estudo bíblico e reflexão da série Presente 7 gravada na IASD Mangueiras em Tatuí-SP.',
    thumbnail_url: 'https://i.ytimg.com/vi/YyFgCdgq_So/hqdefault.jpg',
    published_at: '2026-08-22T12:00:00Z',
    video_url: 'https://www.youtube.com/watch?v=YyFgCdgq_So',
  },
  {
    id: 'EWYzMii3Jj4',
    title: 'Série Presente 7 — Princípios e Fundamentos da Fé | Pr. Osmar Borges',
    description: 'Comentários inspiradores e aplicação prática das Escrituras Sagradas para a vida diária.',
    thumbnail_url: 'https://i.ytimg.com/vi/EWYzMii3Jj4/hqdefault.jpg',
    published_at: '2026-08-15T12:00:00Z',
    video_url: 'https://www.youtube.com/watch?v=EWYzMii3Jj4',
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
      map((res) =>
        res.videos && res.videos.length > 0
          ? res.videos.slice(0, 2)
          : DEFAULT_PRESENTE7_VIDEOS,
      ),
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
