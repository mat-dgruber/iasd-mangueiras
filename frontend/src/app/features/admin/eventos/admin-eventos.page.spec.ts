import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminEventosPage } from './admin-eventos.page';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { FirebaseService } from '../../../core/firebase/firebase.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Evento } from '../../../core/models/content.models';

describe('AdminEventosPage', () => {
  let fixture: ComponentFixture<AdminEventosPage>;
  let component: AdminEventosPage;
  let mockCmsService: Partial<AdminCmsService>;
  let mockToastService: Partial<ToastService>;

  beforeEach(async () => {
    mockCmsService = {
      getEventos: vi.fn().mockResolvedValue([]),
      saveEvento: vi.fn().mockResolvedValue('event-123'),
      deleteEvento: vi.fn().mockResolvedValue(undefined),
      uploadBanner: vi.fn().mockResolvedValue('https://storage.mock/banner.jpg'),
    };

    mockToastService = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AdminEventosPage],
      providers: [
        { provide: AdminCmsService, useValue: mockCmsService },
        { provide: FirebaseService, useValue: { firestore: null, auth: null, storage: null } },
        { provide: ToastService, useValue: mockToastService },
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
    ).map((el: any) => el.textContent?.trim());

    expect(labels).toContain('Data Início');
    expect(labels).toContain('Data Fim');
    expect(labels).toContain('Endereço');
    expect(labels).toContain('WhatsApp de Contato');
  });

  it('integra ImagePicker atualizando a URL do banner ou selecionando arquivo', () => {
    component.openModal();
    fixture.detectChanges();

    component.onUrlChanged('https://cdn.exemplo.com/cartaz.png');
    expect(component.eventoForm.get('banner_url')?.value).toBe('https://cdn.exemplo.com/cartaz.png');

    component.onImageRemoved();
    expect(component.eventoForm.get('banner_url')?.value).toBe('');

    const testFile = new File(['mock'], 'banner.jpg', { type: 'image/jpeg' });
    component.onImageSelected(testFile);
    expect(component['selectedFile']).toBe(testFile);
  });

  it('abre diálogo de confirmação ao solicitar exclusão e executa deleteEvento', async () => {
    const evento: Evento = {
      id: 'ev-1',
      titulo: 'Retiro Espiritual',
      data: '20 a 22 de Outubro',
      horario: '18:00',
      descricao: 'Retiro com toda a igreja.',
    };
    component.eventos.set([evento]);
    fixture.detectChanges();

    expect(component.eventoToDelete()).toBeNull();

    component.confirmDelete(evento);
    fixture.detectChanges();

    expect(component.eventoToDelete()).toEqual(evento);

    await component.executeDeleteEvento();
    fixture.detectChanges();

    expect(mockCmsService.deleteEvento).toHaveBeenCalledWith('ev-1');
    expect(component.eventoToDelete()).toBeNull();
    expect(component.eventos()).not.toContain(evento);
  });

  it('exibe mensagens de validação inline para campos obrigatórios', () => {
    component.openModal();
    fixture.detectChanges();

    const tituloCtrl = component.eventoForm.get('titulo');
    tituloCtrl?.setValue('');
    tituloCtrl?.markAsTouched();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('O título é obrigatório.');
  });
});
