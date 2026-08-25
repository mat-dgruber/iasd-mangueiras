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

  it('exibe o título principal e seções de gestão', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Horários & Avisos Especiais');
    expect(text).toContain('Grade Regular de Cultos');
    expect(text).toContain('Avisos de Alteração');
  });

  describe('Gestão de Cultos Regulares', () => {
    it('abre e fecha o modal de culto regular para criação', () => {
      expect(component.isRegularModalOpen()).toBe(false);

      component.openRegularModal();
      fixture.detectChanges();
      expect(component.isRegularModalOpen()).toBe(true);
      expect(component.editingRegularId()).toBeNull();

      component.closeRegularModal();
      fixture.detectChanges();
      expect(component.isRegularModalOpen()).toBe(false);
    });

    it('abre o modal de edição de culto regular preenchendo os dados', () => {
      const target = mockHorarios[0];
      component.editRegularHorario(target);
      fixture.detectChanges();

      expect(component.isRegularModalOpen()).toBe(true);
      expect(component.editingRegularId()).toBe('h-1');
      expect(component.regularForm.value.titulo).toBe(target.titulo);
      expect(component.regularForm.value.dia).toBe(target.dia);
      expect(component.regularForm.value.horario).toBe(target.horario);
      expect(component.regularForm.value.descricao).toBe(target.descricao);
      expect(component.regularForm.value.ativo).toBe(true);
    });

    it('valida formulário de culto regular', () => {
      component.openRegularModal();
      expect(component.regularForm.valid).toBe(false);

      component.regularForm.patchValue({
        titulo: 'Culto de Domingo',
        dia: 'Domingo',
        horario: '19:30',
        descricao: 'Culto evangelístico para toda a família.',
        ativo: true,
      });

      expect(component.regularForm.valid).toBe(true);
    });

    it('salva novo culto regular e exibe toast de sucesso', async () => {
      const saveSpy = vi.spyOn(cmsService, 'saveHorarioRegular').mockResolvedValue('h-new');
      const toastSpy = vi.spyOn(toastService, 'success');

      component.openRegularModal();
      component.regularForm.patchValue({
        titulo: 'Novo Culto',
        dia: 'Quinta-feira',
        horario: '20:00',
        descricao: 'Reunião especial de oração.',
        ativo: true,
      });

      await component.saveRegularHorario();
      fixture.detectChanges();

      expect(saveSpy).toHaveBeenCalled();
      expect(toastSpy).toHaveBeenCalledWith(expect.stringContaining('sucesso'));
      expect(component.isRegularModalOpen()).toBe(false);
    });

    it('alterna status ativo/inativo de culto regular e emite feedback', async () => {
      const toggleSpy = vi.spyOn(cmsService, 'toggleHorarioAtivo').mockResolvedValue();
      const toastSpy = vi.spyOn(toastService, 'success');

      const target = mockHorarios[0]; // ativo: true
      await component.toggleRegularStatus(target);
      fixture.detectChanges();

      expect(toggleSpy).toHaveBeenCalledWith('h-1', false);
      expect(toastSpy).toHaveBeenCalledWith(expect.stringContaining('pausado'));
    });

    it('exclui culto regular após confirmação e exibe toast', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const deleteSpy = vi.spyOn(cmsService, 'deleteHorarioRegular').mockResolvedValue();
      const toastSpy = vi.spyOn(toastService, 'success');

      const target = mockHorarios[0];
      await component.deleteRegularHorario(target);
      fixture.detectChanges();

      expect(deleteSpy).toHaveBeenCalledWith('h-1');
      expect(toastSpy).toHaveBeenCalledWith(expect.stringContaining('removido'));
    });
  });

  describe('Gestão de Avisos Especiais', () => {
    it('abre e fecha o modal de aviso especial', () => {
      expect(component.isAvisoModalOpen()).toBe(false);

      component.openAvisoModal();
      fixture.detectChanges();
      expect(component.isAvisoModalOpen()).toBe(true);

      component.closeAvisoModal();
      fixture.detectChanges();
      expect(component.isAvisoModalOpen()).toBe(false);
    });

    it('valida formulário de aviso especial incluindo expira_em', () => {
      component.openAvisoModal();
      expect(component.avisoForm.valid).toBe(false);

      component.avisoForm.patchValue({
        titulo: 'Horário Especial de Carnaval',
        data_evento: '15/02 às 19:30',
        mensagem: 'Programação especial com a igreja reunida.',
        expira_em: '2026-02-16',
        ativo: true,
      });

      expect(component.avisoForm.valid).toBe(true);
    });

    it('salva aviso especial com expira_em e exibe toast de feedback', async () => {
      const saveSpy = vi.spyOn(cmsService, 'saveAvisoHorario').mockResolvedValue('av-new');
      const toastSpy = vi.spyOn(toastService, 'success');

      component.openAvisoModal();
      component.avisoForm.patchValue({
        titulo: 'Ceia Especial',
        data_evento: 'Sábado 10:15',
        mensagem: 'Santa Ceia do Senhor.',
        expira_em: '2026-09-01',
        ativo: true,
      });

      await component.saveAviso();
      fixture.detectChanges();

      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          titulo: 'Ceia Especial',
          expira_em: '2026-09-01',
          ativo: true,
        }),
      );
      expect(toastSpy).toHaveBeenCalledWith(expect.stringContaining('sucesso'));
      expect(component.isAvisoModalOpen()).toBe(false);
    });

    it('abre modal de edição de aviso com campos preenchidos e salva atualização', async () => {
      const saveSpy = vi.spyOn(cmsService, 'saveAvisoHorario').mockResolvedValue('av-1');
      const toastSpy = vi.spyOn(toastService, 'success');

      const target = mockAvisos[0];
      component.editAviso(target);
      fixture.detectChanges();

      expect(component.isAvisoModalOpen()).toBe(true);
      expect(component.editingAvisoId()).toBe('av-1');
      expect(component.avisoForm.value.titulo).toBe(target.titulo);
      expect(component.avisoForm.value.expira_em).toBe(target.expira_em);

      component.avisoForm.patchValue({
        titulo: 'Culto de Ano Novo Atualizado',
      });

      await component.saveAviso();
      fixture.detectChanges();

      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          titulo: 'Culto de Ano Novo Atualizado',
        }),
        'av-1',
      );
      expect(toastSpy).toHaveBeenCalledWith(expect.stringContaining('atualizado'));
    });

    it('alterna status de aviso especial via toggleAvisoStatus', async () => {
      const saveSpy = vi.spyOn(cmsService, 'saveAvisoHorario').mockResolvedValue('av-1');
      const toastSpy = vi.spyOn(toastService, 'success');

      const target = mockAvisos[0]; // ativo: true
      await component.toggleAvisoStatus(target);
      fixture.detectChanges();

      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ativo: false,
        }),
        'av-1',
      );
      expect(toastSpy).toHaveBeenCalledWith(expect.stringContaining('pausado'));
    });

    it('exclui aviso especial após confirmação', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const deleteSpy = vi.spyOn(cmsService, 'deleteAvisoHorario').mockResolvedValue();
      const toastSpy = vi.spyOn(toastService, 'success');

      const target = mockAvisos[0];
      await component.deleteAviso(target);
      fixture.detectChanges();

      expect(deleteSpy).toHaveBeenCalledWith('av-1');
      expect(toastSpy).toHaveBeenCalledWith(expect.stringContaining('removido'));
    });
  });

  describe('Atalhos de teclado e compatibilidade', () => {
    it('fecha modais ao pressionar tecla Escape', () => {
      component.openRegularModal();
      expect(component.isRegularModalOpen()).toBe(true);
      component.onEscape();
      expect(component.isRegularModalOpen()).toBe(false);

      component.openAvisoModal();
      expect(component.isAvisoModalOpen()).toBe(true);
      component.onEscape();
      expect(component.isAvisoModalOpen()).toBe(false);
    });
  });
});

