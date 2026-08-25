import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { StoryCanvasService, RenderStoryOptions, ShareStoryOptions } from './story-canvas.service';
import { STORY_BACKGROUND_PRESETS } from '../constants/story-presets';
import { DailyVerse, StoryBackground } from '../models/story.models';

describe('StoryCanvasService', () => {
  let service: StoryCanvasService;

  const mockVerse: DailyVerse = {
    id: 'salmos-23-1',
    referencia: 'Salmos 23:1',
    texto: 'O Senhor é o meu pastor; nada me faltará.',
    tema: 'Confiança & Provisão',
    categoria: 'paz',
    tagsSemanticas: ['pastor', 'cuidado', 'paz', 'confiança'],
  };

  const longVerse: DailyVerse = {
    id: 'isaias-41-10',
    referencia: 'Isaías 41:10',
    texto:
      'Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça.',
    tema: 'Coragem & Amparo',
    categoria: 'coragem',
  };

  const mockGradientBg: StoryBackground = STORY_BACKGROUND_PRESETS[0]; // azul-imperial
  const mockPhotoBg: StoryBackground = STORY_BACKGROUND_PRESETS[4]; // alvorada-montanhas

  beforeAll(() => {
    // Canvas context mock for JSDOM test environment
    HTMLCanvasElement.prototype.getContext = (() =>
      ({
        createLinearGradient: () => ({ addColorStop: () => {} }),
        createRadialGradient: () => ({ addColorStop: () => {} }),
        fillRect: () => {},
        strokeRect: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        arcTo: () => {},
        closePath: () => {},
        stroke: () => {},
        fill: () => {},
        fillText: () => {},
        measureText: (text: string) => ({ width: text.length * 10 }),
        drawImage: () => {},
      }) as unknown as CanvasRenderingContext2D) as any;

    HTMLCanvasElement.prototype.toBlob = function (callback: BlobCallback, type?: string) {
      callback(new Blob(['fake-canvas-png-bytes'], { type: type || 'image/png' }));
    };

    HTMLCanvasElement.prototype.toDataURL = function () {
      return 'data:image/png;base64,fakeDataUrl';
    };
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StoryCanvasService, { provide: PLATFORM_ID, useValue: 'browser' }],
    });
    service = TestBed.inject(StoryCanvasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('STORY_BACKGROUND_PRESETS', () => {
    it('should provide 10 presets (4 gradients and 6 photos)', () => {
      expect(STORY_BACKGROUND_PRESETS.length).toBe(10);

      const gradients = STORY_BACKGROUND_PRESETS.filter((p) => p.tipo === 'gradient');
      const photos = STORY_BACKGROUND_PRESETS.filter((p) => p.tipo === 'photo');

      expect(gradients.length).toBe(4);
      expect(photos.length).toBe(6);
    });

    it('should include all required gradient ids', () => {
      const ids = STORY_BACKGROUND_PRESETS.map((p) => p.id);
      expect(ids).toContain('azul-imperial');
      expect(ids).toContain('dourado-aurora');
      expect(ids).toContain('verde-esperanca');
      expect(ids).toContain('noite-celestial');
    });

    it('should include all required photo preset ids', () => {
      const ids = STORY_BACKGROUND_PRESETS.map((p) => p.id);
      expect(ids).toContain('alvorada-montanhas');
      expect(ids).toContain('ceu-estrelado');
      expect(ids).toContain('floresta-raios');
      expect(ids).toContain('por-do-sol-ouro');
      expect(ids).toContain('biblia-luz');
      expect(ids).toContain('nuvens-celestes');
    });
  });

  describe('renderStoryToBlob and renderStoryToDataUrl', () => {
    it('should render Story format (9:16 - 1080x1920) with gradient background to Blob', async () => {
      const options: RenderStoryOptions = {
        verse: mockVerse,
        background: mockGradientBg,
        format: 'story',
      };

      const blob = await service.renderStoryToBlob(options);
      expect(blob).toBeTruthy();
      expect(blob.type).toBe('image/png');
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should render Feed format (1:1 - 1080x1080) with custom overlay opacity', async () => {
      const options: RenderStoryOptions = {
        verse: longVerse,
        background: mockGradientBg,
        format: 'feed',
        overlayOpacity: 0.75,
      };

      const blob = await service.renderStoryToBlob(options);
      expect(blob).toBeTruthy();
      expect(blob.type).toBe('image/png');
    });

    it('should render photo background successfully', async () => {
      // Mock Image constructor in JSDOM
      const originalImage = globalThis.Image;
      (globalThis as any).Image = class {
        src = '';
        crossOrigin = '';
        width = 1920;
        height = 1080;
        onload: () => void = () => {};
        onerror: () => void = () => {};
        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      };

      try {
        const options: RenderStoryOptions = {
          verse: mockVerse,
          background: mockPhotoBg,
          format: 'story',
        };

        const blob = await service.renderStoryToBlob(options);
        expect(blob).toBeTruthy();
      } finally {
        globalThis.Image = originalImage;
      }
    });

    it('should fallback to canvasColors if photo image fails to load', async () => {
      const originalImage = globalThis.Image;
      (globalThis as any).Image = class {
        src = '';
        crossOrigin = '';
        onload: () => void = () => {};
        onerror: () => void = () => {};
        constructor() {
          setTimeout(() => {
            if (this.onerror) this.onerror();
          }, 0);
        }
      };

      try {
        const options: RenderStoryOptions = {
          verse: mockVerse,
          background: mockPhotoBg,
          format: 'story',
        };

        const blob = await service.renderStoryToBlob(options);
        expect(blob).toBeTruthy();
      } finally {
        globalThis.Image = originalImage;
      }
    });

    it('should render custom user uploaded image preview Data URL', async () => {
      const originalImage = globalThis.Image;
      (globalThis as any).Image = class {
        src = '';
        crossOrigin = '';
        width = 1080;
        height = 1920;
        onload: () => void = () => {};
        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      };

      try {
        const options: RenderStoryOptions = {
          verse: mockVerse,
          background: mockGradientBg,
          customImageUrl: 'data:image/jpeg;base64,customUploadMock',
          format: 'story',
        };

        const dataUrl = await service.renderStoryToDataUrl(options);
        expect(dataUrl).toContain('data:image/png');
      } finally {
        globalThis.Image = originalImage;
      }
    });
  });

  describe('generateFilename', () => {
    it('should generate a sanitized filename with reference and format', () => {
      const filenameStory = service.generateFilename(mockVerse, 'story');
      expect(filenameStory).toBe('versiculo-salmos-23-1-story.png');

      const filenameFeed = service.generateFilename(longVerse, 'feed');
      expect(filenameFeed).toBe('versiculo-isaias-41-10-feed.png');
    });
  });

  describe('downloadStory', () => {
    it('should trigger link click download in browser', () => {
      const blob = new Blob(['mock-data'], { type: 'image/png' });
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      const realAnchor = document.createElement('a');
      const clickSpy = vi.spyOn(realAnchor, 'click').mockImplementation(() => {});
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(realAnchor);

      service.downloadStory(blob, 'teste-download.png');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(realAnchor.download).toBe('teste-download.png');
      expect(realAnchor.href).toContain('blob:mock-url');
      expect(clickSpy).toHaveBeenCalled();

      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
      createElementSpy.mockRestore();
    });
  });

  describe('shareStory', () => {
    it('should use navigator.share when available and supported', async () => {
      const blob = new Blob(['mock-share'], { type: 'image/png' });
      const shareMock = vi.fn().mockResolvedValue(undefined);
      const canShareMock = vi.fn().mockReturnValue(true);

      Object.defineProperty(navigator, 'share', {
        value: shareMock,
        configurable: true,
        writable: true,
      });
      Object.defineProperty(navigator, 'canShare', {
        value: canShareMock,
        configurable: true,
        writable: true,
      });

      const options: ShareStoryOptions = {
        blob,
        filename: 'story-salmos.png',
        title: 'Versículo do Dia',
        text: 'O Senhor é o meu pastor',
      };

      const result = await service.shareStory(options);
      expect(result).toBe(true);
      expect(shareMock).toHaveBeenCalled();
    });

    it('should fall back to downloadStory when navigator.share is unavailable', async () => {
      const blob = new Blob(['mock-share'], { type: 'image/png' });
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        configurable: true,
        writable: true,
      });

      const downloadSpy = vi.spyOn(service, 'downloadStory').mockImplementation(() => {});

      const options: ShareStoryOptions = {
        blob,
        filename: 'story-salmos.png',
      };

      const result = await service.shareStory(options);
      expect(result).toBe(false);
      expect(downloadSpy).toHaveBeenCalledWith(blob, 'story-salmos.png');
    });

    it('should fall back to downloadStory when navigator.share throws', async () => {
      const blob = new Blob(['mock-share'], { type: 'image/png' });
      const shareMock = vi.fn().mockRejectedValue(new Error('Share failed'));
      const canShareMock = vi.fn().mockReturnValue(true);

      Object.defineProperty(navigator, 'share', {
        value: shareMock,
        configurable: true,
        writable: true,
      });
      Object.defineProperty(navigator, 'canShare', {
        value: canShareMock,
        configurable: true,
        writable: true,
      });

      const downloadSpy = vi.spyOn(service, 'downloadStory').mockImplementation(() => {});

      const options: ShareStoryOptions = {
        blob,
        filename: 'story-salmos.png',
      };

      const result = await service.shareStory(options);
      expect(result).toBe(false);
      expect(downloadSpy).toHaveBeenCalledWith(blob, 'story-salmos.png');
    });
  });

  describe('SSR Safety', () => {
    it('should handle SSR environment gracefully without errors', async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [StoryCanvasService, { provide: PLATFORM_ID, useValue: 'server' }],
      });
      const serverService = TestBed.inject(StoryCanvasService);

      const blob = await serverService.renderStoryToBlob({
        verse: mockVerse,
        background: mockGradientBg,
      });
      expect(blob).toBeTruthy();

      expect(() =>
        serverService.downloadStory(new Blob([]), 'test.png'),
      ).not.toThrow();
    });
  });
});
