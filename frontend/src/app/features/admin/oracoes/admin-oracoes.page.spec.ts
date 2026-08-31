import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminOracoesPage } from './admin-oracoes.page';
import { AdminCmsService, PedidoOracaoAdmin } from '../../../core/services/admin-cms.service';
import { FirebaseService } from '../../../core/firebase/firebase.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

describe('AdminOracoesPage', () => {
  let fixture: ComponentFixture<AdminOracoesPage>;
  let component: AdminOracoesPage;
  let cmsService: AdminCmsService;
  let toastService: ToastService;

  const mockOracoesList: PedidoOracaoAdmin[] = [
    {
      id: 'mock-1',
      nome: 'Maria Silva',
      telefone: '(15) 99888-7766',
      pedido: 'Oração por saúde',
      confidencial: false,
      status: 'pendente',
    },
    {
      id: 'mock-2',
      nome: 'Carlos Santos',
      telefone: '(15) 99777-6655',
      pedido: 'Estudo bíblico',
      confidencial: true,
      status: 'orado',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOracoesPage],
      providers: [AdminCmsService, FirebaseService, ToastService],
    }).compileComponents();

    cmsService = TestBed.inject(AdminCmsService);
    toastService = TestBed.inject(ToastService);

    vi.spyOn(cmsService, 'getOracoes').mockResolvedValue(mockOracoesList);

    fixture = TestBed.createComponent(AdminOracoesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('exibe título e filtros de pedidos de oração', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Caixa de Pedidos de Oração & Estudos');
    expect(text).toContain('Todos');
    expect(text).toContain('Pendentes');
    expect(text).toContain('Orados');
    expect(text).toContain('Confidenciais');
  });

  it('filtra pedidos confidenciais', () => {
    component.selectedFilter.set('Confidenciais');
    fixture.detectChanges();

    const filtered = component.filteredOracoes();
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((o) => o.confidencial)).toBe(true);
  });

  it('gera link amigável de WhatsApp para o pedido de oração', () => {
    const oracao = mockOracoesList[0];
    const url = component.getWhatsAppUrl(oracao);
    expect(url).toContain('wa.me/5515998887766');
    expect(url).toContain(encodeURIComponent('Olá, Maria Silva!'));
    expect(url).toContain(encodeURIComponent('intercedendo'));
  });

  it('abre e fecha o diálogo de confirmação de exclusão', () => {
    const oracao = component.oracoes()[0];
    expect(component.isDeleteDialogOpen()).toBe(false);

    component.openDeleteDialog(oracao);
    fixture.detectChanges();
    expect(component.isDeleteDialogOpen()).toBe(true);
    expect(component.oracaoToDelete()).toEqual(oracao);

    component.cancelDelete();
    fixture.detectChanges();
    expect(component.isDeleteDialogOpen()).toBe(false);
    expect(component.oracaoToDelete()).toBeNull();
  });

  it('exclui pedido com sucesso via ConfirmDialog', async () => {
    const deleteSpy = vi.spyOn(cmsService, 'deleteOracao').mockResolvedValue();
    const toastSpy = vi.spyOn(toastService, 'success');

    const oracao = component.oracoes()[0];
    component.openDeleteDialog(oracao);
    await component.confirmDelete();
    fixture.detectChanges();

    expect(deleteSpy).toHaveBeenCalledWith('mock-1');
    expect(toastSpy).toHaveBeenCalledWith(expect.stringContaining('excluído'));
    expect(component.isDeleteDialogOpen()).toBe(false);
  });

  it('marca pedido como orado e exibe toast de sucesso', async () => {
    const updateSpy = vi.spyOn(cmsService, 'updateOracaoStatus').mockResolvedValue();
    const toastSpy = vi.spyOn(toastService, 'success');
    const oracao = component.oracoes()[0];

    await component.markAsOrado(oracao);
    fixture.detectChanges();

    expect(oracao.status).toBe('orado');
    expect(updateSpy).toHaveBeenCalledWith('mock-1', 'orado');
    expect(toastSpy).toHaveBeenCalledWith(expect.stringContaining('orado'));
  });

  it('exibe skeletons quando isLoading for true', () => {
    component.isLoading.set(true);
    fixture.detectChanges();

    const skeletonContainer = fixture.nativeElement.querySelector('[aria-busy="true"]');
    expect(skeletonContainer).not.toBeNull();
  });
});
