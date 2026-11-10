import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminPgsPage } from './admin-pgs.page';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { FirebaseService } from '../../../core/firebase/firebase.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { PequenoGrupo } from '../../../core/models/content.models';

describe('AdminPgsPage', () => {
  let fixture: ComponentFixture<AdminPgsPage>;
  let component: AdminPgsPage;
  let cmsService: AdminCmsService;
  let toastService: ToastService;

  const mockPgsList: PequenoGrupo[] = [
    {
      id: 'pg-1',
      nome: 'PG Conexão Jovem',
      lider: 'Lucas e Beatriz',
      telefone: '(15) 99811-2233',
      bairro: 'Centro',
      dia: 'Terça-feira',
      horario: '19:30',
      perfil: 'Jovens (JA)',
      descricao: 'Encontro com estudo dinâmico e louvor para juventude.',
      ativo: true,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPgsPage],
      providers: [AdminCmsService, FirebaseService, ToastService],
    }).compileComponents();

    cmsService = TestBed.inject(AdminCmsService);
    toastService = TestBed.inject(ToastService);

    vi.spyOn(cmsService, 'getPgs').mockResolvedValue(mockPgsList);

    fixture = TestBed.createComponent(AdminPgsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('exibe o título e o botão de novo pequeno grupo', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Gestão de Pequenos Grupos (PGs)');
    expect(text).toContain('+ Novo Pequeno Grupo');
  });

  it('abre e fecha o modal de cadastro de PG', () => {
    expect(component.isModalOpen()).toBe(false);

    component.openModal();
    fixture.detectChanges();
    expect(component.isModalOpen()).toBe(true);

    component.closeModal();
    fixture.detectChanges();
    expect(component.isModalOpen()).toBe(false);
  });

  it('valida o formulário de cadastro de PG e exibe erro para campos inválidos', () => {
    component.openModal();
    expect(component.pgForm.valid).toBe(false);

    component.pgForm.patchValue({
      nome: 'PG Conexão Jovem',
      lider: 'Lucas e Beatriz',
      telefone: '(15) 99811-2233',
      bairro: 'Centro',
      dia: 'Terça-feira',
      horario: '19:30',
      perfil: 'Jovens (JA)',
      descricao: 'Encontro com estudo dinâmico e louvor.',
    });

    expect(component.pgForm.valid).toBe(true);
  });

  it('abre e fecha o diálogo de confirmação de exclusão', () => {
    const pg = component.pgs()[0];
    expect(component.isDeleteDialogOpen()).toBe(false);

    component.openDeleteDialog(pg);
    fixture.detectChanges();
    expect(component.isDeleteDialogOpen()).toBe(true);
    expect(component.pgToDelete()).toEqual(pg);

    component.cancelDelete();
    fixture.detectChanges();
    expect(component.isDeleteDialogOpen()).toBe(false);
    expect(component.pgToDelete()).toBeNull();
  });

  it('exclui PG com sucesso via ConfirmDialog', async () => {
    const deleteSpy = vi.spyOn(cmsService, 'deletePg').mockResolvedValue();
    const toastSpy = vi.spyOn(toastService, 'success');

    const pg = component.pgs()[0];
    component.openDeleteDialog(pg);
    await component.confirmDelete();
    fixture.detectChanges();

    expect(deleteSpy).toHaveBeenCalledWith('pg-1');
    expect(toastSpy).toHaveBeenCalledWith(expect.stringContaining('excluído'));
    expect(component.isDeleteDialogOpen()).toBe(false);
  });

  it('alterna o status ativo/pausado do PG e emite toast', async () => {
    const saveSpy = vi.spyOn(cmsService, 'savePg').mockResolvedValue('pg-1');
    const toastSpy = vi.spyOn(toastService, 'success');

    const pg = component.pgs()[0]; // ativo: true
    await component.toggleStatus(pg);
    fixture.detectChanges();

    expect(saveSpy).toHaveBeenCalledWith({ ativo: false }, 'pg-1');
    expect(toastSpy).toHaveBeenCalledWith(expect.stringContaining('pausado'));
  });

  it('exibe skeletons quando isLoading for true', () => {
    component.isLoading.set(true);
    fixture.detectChanges();

    const skeletonContainer = fixture.nativeElement.querySelector('[aria-busy="true"]');
    expect(skeletonContainer).not.toBeNull();
  });

  it('exibe estado vazio com botão de ação quando a lista está vazia', () => {
    component.isLoading.set(false);
    component.pgs.set([]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Nenhum Pequeno Grupo cadastrado');
    expect(text).toContain('+ Cadastrar Primeiro PG');
  });
});
