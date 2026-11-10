import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
  });

  it('renderiza os horários de culto incluindo domingos', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Sábados: 09:00 e 10:15');
    expect(text).toContain('Domingos: 19:30');
    expect(text).toContain('Quartas: 19:30');
  });

  it('renderiza os canais oficiais', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('YouTube (Transmissões ao vivo)');
    expect(text).toContain('Instagram (@iasdmangueiras)');
    expect(text).toContain('Facebook');
  });
});
