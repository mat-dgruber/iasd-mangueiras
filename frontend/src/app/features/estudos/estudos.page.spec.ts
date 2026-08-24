import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EstudosPage } from './estudos.page';
import { ContentService } from '../../core/services/content.service';
import { FirebaseService } from '../../core/firebase/firebase.service';

describe('EstudosPage', () => {
  let fixture: ComponentFixture<EstudosPage>;
  let component: EstudosPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstudosPage],
      providers: [provideRouter([]), ContentService, FirebaseService],
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

    component.setTab('licao');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('licao');
    expect(fixture.nativeElement.textContent).toContain('Lição da Escola Sabatina Online');

    component.setTab('versiculo');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('versiculo');
    expect(fixture.nativeElement.textContent).toContain('Versículo para o seu Dia');
  });

  it('filtra Pequenos Grupos por perfil', () => {
    component.selectedPerfil.set('Jovens (JA)');
    fixture.detectChanges();

    const pgs = component.filteredPgs();
    expect(pgs.length).toBeGreaterThan(0);
    expect(pgs.every((p) => p.perfil === 'Jovens (JA)')).toBe(true);
  });

  it('avança para o próximo versículo do dia', () => {
    const initialIndex = component.verseIndex();
    component.nextVerse();
    expect(component.verseIndex()).toBe((initialIndex + 1) % component.verses.length);
  });
});
