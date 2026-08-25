import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { BibleService } from './bible.service';

describe('BibleService', () => {
  let service: BibleService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BibleService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BibleService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return curated verses with semantic tags', () => {
    const verses = service.getCuratedVerses();
    expect(verses.length).toBeGreaterThanOrEqual(8);
    expect(verses[0].tagsSemanticas).toBeDefined();
    expect(verses[0].tagsSemanticas!.length).toBeGreaterThan(0);
  });

  it('should return deterministic verse of the day for a specific date', () => {
    const date1 = new Date('2026-08-25T12:00:00Z');
    const date2 = new Date('2026-08-25T20:00:00Z');
    const date3 = new Date('2026-08-26T12:00:00Z');

    const verse1 = service.getDailyVerse(date1);
    const verse2 = service.getDailyVerse(date2);
    const verse3 = service.getDailyVerse(date3);

    expect(verse1.id).toBe(verse2.id);
    expect(verse1).toBeDefined();
    expect(verse3).toBeDefined();
  });

  it('deve buscar passagem bíblica da API com sucesso e limpar o texto', async () => {
    const mockApiResponse = {
      reference: 'João 14:6',
      text: 'Respondeu-lhe Jesus:\u00a0Eu sou o caminho, e a verdade, e a vida.\r\n',
      verses: [
        {
          book_name: 'João',
          chapter: 14,
          verse: 6,
          text: 'Respondeu-lhe Jesus: Eu sou o caminho, e a verdade, e a vida.',
        },
      ],
    };

    const promise = firstValueFrom(
      service.fetchPassage('João 14:6', 'Caminho & Vida', 'esperanca'),
    );

    const req = httpTesting.expectOne('https://bible-api.com/Jo%C3%A3o%2014%3A6?translation=almeida');
    expect(req.request.method).toBe('GET');
    req.flush(mockApiResponse);

    const verse = await promise;
    expect(verse.referencia).toBe('João 14:6');
    expect(verse.texto).toBe('Respondeu-lhe Jesus: Eu sou o caminho, e a verdade, e a vida.');
    expect(verse.tema).toBe('Caminho & Vida');
    expect(verse.categoria).toBe('esperanca');
  });

  it('deve usar o cache em memória para chamadas repetidas da mesma passagem', async () => {
    const mockApiResponse = {
      reference: 'Salmos 121:1-2',
      text: 'Elevo os meus olhos para os montes: de onde me virá o socorro?',
    };

    const promise1 = firstValueFrom(service.fetchPassage('Salmos 121:1-2'));
    const req = httpTesting.expectOne(
      'https://bible-api.com/Salmos%20121%3A1-2?translation=almeida',
    );
    req.flush(mockApiResponse);

    const v1 = await promise1;
    expect(v1.referencia).toBe('Salmos 121:1-2');

    // Segunda chamada não dispara requisição HTTP
    const v2 = await firstValueFrom(service.fetchPassage('Salmos 121:1-2'));
    expect(v2.texto).toBe(v1.texto);
  });

  it('deve recuperar do fallback se a requisição falhar mas houver versículo correspondente', async () => {
    const promise = firstValueFrom(service.fetchPassage('Salmos 23'));

    const req = httpTesting.expectOne('https://bible-api.com/Salmos%2023?translation=almeida');
    req.error(new ProgressEvent('Network error'));

    const verse = await promise;
    expect(verse.referencia).toBe('Salmos 23:1-2');
  });
});
