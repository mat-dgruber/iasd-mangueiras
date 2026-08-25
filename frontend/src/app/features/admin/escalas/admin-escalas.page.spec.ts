import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminEscalasPage } from './admin-escalas.page';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { FirebaseService } from '../../../core/firebase/firebase.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

describe('AdminEscalasPage', () => {
  let fixture: ComponentFixture<AdminEscalasPage>;
  let component: AdminEscalasPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEscalasPage],
      providers: [
        AdminCmsService,
        ToastService,
        {
          provide: FirebaseService,
          useValue: { firestore: null, auth: null, storage: null },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminEscalasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exibe título principal de escalas e botões de ação', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Escalas dos Departamentos');
    expect(el.textContent).toContain('Copiar Escala WhatsApp');
    expect(el.textContent).toContain('+ Nova Escala');
  });

  it('abre e fecha o modal de cadastro de escala', () => {
    expect(component.isModalOpen()).toBe(false);
    component.openCreateModal();
    expect(component.isModalOpen()).toBe(true);
    component.closeModal();
    expect(component.isModalOpen()).toBe(false);
  });
});
