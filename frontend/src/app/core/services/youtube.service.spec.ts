import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { YoutubeService, DEFAULT_VIDEOS } from './youtube.service';

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
  });

  it('faz fetch dos vídeos e atualiza signal em sucesso', () => {
    service.fetchLatestVideos().subscribe((vids) => {
      expect(vids.length).toBe(1);
      expect(vids[0].id).toBe('test-vid');
    });

    const req = httpMock.expectOne('http://localhost:8000/api/youtube/latest');
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

  it('faz fallback para DEFAULT_VIDEOS quando a API falha', () => {
    service.fetchLatestVideos().subscribe((vids) => {
      expect(vids).toEqual(DEFAULT_VIDEOS);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/youtube/latest');
    req.error(new ProgressEvent('Network error'));

    expect(service.videos()).toEqual(DEFAULT_VIDEOS);
  });
});
