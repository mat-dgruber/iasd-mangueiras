import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HeaderComponent] }).compileComponents();
    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
  });

  it('renderiza navegação rastreável com links reais', () => {
    const links = Array.from(fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>).map((a) => a.getAttribute('href'));

    expect(links).toContain('/horarios');
    expect(links).toContain('/ao-vivo');
    expect(links).toContain('/eventos');
    expect(links).toContain('/contato');
  });

  it('oferece pulo para conteúdo principal', () => {
    const skip = fixture.nativeElement.querySelector('a[href="#conteudo"]');
    expect(skip?.textContent).toContain('Ir para o conteúdo');
  });
});
