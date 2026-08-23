import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { VideoItem, YouTubeLatestResponse, YouTubeLiveResponse } from '../models/youtube.models';

export const DEFAULT_VIDEOS: readonly VideoItem[] = [
  {
    id: 'live-default-01',
    title: 'Culto Divino — Esperança em Tempos Difíceis',
    description: 'Transmissão do culto de adoração da IASD Mangueiras em Tatuí-SP.',
    thumbnail_url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80',
    published_at: '2026-03-01T10:15:00Z',
    video_url: 'https://www.youtube.com/c/IASDMangueiras',
  },
  {
    id: 'p7-01',
    title: 'Série Presente 7 — Episódio 1: O Princípio da Criação',
    description: 'Estudo especial sobre as origens e a relevância do sábado para os dias atuais.',
    thumbnail_url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&auto=format&fit=crop&q=80',
    published_at: '2026-02-20T19:30:00Z',
    video_url: 'https://www.youtube.com/c/IASDMangueiras',
  },
  {
    id: 'p7-02',
    title: 'Série Presente 7 — Episódio 2: Um Dia de Descanso e Cura',
    description: 'Como encontrar alívio da ansiedade e conexão familiar no dia do Senhor.',
    thumbnail_url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=80',
    published_at: '2026-02-27T19:30:00Z',
    video_url: 'https://www.youtube.com/c/IASDMangueiras',
  },
];

@Injectable({ providedIn: 'root' })
export class YoutubeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api/youtube';

  readonly videos = signal<readonly VideoItem[]>(DEFAULT_VIDEOS);
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
      })
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
      })
    );
  }
}
