import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renderiza navegação rastreável com links reais', () => {
    const links = Array.from(
      fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>,
    ).map((a) => a.getAttribute('href'));

    expect(links).toContain('/horarios');
    expect(links).toContain('/ao-vivo');
    expect(links).toContain('/eventos');
    expect(links).toContain('/contato');
  });

  it('oferece pulo para conteúdo principal', () => {
    const skip = fixture.nativeElement.querySelector('a[href="#conteudo"]');
    expect(skip?.textContent).toContain('Ir para o conteúdo');
  });

  it('abre e fecha o menu mobile drawer', () => {
    expect(fixture.nativeElement.querySelector('#mobile-menu-drawer')).toBeNull();

    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Abrir ou fechar menu de navegação"]',
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#mobile-menu-drawer')).not.toBeNull();

    component.closeMenu();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#mobile-menu-drawer')).toBeNull();
  });

  it('fecha o menu ao pressionar Escape', () => {
    component.toggleMenu();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#mobile-menu-drawer')).not.toBeNull();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#mobile-menu-drawer')).toBeNull();
  });
});
