import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminContatosPage } from './admin-contatos.page';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { FirebaseService } from '../../../core/firebase/firebase.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

describe('AdminContatosPage', () => {
  let fixture: ComponentFixture<AdminContatosPage>;
  let component: AdminContatosPage;
  let cmsService: AdminCmsService;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminContatosPage],
      providers: [AdminCmsService, FirebaseService, ToastService],
    }).compileComponents();

    cmsService = TestBed.inject(AdminCmsService);
    toastService = TestBed.inject(ToastService);
    fixture = TestBed.createComponent(AdminContatosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exibe título e filtros de mensagens de contato', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Mensagens de Contato');
    expect(text).toContain('Todos');
    expect(text).toContain('Não Lidos');
    expect(text).toContain('Lidos');
    expect(text).toContain('Respondidos');
  });

  it('filtra mensagens não lidas corretamente', () => {
    component.contatos.set([
      { id: '1', nome: 'João', email: 'joao@teste.com', mensagem: 'Olá', lido: false },
      { id: '2', nome: 'Maria', email: 'maria@teste.com', mensagem: 'Tudo bem?', lido: true, respondido: false },
      { id: '3', nome: 'Pedro', email: 'pedro@teste.com', mensagem: 'Dúvida', lido: true, respondido: true },
    ]);

    component.selectedFilter.set('Não Lidos');
    fixture.detectChanges();

    const filtered = component.filteredContatos();
    expect(filtered.length).toBe(1);
    expect(filtered[0].nome).toBe('João');
  });

  it('filtra mensagens respondidas corretamente', () => {
    component.contatos.set([
      { id: '1', nome: 'João', email: 'joao@teste.com', mensagem: 'Olá', lido: false },
      { id: '2', nome: 'Maria', email: 'maria@teste.com', mensagem: 'Tudo bem?', lido: true, respondido: false },
      { id: '3', nome: 'Pedro', email: 'pedro@teste.com', mensagem: 'Dúvida', lido: true, respondido: true },
    ]);

    component.selectedFilter.set('Respondidos');
    fixture.detectChanges();

    const filtered = component.filteredContatos();
    expect(filtered.length).toBe(1);
    expect(filtered[0].nome).toBe('Pedro');
  });

  it('gera link de WhatsApp formatado com código do país', () => {
    const url = component.getWhatsAppUrl('(15) 99786-4835', 'Carlos');
    expect(url).toContain('wa.me/5515997864835');
    expect(url).toContain('Carlos');
  });

  it('abre e fecha diálogo de confirmação de exclusão', () => {
    const mockItem = { id: '1', nome: 'João', email: 'joao@teste.com', mensagem: 'Olá', lido: false };
    component.contatos.set([mockItem]);
    expect(component.isDeleteDialogOpen()).toBe(false);

    component.openDeleteDialog(mockItem);
    fixture.detectChanges();
    expect(component.isDeleteDialogOpen()).toBe(true);
    expect(component.contatoToDelete()).toEqual(mockItem);

    component.cancelDelete();
    fixture.detectChanges();
    expect(component.isDeleteDialogOpen()).toBe(false);
    expect(component.contatoToDelete()).toBeNull();
  });

  it('exclui mensagem via ConfirmDialog com toast de sucesso', async () => {
    const mockItem = { id: '1', nome: 'João', email: 'joao@teste.com', mensagem: 'Olá', lido: false };
    component.contatos.set([mockItem]);
    const deleteSpy = vi.spyOn(cmsService, 'deleteMensagemContato').mockResolvedValue();
    const toastSpy = vi.spyOn(toastService, 'success');

    component.openDeleteDialog(mockItem);
    await component.confirmDelete();
    fixture.detectChanges();

    expect(deleteSpy).toHaveBeenCalledWith('1');
    expect(toastSpy).toHaveBeenCalledWith(expect.stringContaining('excluída'));
    expect(component.contatos().length).toBe(0);
    expect(component.isDeleteDialogOpen()).toBe(false);
  });

  it('exibe skeletons quando isLoading for true', () => {
    component.isLoading.set(true);
    fixture.detectChanges();

    const skeletonContainer = fixture.nativeElement.querySelector('[aria-busy="true"]');
    expect(skeletonContainer).not.toBeNull();
  });

  it('marca mensagem como lida e emite toast de sucesso', async () => {
    const mockItem = { id: '1', nome: 'João', email: 'joao@teste.com', mensagem: 'Olá', lido: false };
    component.contatos.set([mockItem]);
    const updateSpy = vi.spyOn(cmsService, 'updateMensagemContatoStatus').mockResolvedValue();
    const toastSpy = vi.spyOn(toastService, 'success');

    await component.marcarLido(mockItem, true);
    fixture.detectChanges();

    expect(updateSpy).toHaveBeenCalledWith('1', { lido: true });
    expect(toastSpy).toHaveBeenCalledWith(expect.stringContaining('lida'));
    expect(component.contatos()[0].lido).toBe(true);
  });
});
