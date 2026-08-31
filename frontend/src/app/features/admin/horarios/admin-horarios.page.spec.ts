import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminHorariosPage } from './admin-horarios.page';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { FirebaseService } from '../../../core/firebase/firebase.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Horario, AvisoHorarioEspecial } from '../../../core/models/content.models';

describe('AdminHorariosPage', () => {
  let fixture: ComponentFixture<AdminHorariosPage>;
  let component: AdminHorariosPage;
  let cmsService: AdminCmsService;
  let toastService: ToastService;

  const mockHorarios: Horario[] = [
    {
      id: 'h-1',
      titulo: 'Escola Sabatina',
      dia: 'Sábado',
      horario: '09:00',
      descricao: 'Estudo da lição e confraternização.',
      ativo: true,
    },
    {
      id: 'h-2',
      titulo: 'Culto Divino',
      dia: 'Sábado',
      horario: '10:15',
      descricao: 'Adoração e mensagem bíblica.',
      ativo: false,
    },
  ];

  const mockAvisos: AvisoHorarioEspecial[] = [
    {
      id: 'av-1',
      titulo: 'Culto de Ano Novo',
      data_evento: '31/12 às 20h',
      mensagem: 'Horário único de celebração.',
      ativo: true,
      expira_em: '2026-12-31',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminHorariosPage],
      providers: [provideRouter([]), AdminCmsService, FirebaseService, ToastService],
    }).compileComponents();

    cmsService = TestBed.inject(AdminCmsService);
    toastService = TestBed.inject(ToastService);

    vi.spyOn(cmsService, 'getHorariosRegulares').mockResolvedValue(mockHorarios);
    vi.spyOn(cmsService, 'getAvisosHorarios').mockResolvedValue(mockAvisos);

    fixture = TestBed.createComponent(AdminHorariosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('exibe título principal e seções de horários e avisos', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Horários & Avisos Especiais');
    expect(text).toContain('Grade Regular de Cultos');
    expect(text).toContain('Avisos de Alteração / Horários Especiais');
  });

  it('carrega cultos regulares e avisos especiais na inicialização', () => {
    expect(component.regularHorarios().length).toBe(2);
    expect(component.avisos().length).toBe(1);
  });

  it('abre e fecha o modal de culto regular', () => {
    expect(component.isRegularModalOpen()).toBe(false);

    component.openRegularModal();
    fixture.detectChanges();
    expect(component.isRegularModalOpen()).toBe(true);

    component.closeRegularModal();
    fixture.detectChanges();
    expect(component.isRegularModalOpen()).toBe(false);
  });

  it('abre e fecha o modal de aviso de horário especial', () => {
    expect(component.isAvisoModalOpen()).toBe(false);

    component.openAvisoModal();
    fixture.detectChanges();
    expect(component.isAvisoModalOpen()).toBe(true);

    component.closeAvisoModal();
    fixture.detectChanges();
    expect(component.isAvisoModalOpen()).toBe(false);
  });

  it('abre e fecha o diálogo de confirmação de exclusão de culto regular', () => {
    const horario = component.regularHorarios()[0];
    expect(component.isDeleteDialogOpen()).toBe(false);

    component.openDeleteRegularDialog(horario);
    fixture.detectChanges();
    expect(component.isDeleteDialogOpen()).toBe(true);
    expect(component.deleteTarget()).toEqual({ type: 'regular', item: horario });

    component.cancelDelete();
    fixture.detectChanges();
    expect(component.isDeleteDialogOpen()).toBe(false);
    expect(component.deleteTarget()).toBeNull();
  });

  it('exclui culto regular com sucesso via ConfirmDialog', async () => {
    const deleteSpy = vi.spyOn(cmsService, 'deleteHorarioRegular').mockResolvedValue();
    const toastSpy = vi.spyOn(toastService, 'success');

    const horario = component.regularHorarios()[0];
    component.openDeleteRegularDialog(horario);
    await component.confirmDelete();
    fixture.detectChanges();

    expect(deleteSpy).toHaveBeenCalledWith('h-1');
    expect(toastSpy).toHaveBeenCalledWith(expect.stringContaining('excluído'));
    expect(component.isDeleteDialogOpen()).toBe(false);
  });

  it('exclui aviso especial com sucesso via ConfirmDialog', async () => {
    const deleteSpy = vi.spyOn(cmsService, 'deleteAvisoHorario').mockResolvedValue();
    const toastSpy = vi.spyOn(toastService, 'success');

    const aviso = component.avisos()[0];
    component.openDeleteAvisoDialog(aviso);
    await component.confirmDelete();
    fixture.detectChanges();

    expect(deleteSpy).toHaveBeenCalledWith('av-1');
    expect(toastSpy).toHaveBeenCalledWith(expect.stringContaining('excluído'));
    expect(component.isDeleteDialogOpen()).toBe(false);
  });

  it('alterna o status de um culto regular', async () => {
    const toggleSpy = vi.spyOn(cmsService, 'toggleHorarioAtivo').mockResolvedValue();
    const toastSpy = vi.spyOn(toastService, 'success');

    const horario = component.regularHorarios()[0]; // ativo: true
    await component.toggleRegularStatus(horario);
    fixture.detectChanges();

    expect(toggleSpy).toHaveBeenCalledWith('h-1', false);
    expect(toastSpy).toHaveBeenCalledWith(expect.stringContaining('pausado'));
  });

  it('exibe skeletons quando isLoading for true', () => {
    component.isLoading.set(true);
    fixture.detectChanges();

    const skeletons = fixture.nativeElement.querySelectorAll('app-ui-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('exibe estado vazio com botões quando não há cultos nem avisos', () => {
    component.isLoading.set(false);
    component.regularHorarios.set([]);
    component.avisos.set([]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Nenhum culto regular cadastrado');
    expect(text).toContain('Nenhuma alteração temporária ativa');
  });
});
