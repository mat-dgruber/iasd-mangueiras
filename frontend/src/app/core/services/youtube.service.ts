import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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

@Injectable({ providedIn: 'root' })
export class YoutubeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/youtube`;

  readonly videos = signal<readonly VideoItem[]>([]);
  readonly presente7Videos = signal<readonly VideoItem[]>([]);
  readonly sabadoVideos = signal<readonly VideoItem[]>([]);
  readonly domingoVideos = signal<readonly VideoItem[]>([]);
  readonly quartaVideos = signal<readonly VideoItem[]>([]);
  readonly isLive = signal<boolean>(false);
  readonly liveVideo = signal<VideoItem | null>(null);
  readonly loading = signal<boolean>(false);

  fetchLatestVideos(): Observable<readonly VideoItem[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return of([]);
    }
    this.loading.set(true);
    return this.http.get<YouTubeLatestResponse>(`${this.apiUrl}/latest`).pipe(
      map((res) => res.videos || []),
      tap((vids) => {
        this.videos.set(vids);
        this.loading.set(false);
      }),
      catchError(() => {
        this.videos.set([]);
        this.loading.set(false);
        return of([]);
      }),
    );
  }

  fetchCatalogVideos(): Observable<readonly VideoItem[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return of([]);
    }
    this.loading.set(true);
    return this.http.get<YouTubeLatestResponse>(`${this.apiUrl}/catalog`).pipe(
      map((res) => res.videos || []),
      tap((vids) => {
        this.videos.set(vids);
        this.loading.set(false);
      }),
      catchError(() => {
        this.videos.set([]);
        this.loading.set(false);
        return of([]);
      }),
    );
  }

  fetchPlaylistVideos(category: VideoCategory): Observable<readonly VideoItem[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return of([]);
    }
    if (category === 'todos') {
      return this.fetchCatalogVideos();
    }
    if (category === 'presente7') {
      return this.fetchPresente7Videos();
    }
    return this.http.get<YouTubeLatestResponse>(`${this.apiUrl}/playlist/${category}`).pipe(
      map((res) => res.videos || []),
      tap((vids) => {
        if (category === 'sabado') this.sabadoVideos.set(vids);
        if (category === 'domingo') this.domingoVideos.set(vids);
        if (category === 'quarta') this.quartaVideos.set(vids);
      }),
      catchError(() => of([])),
    );
  }

  fetchPresente7Videos(): Observable<readonly VideoItem[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return of([]);
    }
    return this.http.get<YouTubeLatestResponse>(`${this.apiUrl}/presente7`).pipe(
      map((res) => res.videos || []),
      tap((vids) => {
        this.presente7Videos.set(vids);
      }),
      catchError(() => {
        this.presente7Videos.set([]);
        return of([]);
      }),
    );
  }

  fetchLiveStatus(): Observable<YouTubeLiveResponse> {
    if (!isPlatformBrowser(this.platformId)) {
      return of({ is_live: false, live_video: null });
    }
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
