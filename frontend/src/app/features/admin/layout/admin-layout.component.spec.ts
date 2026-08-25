import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout.component';
import { AuthService } from '../../../core/auth/auth.service';
import { FirebaseService } from '../../../core/firebase/firebase.service';

describe('AdminLayoutComponent', () => {
  let fixture: ComponentFixture<AdminLayoutComponent>;
  let component: AdminLayoutComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLayoutComponent],
      providers: [provideRouter([]), AuthService, FirebaseService],
    }).compileComponents();
    fixture = TestBed.createComponent(AdminLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renderiza o título do painel e links de navegação administrativa', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Gestor de Conteúdo');
    expect(text).toContain('Visão Geral');
    expect(text).toContain('Eventos & Agenda');
    expect(text).toContain('Comunicados & Banners');
    expect(text).toContain('Pequenos Grupos (PGs)');
    expect(text).toContain('Pedidos de Oração');
    expect(text).toContain('Avisos de Horários');
    expect(text).toContain('Escalas & Oficiais');
  });

  it('permite alternar o menu mobile na versão responsiva', () => {
    expect(component.isMobileMenuOpen()).toBe(false);
    component.isMobileMenuOpen.set(true);
    fixture.detectChanges();
    expect(component.isMobileMenuOpen()).toBe(true);
  });
});
