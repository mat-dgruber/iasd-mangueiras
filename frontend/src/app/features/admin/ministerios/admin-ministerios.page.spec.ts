import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminMinisteriosPage } from './admin-ministerios.page';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { FirebaseService } from '../../../core/firebase/firebase.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Ministerio } from '../../../core/models/content.models';

describe('AdminMinisteriosPage', () => {
  let fixture: ComponentFixture<AdminMinisteriosPage>;
  let component: AdminMinisteriosPage;
  let mockCmsService: Partial<AdminCmsService>;
  let mockToastService: Partial<ToastService>;

  beforeEach(async () => {
    mockCmsService = {
      getMinisterios: vi.fn().mockResolvedValue([]),
      saveMinisterio: vi.fn().mockResolvedValue('min-123'),
      deleteMinisterio: vi.fn().mockResolvedValue(undefined),
      uploadMinisterioImage: vi.fn().mockResolvedValue('https://storage.mock/min.jpg'),
    };

    mockToastService = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AdminMinisteriosPage],
      providers: [
        { provide: AdminCmsService, useValue: mockCmsService },
        { provide: FirebaseService, useValue: { firestore: null, auth: null, storage: null } },
        { provide: ToastService, useValue: mockToastService },
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

  it('integra ImagePicker atualizando a URL do banner ou selecionando arquivo', () => {
    component.openModal();
    fixture.detectChanges();

    component.onUrlChanged('https://cdn.exemplo.com/ministerio.png');
    expect(component.ministerioForm.get('banner_url')?.value).toBe('https://cdn.exemplo.com/ministerio.png');

    component.onImageRemoved();
    expect(component.ministerioForm.get('banner_url')?.value).toBe('');

    const testFile = new File(['mock'], 'min.jpg', { type: 'image/jpeg' });
    component.onImageSelected(testFile);
    expect(component['selectedFile']).toBe(testFile);
  });

  it('abre diálogo de confirmação ao solicitar exclusão e executa deleteMinisterio', async () => {
    const min: Ministerio = {
      id: 'min-1',
      nome: 'Ministério de Música',
      descricao: 'Responsável pelo louvor e adoração nos cultos.',
      categoria: 'Música & Louvor',
    };
    component.ministerios.set([min]);
    fixture.detectChanges();

    expect(component.ministerioToDelete()).toBeNull();

    component.confirmDelete(min);
    fixture.detectChanges();

    expect(component.ministerioToDelete()).toEqual(min);

    await component.executeDeleteMinisterio();
    fixture.detectChanges();

    expect(mockCmsService.deleteMinisterio).toHaveBeenCalledWith('min-1');
    expect(component.ministerioToDelete()).toBeNull();
    expect(component.ministerios()).not.toContain(min);
  });

  it('exibe mensagens de validação inline para campos obrigatórios', () => {
    component.openModal();
    fixture.detectChanges();

    const nomeCtrl = component.ministerioForm.get('nome');
    nomeCtrl?.setValue('');
    nomeCtrl?.markAsTouched();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('O nome do ministério é obrigatório.');
  });
});
