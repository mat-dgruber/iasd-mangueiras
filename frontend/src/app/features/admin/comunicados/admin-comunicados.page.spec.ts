import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminComunicadosPage } from './admin-comunicados.page';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { FirebaseService } from '../../../core/firebase/firebase.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Comunicado } from '../../../core/models/content.models';

describe('AdminComunicadosPage', () => {
  let fixture: ComponentFixture<AdminComunicadosPage>;
  let component: AdminComunicadosPage;
  let cmsService: AdminCmsService;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminComunicadosPage],
      providers: [
        AdminCmsService,
        ToastService,
        {
          provide: FirebaseService,
          useValue: { firestore: null, auth: null, storage: null },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComunicadosPage);
    component = fixture.componentInstance;
    cmsService = TestBed.inject(AdminCmsService);
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  it('exibe título de comunicados e botão para novo comunicado', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Comunicados & Avisos');
    expect(text).toContain('Novo Comunicado');
  });

  it('abre e fecha o modal de cadastro de comunicado', () => {
    expect(component.isModalOpen()).toBe(false);

    component.openModal();
    fixture.detectChanges();
    expect(component.isModalOpen()).toBe(true);

    component.closeModal();
    fixture.detectChanges();
    expect(component.isModalOpen()).toBe(false);
  });

  it('exibe skeletons durante o carregamento', () => {
    component.isLoading.set(true);
    fixture.detectChanges();

    const skeletons = fixture.nativeElement.querySelectorAll('app-ui-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('exibe estado vazio com botão acionável quando não há comunicados', () => {
    component.isLoading.set(false);
    component.comunicados.set([]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Nenhum comunicado ativo');
    expect(text).toContain('+ Criar Primeiro Comunicado');
  });

  it('abre diálogo de confirmação ao clicar em excluir e executa exclusão', async () => {
    const mockCom: Comunicado = { id: 'com-1', titulo: 'Aviso Teste', mensagem: 'Mensagem teste', data: '2026-08-31', ativo: true };
    component.comunicados.set([mockCom]);
    component.isLoading.set(false);
    fixture.detectChanges();

    vi.spyOn(cmsService, 'deleteComunicado').mockResolvedValue();
    vi.spyOn(toastService, 'success');

    component.confirmDelete(mockCom);
    fixture.detectChanges();

    expect(component.comunicadoToDelete()).toEqual(mockCom);

    await component.executeDeleteComunicado();
    expect(cmsService.deleteComunicado).toHaveBeenCalledWith('com-1');
    expect(component.comunicados().length).toBe(0);
    expect(component.comunicadoToDelete()).toBeNull();
    expect(toastService.success).toHaveBeenCalledWith('Comunicado excluído com sucesso.');
  });

  it('alterna status do comunicado entre ativo e pausado', async () => {
    const mockCom: Comunicado = { id: 'com-2', titulo: 'Aviso Culto', mensagem: 'Mensagem culto', data: '2026-08-31', ativo: true };
    component.comunicados.set([mockCom]);
    vi.spyOn(cmsService, 'saveComunicado').mockResolvedValue('com-2');
    vi.spyOn(toastService, 'info');

    await component.toggleStatus(mockCom);
    expect(mockCom.ativo).toBe(false);
    expect(toastService.info).toHaveBeenCalledWith('Comunicado pausado.');

    await component.toggleStatus(mockCom);
    expect(mockCom.ativo).toBe(true);
    expect(toastService.info).toHaveBeenCalledWith('Comunicado ativado.');
  });

  it('valida formulário de comunicado e não salva se inválido', async () => {
    const saveSpy = vi.spyOn(cmsService, 'saveComunicado');
    component.comunicadoForm.patchValue({
      titulo: 'Ab', // Menos de 3 caracteres
      mensagem: '',
    });

    await component.saveComunicado();
    expect(saveSpy).not.toHaveBeenCalled();
    expect(component.comunicadoForm.invalid).toBe(true);
  });
});
