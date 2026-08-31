import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminEscalasPage } from './admin-escalas.page';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { FirebaseService } from '../../../core/firebase/firebase.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { EscalaItem } from '../../../core/models/content.models';

describe('AdminEscalasPage', () => {
  let fixture: ComponentFixture<AdminEscalasPage>;
  let component: AdminEscalasPage;
  let cmsService: AdminCmsService;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEscalasPage],
      providers: [
        provideRouter([]),
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
    cmsService = TestBed.inject(AdminCmsService);
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  it('exibe título principal de escalas e botões de ação', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Escalas dos Departamentos');
    expect(el.textContent).toContain('Copiar Escala WhatsApp');
    expect(el.textContent).toContain('Nova Escala');
  });

  it('abre e fecha o modal de cadastro de escala', () => {
    expect(component.isModalOpen()).toBe(false);
    component.openCreateModal();
    expect(component.isModalOpen()).toBe(true);
    component.closeModal();
    expect(component.isModalOpen()).toBe(false);
  });

  it('abre modal em modo de edição com dados pré-preenchidos', () => {
    const mockEscala: EscalaItem = {
      id: 'escala-test',
      departamento: 'Diaconato',
      data: '2026-09-05',
      dia_semana: 'Sábado',
      oficiais: ['Paulo', 'Gabriel'],
      horario: '08:30',
      observacoes: 'Chegar antes',
    };

    component.openEditModal(mockEscala);
    expect(component.isModalOpen()).toBe(true);
    expect(component.editingEscala()).toEqual(mockEscala);
    expect(component.escalaForm.get('departamento')?.value).toBe('Diaconato');
    expect(component.escalaForm.get('oficiaisStr')?.value).toBe('Paulo, Gabriel');
  });

  it('exibe skeletons durante o carregamento', () => {
    component.isLoading.set(true);
    fixture.detectChanges();

    const skeletons = fixture.nativeElement.querySelectorAll('app-ui-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('exibe empty state com botão de ação quando a lista está vazia', () => {
    component.isLoading.set(false);
    component.escalas.set([]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Nenhuma escala cadastrada');
    expect(text).toContain('+ Nova Escala');
  });

  it('filtra escalas por departamento', () => {
    component.escalas.set([
      {
        id: '1',
        departamento: 'Diaconato',
        data: '2026-09-05',
        dia_semana: 'Sábado',
        oficiais: ['Oficial A'],
      },
      {
        id: '2',
        departamento: 'Recepção',
        data: '2026-09-05',
        dia_semana: 'Sábado',
        oficiais: ['Oficial B'],
      },
    ]);

    component.selectedDept.set('Diaconato');
    fixture.detectChanges();

    expect(component.filteredEscalas().length).toBe(1);
    expect(component.filteredEscalas()[0].departamento).toBe('Diaconato');
  });

  it('abre diálogo de confirmação de exclusão e remove a escala', async () => {
    const mockEscala: EscalaItem = {
      id: 'escala-del',
      departamento: 'Sonorização & Transmissão',
      data: '2026-09-05',
      dia_semana: 'Sábado',
      oficiais: ['Lucas'],
    };
    component.escalas.set([mockEscala]);
    vi.spyOn(cmsService, 'deleteEscala').mockResolvedValue();
    vi.spyOn(toastService, 'success');

    component.confirmDelete(mockEscala);
    expect(component.escalaToDelete()).toEqual(mockEscala);

    await component.executeDeleteEscala();
    expect(cmsService.deleteEscala).toHaveBeenCalledWith('escala-del');
    expect(component.escalas().length).toBe(0);
    expect(component.escalaToDelete()).toBeNull();
    expect(toastService.success).toHaveBeenCalledWith('Escala de Sonorização & Transmissão excluída.');
  });

  it('copia escala individual para o WhatsApp via ToastService', () => {
    vi.spyOn(toastService, 'success');
    const mockEscala: EscalaItem = {
      id: 'escala-wpp',
      departamento: 'Música & Louvor',
      data: '2026-09-05',
      dia_semana: 'Sábado',
      oficiais: ['Maria', 'João'],
      horario: '10:00',
    };

    component.copySingleEscalaWhatsApp(mockEscala);
    expect(toastService.success).toHaveBeenCalledWith('Escala copiada para a área de transferência!');
  });

  it('extrai lista ordenada e única de oficiais para sugestão', () => {
    component.escalas.set([
      {
        id: '1',
        departamento: 'Diaconato',
        data: '2026-09-05',
        dia_semana: 'Sábado',
        oficiais: ['Matheus Diniz', 'Paulo Roberto'],
      },
      {
        id: '2',
        departamento: 'Recepção',
        data: '2026-09-05',
        dia_semana: 'Sábado',
        oficiais: ['Paulo Roberto', 'Ana Lima'],
      },
    ]);

    expect(component.uniqueOficiais()).toEqual(['Ana Lima', 'Matheus Diniz', 'Paulo Roberto']);
  });

  it('atualiza automaticamente dia da semana ao selecionar uma data no formulário', () => {
    component.escalaForm.get('data')?.setValue('2026-09-05'); // 2026-09-05 é Sábado
    expect(component.escalaForm.get('dia_semana')?.value).toBe('Sábado');

    component.escalaForm.get('data')?.setValue('2026-09-06'); // 2026-09-06 é Domingo
    expect(component.escalaForm.get('dia_semana')?.value).toBe('Domingo');

    component.escalaForm.get('data')?.setValue('2026-09-09'); // 2026-09-09 é Quarta
    expect(component.escalaForm.get('dia_semana')?.value).toBe('Quarta');
  });

  it('adiciona oficial via método appendOficial sem duplicar', () => {
    component.escalaForm.get('oficiaisStr')?.setValue('');
    component.appendOficial('Matheus Diniz');
    expect(component.escalaForm.get('oficiaisStr')?.value).toBe('Matheus Diniz');

    component.appendOficial('Lucas Oliveira');
    expect(component.escalaForm.get('oficiaisStr')?.value).toBe('Matheus Diniz, Lucas Oliveira');

    // Não deve duplicar se já existir
    component.appendOficial('Matheus Diniz');
    expect(component.escalaForm.get('oficiaisStr')?.value).toBe('Matheus Diniz, Lucas Oliveira');
  });

  it('renderiza o botão com link para o portal público de escalas', () => {
    const link = fixture.nativeElement.querySelector('a[href="/escalas"]');
    expect(link).toBeDefined();
    expect(fixture.nativeElement.textContent).toContain('Ver Portal Público');
  });
});
