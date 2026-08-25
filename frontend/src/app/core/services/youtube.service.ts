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

@Injectable({ providedIn: 'root' })
export class YoutubeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/youtube`;

  readonly videos = signal<readonly VideoItem[]>([]);
  readonly presente7Videos = signal<readonly VideoItem[]>([]);
  readonly isLive = signal<boolean>(false);
  readonly liveVideo = signal<VideoItem | null>(null);
  readonly loading = signal<boolean>(false);

  fetchLatestVideos(): Observable<readonly VideoItem[]> {
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
