import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EstudosPage } from './estudos.page';
import { ContentService } from '../../core/services/content.service';
import { FirebaseService } from '../../core/firebase/firebase.service';
import { BibleService } from '../../core/services/bible.service';
import { VerseAiService } from '../../core/services/verse-ai.service';
import { StoryCanvasService } from '../../core/services/story-canvas.service';
import { STORY_BACKGROUND_PRESETS } from '../../core/constants/story-presets';
import { StoryBackground } from '../../core/models/story.models';

describe('EstudosPage', () => {
  let fixture: ComponentFixture<EstudosPage>;
  let component: EstudosPage;
  let httpTesting: HttpTestingController;
  let storyCanvas: StoryCanvasService;
  let verseAi: VerseAiService;
  let bibleService: BibleService;

  beforeAll(() => {
    // Polyfill do Canvas em ambiente JSDOM
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
        drawImage: () => {},
        measureText: () => ({ width: 100 }),
      }) as unknown as CanvasRenderingContext2D) as any;

    HTMLCanvasElement.prototype.toBlob = (callback: BlobCallback) => {
      callback(new Blob(['fake-image-bytes'], { type: 'image/png' }));
    };

    HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,fakeimage';
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstudosPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        ContentService,
        FirebaseService,
        BibleService,
        VerseAiService,
        StoryCanvasService,
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    storyCanvas = TestBed.inject(StoryCanvasService);
    verseAi = TestBed.inject(VerseAiService);
    bibleService = TestBed.inject(BibleService);
    fixture = TestBed.createComponent(EstudosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('exibe o título principal e as abas', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Estudos Bíblicos & Pequenos Grupos');
    expect(text).toContain('Pequenos Grupos (PGs)');
    expect(text).toContain('Lição da Escola Sabatina');
    expect(text).toContain('Versículo do Dia');
  });

  it('permite alternar entre as abas', () => {
    expect(component.activeTab()).toBe('pgs');

    component.setTab('versiculo');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('versiculo');
    expect(fixture.nativeElement.textContent).toContain('Versículo & Gerador de Stories');

    component.setTab('licao');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('licao');
    expect(fixture.nativeElement.textContent).toContain('Aprofunde seu Estudo com Especialistas');
  });

  it('filtra Pequenos Grupos por perfil', () => {
    component.selectedPerfil.set('Jovens (JA)');
    fixture.detectChanges();

    const pgs = component.filteredPgs();
    expect(pgs.length).toBeGreaterThan(0);
    expect(pgs.every((p) => p.perfil === 'Jovens (JA)')).toBe(true);
  });

  it('avança para o próximo versículo do dia', () => {
    const initial = component.currentVerse();
    component.nextVerse();
    const updated = component.currentVerse();
    expect(updated.id).not.toBe(initial.id);
  });

  it('busca passagem bíblica personalizada da API online', () => {
    component.setTab('versiculo');
    fixture.detectChanges();

    component.quickSearchPassage('João 14:1');
    expect(component.isSearchingBible()).toBe(true);

    const req = httpTesting.expectOne('https://bible-api.com/Jo%C3%A3o%2014%3A1?translation=almeida');
    expect(req.request.method).toBe('GET');

    req.flush({
      reference: 'João 14:1',
      text: 'Não se turbe o vosso coração; credes em Deus, crede também em mim.',
    });

    fixture.detectChanges();

    expect(component.isSearchingBible()).toBe(false);
    expect(component.currentVerse().referencia).toBe('João 14:1');
    expect(component.currentVerse().texto).toContain('Não se turbe o vosso coração');
  });

  it('sorteia uma passagem bíblica online aleatória', () => {
    const spy = vi.spyOn(bibleService, 'fetchPassage');
    component.drawRandomOnlineVerse();

    expect(component.popularOnlineReferences.length).toBeGreaterThan(0);
    expect(component.popularOnlineReferences).toContain(component.bibleQuery());
    expect(spy).toHaveBeenCalled();
  });

  it('copia o texto do versículo e aciona feedback', () => {
    component.copyVerseText();
    expect(component.copyFeedback()).toBe('Copiado!');
  });

  it('alterna o formato do story entre story (9:16) e feed (1:1)', () => {
    expect(component.selectedFormat()).toBe('story');

    component.setFormat('feed');
    expect(component.selectedFormat()).toBe('feed');

    component.setFormat('story');
    expect(component.selectedFormat()).toBe('story');
  });

  it('permite selecionar presets de fundo fotográficos e gradientes', () => {
    const photoPreset = STORY_BACKGROUND_PRESETS.find((p) => p.tipo === 'photo')!;
    const gradientPreset = STORY_BACKGROUND_PRESETS.find((p) => p.tipo === 'gradient')!;

    component.selectBackground(photoPreset);
    expect(component.selectedBackground().id).toBe(photoPreset.id);
    expect(component.selectedBackground().tipo).toBe('photo');
    expect(component.overlayOpacity()).toBe(photoPreset.defaultOverlayOpacity);

    component.selectBackground(gradientPreset);
    expect(component.selectedBackground().id).toBe(gradientPreset.id);
    expect(component.selectedBackground().tipo).toBe('gradient');
    expect(component.overlayOpacity()).toBe(gradientPreset.defaultOverlayOpacity);
  });

  it('permite ajustar a opacidade do escurecimento do fundo', () => {
    component.setOverlayOpacity(0.75);
    expect(component.overlayOpacity()).toBe(0.75);

    const event = { target: { value: '65' } } as unknown as Event;
    component.onOpacityChange(event);
    expect(component.overlayOpacity()).toBe(0.65);
  });

  it('permite carregar imagem personalizada do usuário', () => {
    const fakeCustomDataUrl = 'data:image/png;base64,customPhotoMock';
    const customBg: StoryBackground = {
      id: 'custom-user-photo',
      nome: 'Minha Foto Personalizada',
      tipo: 'custom',
      imageUrl: fakeCustomDataUrl,
      primaryTextColor: '#FFFFFF',
      accentColor: '#F59E0B',
      defaultOverlayOpacity: 0.6,
    };

    component.customImagePreview.set(fakeCustomDataUrl);
    component.selectBackground(customBg);

    expect(component.customImagePreview()).toBe(fakeCustomDataUrl);
    expect(component.selectedBackground().tipo).toBe('custom');

    component.clearCustomImage();
    expect(component.customImagePreview()).toBeNull();
    expect(component.selectedBackground().tipo).not.toBe('custom');
  });

  it('executa busca semântica por sentimento via VerseAiService', async () => {
    const spy = vi.spyOn(verseAi, 'findRelevantVerses');

    component.aiQuery.set('ansiedade e medo');
    await component.searchByFeeling();

    expect(spy).toHaveBeenCalledWith('ansiedade e medo');
    expect(component.aiMatches().length).toBeGreaterThan(0);

    const match = component.aiMatches()[0];
    component.selectAiMatch(match);
    expect(component.currentVerse().id).toBe(match.verse.id);
  });

  it('aciona exportação com download em alta resolução via StoryCanvasService', async () => {
    const downloadSpy = vi.spyOn(storyCanvas, 'downloadStory').mockImplementation(() => {});
    const renderSpy = vi
      .spyOn(storyCanvas, 'renderStoryToBlob')
      .mockResolvedValue(new Blob(['test-png'], { type: 'image/png' }));

    await component.downloadHighResImage();

    expect(renderSpy).toHaveBeenCalled();
    expect(downloadSpy).toHaveBeenCalled();
    expect(component.downloadSuccess()).toContain('sucesso');
  });

  it('aciona compartilhamento nativo via StoryCanvasService', async () => {
    const shareSpy = vi.spyOn(storyCanvas, 'shareStory').mockResolvedValue(true);
    const renderSpy = vi
      .spyOn(storyCanvas, 'renderStoryToBlob')
      .mockResolvedValue(new Blob(['test-png'], { type: 'image/png' }));

    await component.shareStoryGraphic();

    expect(renderSpy).toHaveBeenCalled();
    expect(shareSpy).toHaveBeenCalled();
  });

  it('exibe a seção de canais recomendados com especialistas na aba de lição', () => {
    component.setTab('licao');
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Aprofunde seu Estudo com Especialistas');
    expect(text).toContain('Canal Lamed');
    expect(text).toContain('Michelson Borges');
    expect(text).toContain('Presente 7');
    expect(text).toContain('Lições da Bíblia');
  });
});

