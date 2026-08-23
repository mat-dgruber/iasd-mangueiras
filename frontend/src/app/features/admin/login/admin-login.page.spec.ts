import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminLoginPage } from './admin-login.page';
import { AuthService } from '../../../core/auth/auth.service';
import { FirebaseService } from '../../../core/firebase/firebase.service';

describe('AdminLoginPage', () => {
  let fixture: ComponentFixture<AdminLoginPage>;
  let component: AdminLoginPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLoginPage],
      providers: [provideRouter([]), AuthService, FirebaseService],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exibe o título do painel e os botões de login', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Painel Administrativo');
    expect(text).toContain('Entrar com conta Google');
    expect(text).toContain('Acessar Painel');
  });

  it('valida formulário de email e senha', () => {
    expect(component.loginForm.valid).toBe(false);

    component.loginForm.patchValue({
      email: 'pastor@iasdmangueiras.org.br',
      password: 'senhaSegura123',
    });

    expect(component.loginForm.valid).toBe(true);
  });
});
