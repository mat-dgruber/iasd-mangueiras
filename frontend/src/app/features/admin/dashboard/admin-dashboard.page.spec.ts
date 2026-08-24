import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminDashboardPage } from './admin-dashboard.page';
import { AuthService } from '../../../core/auth/auth.service';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { FirebaseService } from '../../../core/firebase/firebase.service';

describe('AdminDashboardPage', () => {
  let fixture: ComponentFixture<AdminDashboardPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardPage],
      providers: [provideRouter([]), AuthService, AdminCmsService, FirebaseService],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardPage);
    fixture.detectChanges();
  });

  it('exibe boas-vindas e cards métricos', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Painel de controle de conteúdos da IASD Mangueiras');
    expect(text).toContain('Eventos na Agenda');
    expect(text).toContain('Comunicados & Banners');
    expect(text).toContain('Pequenos Grupos');
    expect(text).toContain('Pedidos de Oração');
  });

});
