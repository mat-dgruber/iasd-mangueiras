import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { YoutubeService, DEFAULT_VIDEOS, DEFAULT_PRESENTE7_VIDEOS } from './youtube.service';

describe('YoutubeService', () => {
  let service: YoutubeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [YoutubeService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(YoutubeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('inicia com lista de vídeos padrão', () => {
    expect(service.videos().length).toBeGreaterThan(0);
    expect(service.videos()[0].title).toBe(DEFAULT_VIDEOS[0].title);
    expect(service.presente7Videos().length).toBe(6);
  });

  it('faz fetch dos vídeos e atualiza signal em sucesso', () => {
    service.fetchLatestVideos().subscribe((vids) => {
      expect(vids.length).toBe(1);
      expect(vids[0].id).toBe('test-vid');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/youtube/latest`);
    expect(req.request.method).toBe('GET');
    req.flush({
      channel_id: 'test-chan',
      videos: [
        {
          id: 'test-vid',
          title: 'Vídeo de Teste',
          description: 'Desc',
          thumbnail_url: 'http://thumb',
          published_at: '2026-01-01',
          video_url: 'http://video',
        },
      ],
    });

    expect(service.videos()[0].id).toBe('test-vid');
  });

  it('faz fetch dos vídeos da playlist Presente 7 e atualiza signal', () => {
    service.fetchPresente7Videos().subscribe((vids) => {
      expect(vids.length).toBe(3);
      expect(vids[0].id).toBe('p7-1');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/youtube/presente7`);
    expect(req.request.method).toBe('GET');
    req.flush({
      channel_id: 'test-chan',
      videos: [
        {
          id: 'p7-1',
          title: 'Presente 7 - Ep 1',
          description: 'Desc 1',
          thumbnail_url: 'http://thumb1',
          published_at: '2026-01-01',
          video_url: 'http://video1',
        },
        {
          id: 'p7-2',
          title: 'Presente 7 - Ep 2',
          description: 'Desc 2',
          thumbnail_url: 'http://thumb2',
          published_at: '2026-01-02',
          video_url: 'http://video2',
        },
        {
          id: 'p7-3',
          title: 'Presente 7 - Ep 3',
          description: 'Desc 3',
          thumbnail_url: 'http://thumb3',
          published_at: '2026-01-03',
          video_url: 'http://video3',
        },
      ],
    });

    expect(service.presente7Videos().length).toBe(3);
    expect(service.presente7Videos()[0].id).toBe('p7-1');
  });

  it('faz fallback para DEFAULT_VIDEOS quando a API falha', () => {
    service.fetchLatestVideos().subscribe((vids) => {
      expect(vids).toEqual(DEFAULT_VIDEOS);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/youtube/latest`);
    req.error(new ProgressEvent('Network error'));

    expect(service.videos()).toEqual(DEFAULT_VIDEOS);
  });

  it('faz fallback para DEFAULT_PRESENTE7_VIDEOS quando a API de presente7 falha', () => {
    service.fetchPresente7Videos().subscribe((vids) => {
      expect(vids).toEqual(DEFAULT_PRESENTE7_VIDEOS);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/youtube/presente7`);
    req.error(new ProgressEvent('Network error'));

    expect(service.presente7Videos()).toEqual(DEFAULT_PRESENTE7_VIDEOS);
  });

  it('faz fetch do status de live e atualiza signals isLive e liveVideo', () => {
    const mockLiveVid = {
      id: 'live-1',
      title: 'Culto Ao Vivo',
      description: 'Ao vivo agora',
      thumbnail_url: 'http://live-thumb',
      published_at: '2026-08-25T10:00:00Z',
      video_url: 'http://live-vid',
    };

    service.fetchLiveStatus().subscribe((res) => {
      expect(res.is_live).toBe(true);
      expect(res.live_video?.id).toBe('live-1');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/youtube/live`);
    expect(req.request.method).toBe('GET');
    req.flush({ is_live: true, live_video: mockLiveVid });

    expect(service.isLive()).toBe(true);
    expect(service.liveVideo()?.id).toBe('live-1');
  });

  it('faz fallback seguro quando a API de live falha', () => {
    service.fetchLiveStatus().subscribe((res) => {
      expect(res.is_live).toBe(false);
      expect(res.live_video).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/youtube/live`);
    req.error(new ProgressEvent('Network error'));

    expect(service.isLive()).toBe(false);
    expect(service.liveVideo()).toBeNull();
  });
});
