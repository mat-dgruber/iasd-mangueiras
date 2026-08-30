import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminMinisteriosPage } from './admin-ministerios.page';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { FirebaseService } from '../../../core/firebase/firebase.service';

describe('AdminMinisteriosPage', () => {
  let fixture: ComponentFixture<AdminMinisteriosPage>;
  let component: AdminMinisteriosPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMinisteriosPage],
      providers: [
        {
          provide: AdminCmsService,
          useValue: {
            getMinisterios: () => Promise.resolve([]),
            saveMinisterio: () => Promise.resolve(),
            deleteMinisterio: () => Promise.resolve(),
            uploadMinisterioImage: () => Promise.resolve(''),
          },
        },
        {
          provide: FirebaseService,
          useValue: { firestore: null, auth: null, storage: null },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminMinisteriosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exibe título da página e botão para novo ministério', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Ministérios');
    expect(text).toContain('Novo Ministério');
  });

  it('renderiza listagem após ngOnInit', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.ministerios().length).toBeGreaterThan(0);
  });

  it('abre modal para criar novo ministério', () => {
    expect(component.isModalOpen()).toBe(false);

    component.openModal();
    fixture.detectChanges();

    expect(component.isModalOpen()).toBe(true);
    expect(component.editingId()).toBeNull();
  });

  it('preenche modal ao editar ministério', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const primeiro = component.ministerios()[0];
    component.editMinisterio(primeiro);
    fixture.detectChanges();

    expect(component.isModalOpen()).toBe(true);
    expect(component.editingId()).toBeNull(); // default data has no id
    expect(component.ministerioForm.value.nome).toBe(primeiro.nome);
  });

  it('fecha modal ao clicar cancelar', () => {
    component.openModal();
    fixture.detectChanges();
    expect(component.isModalOpen()).toBe(true);

    component.closeModal();
    fixture.detectChanges();
    expect(component.isModalOpen()).toBe(false);
  });
});
