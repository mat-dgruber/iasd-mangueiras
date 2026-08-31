import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EstudosPage } from './estudos.page';
import { ContentService } from '../../core/services/content.service';
import { FirebaseService } from '../../core/firebase/firebase.service';
import { BibleService } from '../../core/services/bible.service';
import { VerseAiService } from '../../core/services/verse-ai.service';
import { StoryCanvasService } from '../../core/services/story-canvas.service';

describe('EstudosPage', () => {
  let fixture: ComponentFixture<EstudosPage>;
  let component: EstudosPage;

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

    fixture = TestBed.createComponent(EstudosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
});
