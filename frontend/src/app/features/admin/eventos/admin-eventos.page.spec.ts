import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminEventosPage } from './admin-eventos.page';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { FirebaseService } from '../../../core/firebase/firebase.service';

describe('AdminEventosPage', () => {
  let fixture: ComponentFixture<AdminEventosPage>;
  let component: AdminEventosPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEventosPage],
      providers: [
        {
          provide: AdminCmsService,
          useValue: {
            getEventos: () => Promise.resolve([]),
            saveEvento: () => Promise.resolve(),
            deleteEvento: () => Promise.resolve(),
            uploadBanner: () => Promise.resolve(''),
          },
        },
        {
          provide: FirebaseService,
          useValue: { firestore: null, auth: null, storage: null },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminEventosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exibe título de eventos e botão para novo evento', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Eventos & Programações');
    expect(text).toContain('Novo Evento');
  });

  it('abre e fecha o modal de cadastro de evento', () => {
    expect(component.isModalOpen()).toBe(false);

    component.openModal();
    fixture.detectChanges();
    expect(component.isModalOpen()).toBe(true);

    component.closeModal();
    fixture.detectChanges();
    expect(component.isModalOpen()).toBe(false);
  });

  it('exibe campos extras para data estruturada e contato no modal', () => {
    component.openModal();
    fixture.detectChanges();

    const labels = Array.from(
      fixture.nativeElement.querySelectorAll('label')
    ).map((el) => (el as HTMLLabelElement).textContent?.trim());

    expect(labels).toContain('Data Início');
    expect(labels).toContain('Data Fim');
    expect(labels).toContain('Endereço');
    expect(labels).toContain('WhatsApp de Contato');
  });
});
