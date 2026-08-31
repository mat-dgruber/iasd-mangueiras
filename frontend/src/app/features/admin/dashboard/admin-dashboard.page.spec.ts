import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminDashboardPage } from './admin-dashboard.page';
import { AuthService } from '../../../core/auth/auth.service';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { FirebaseService } from '../../../core/firebase/firebase.service';

describe('AdminDashboardPage', () => {
  let fixture: ComponentFixture<AdminDashboardPage>;
  let component: AdminDashboardPage;
  let cmsService: AdminCmsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardPage],
      providers: [provideRouter([]), AuthService, AdminCmsService, FirebaseService],
    }).compileComponents();

    cmsService = TestBed.inject(AdminCmsService);
    vi.spyOn(cmsService, 'getEventos').mockResolvedValue([] as any);
    vi.spyOn(cmsService, 'getComunicados').mockResolvedValue([] as any);
    vi.spyOn(cmsService, 'getPgs').mockResolvedValue([] as any);
    vi.spyOn(cmsService, 'getOracoes').mockResolvedValue([] as any);
    vi.spyOn(cmsService, 'getEscalas').mockResolvedValue([] as any);

    fixture = TestBed.createComponent(AdminDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await Promise.resolve();
    await fixture.whenStable();
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

  it('exibe atalhos rápidos e guia de gestão', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Ações Rápidas & Gestão');
    expect(text).toContain('Guia Rápido de Gestão de Conteúdo');
    expect(text).toContain('Publicação de Eventos');
    expect(text).toContain('Atendimento Pastoral');
    expect(text).toContain('Escalas dos Sábados');
  });

  it('exibe skeletons quando isLoading for true', () => {
    component.isLoading.set(true);
    fixture.detectChanges();

    const skeletons = fixture.nativeElement.querySelectorAll('app-ui-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
