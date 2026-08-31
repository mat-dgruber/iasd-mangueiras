import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EstudosPgsTabComponent } from './estudos-pgs-tab.component';
import { ContentService } from '../../core/services/content.service';
import { FirebaseService } from '../../core/firebase/firebase.service';

describe('EstudosPgsTabComponent', () => {
  let fixture: ComponentFixture<EstudosPgsTabComponent>;
  let component: EstudosPgsTabComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstudosPgsTabComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        ContentService,
        FirebaseService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EstudosPgsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renderiza o card de perfil e filtros de PGs', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Busca Inteligente em Linguagem Natural');
    expect(text).toContain('Todos os Pequenos Grupos em Tatuí');
    expect(text).toContain('Perfil:');
  });

  it('filtra Pequenos Grupos por perfil', () => {
    component.selectedPerfil.set('Jovens (JA)');
    fixture.detectChanges();

    const pgs = component.filteredPgs();
    expect(pgs.length).toBeGreaterThan(0);
    expect(pgs.every((p) => p.perfil === 'Jovens (JA)')).toBe(true);
  });

  it('gera link de WhatsApp para falar com líder de PG', () => {
    const pgs = component.filteredPgs();
    if (pgs.length > 0) {
      const link = component.getWhatsAppLink(pgs[0]);
      expect(link).toContain('https://api.whatsapp.com/send?phone=55');
      expect(link).toContain(encodeURIComponent(pgs[0].lider));
    }
  });
});
