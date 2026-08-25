import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HorariosPage } from './horarios.page';

describe('HorariosPage', () => {
  let fixture: ComponentFixture<HorariosPage>;
  let component: HorariosPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorariosPage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(HorariosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exibe título e seções de horários e localização', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Horários e Localização');
    expect(text).toContain('Programação Semanal');
    expect(text).toContain('Como Chegar');
    expect(text).toContain('Escola Sabatina');
    expect(text).toContain('Culto Divino');
  });

  it('possui link direto para o Google Maps', () => {
    const mapsLink = fixture.nativeElement.querySelector('a[href*="google.com/maps"]');
    expect(mapsLink).toBeTruthy();
    expect(mapsLink.getAttribute('target')).toBe('_blank');
  });

  it('permite alternar perguntas frequentes no acordeão', () => {
    const firstFaq = component['faqs'][0].question;
    expect(component.isExpanded(firstFaq)).toBe(true);

    component.toggleFaq(firstFaq);
    expect(component.isExpanded(firstFaq)).toBe(false);

    component.toggleFaq(firstFaq);
    expect(component.isExpanded(firstFaq)).toBe(true);
  });
});
