import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HorariosPage } from './horarios.page';

describe('HorariosPage', () => {
  let fixture: ComponentFixture<HorariosPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HorariosPage] }).compileComponents();
    fixture = TestBed.createComponent(HorariosPage);
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
});
