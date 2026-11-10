import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { VerseAiService } from './verse-ai.service';
import { BibleService } from './bible.service';

describe('VerseAiService', () => {
  let service: VerseAiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VerseAiService,
        BibleService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(VerseAiService);
  });

  it('should be created with initial idle state', () => {
    expect(service).toBeTruthy();
    expect(service.isLoading()).toBe(false);
    expect(service.isReady()).toBe(false);
  });

  it('should perform fallback keyword matching if model is not loaded', async () => {
    const results = await service.findRelevantVerses('paz e tranquilidade', 3);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(3);
    expect(results[0].similarityScore).toBeGreaterThan(0);
    expect(results[0].matchPercentage).toBeGreaterThan(0);
    expect(results[0].verse).toBeDefined();
    expect(results[0].verse.referencia).toBeDefined();
  });

  it('should rank verses matching specific emotions accurately in fallback mode', async () => {
    const results = await service.findRelevantVerses('ansiedade e preocupacao', 2);
    expect(results.length).toBeGreaterThan(0);
    const references = results.map((r) => r.verse.referencia);
    const hasAnxietyVerse = references.some(
      (ref) =>
        ref.includes('Filipenses 4') ||
        ref.includes('Salmos 23') ||
        ref.includes('Mateus 11'),
    );
    expect(hasAnxietyVerse).toBe(true);
  });

  it('should rank gratitude and praise verses appropriately', async () => {
    const results = await service.findRelevantVerses('gratidao e louvor pelas bencaos', 2);
    expect(results.length).toBeGreaterThan(0);
    const topMatch = results[0];
    expect(
      topMatch.verse.referencia.includes('Salmos 103') ||
        topMatch.verse.categoria === 'gratidao' ||
        topMatch.verse.tema.toLowerCase().includes('gratid'),
    ).toBe(true);
  });

  it('should respect maxResults constraint', async () => {
    const results1 = await service.findRelevantVerses('esperanca', 1);
    expect(results1.length).toBe(1);

    const results5 = await service.findRelevantVerses('esperanca', 5);
    expect(results5.length).toBeLessThanOrEqual(5);
  });

  it('should handle empty or whitespace-only queries gracefully', async () => {
    const results = await service.findRelevantVerses('   ', 3);
    expect(results.length).toBe(3);
    expect(results[0].verse).toBeDefined();
    expect(results[0].similarityScore).toBeGreaterThan(0);
    expect(results[0].matchPercentage).toBeGreaterThan(0);
  });

  it('should handle server platform gracefully without throwing during initialize', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        VerseAiService,
        BibleService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });
    const serverService = TestBed.inject(VerseAiService);
    const ready = await serverService.initialize();
    expect(ready).toBe(false);
    expect(serverService.isReady()).toBe(false);

    const fallbackResults = await serverService.findRelevantVerses('coragem e forca', 3);
    expect(fallbackResults.length).toBeGreaterThan(0);
  });

  it('should execute neuralSearch when model is loaded and ready', async () => {
    const mockTensor = {
      dispose: vi.fn(),
    };
    const mockModel = {
      embed: vi.fn().mockResolvedValue(mockTensor),
    };
    const mockTf = {
      tidy: (fn: () => any) => fn(),
      matMul: vi.fn().mockReturnValue({
        squeeze: () => ({
          dataSync: () => new Float32Array([0.9, 0.2, 0.1, 0.4]),
        }),
      }),
    };

    // Injeta estado mockado no serviço
    (service as any).model = mockModel;
    (service as any).tf = mockTf;
    (service as any).verseEmbeddings = {};
    (service as any)._isReady.set(true);

    const results = await service.findRelevantVerses('esperanca no futuro', 2);
    expect(mockModel.embed).toHaveBeenCalledWith(['esperanca no futuro']);
    expect(mockTensor.dispose).toHaveBeenCalled();
    expect(results.length).toBe(2);
    expect(results[0].similarityScore).toBeGreaterThanOrEqual(results[1].similarityScore);
  });

  it('should fallback to heuristic if neuralSearch throws error', async () => {
    const mockModel = {
      embed: vi.fn().mockRejectedValue(new Error('Tensor calculation error')),
    };

    (service as any).model = mockModel;
    (service as any).tf = { tidy: () => {} };
    (service as any).verseEmbeddings = {};
    (service as any)._isReady.set(true);

    const results = await service.findRelevantVerses('paz', 2);
    expect(results.length).toBe(2);
    expect(results[0].similarityScore).toBeGreaterThan(0);
  });
});
