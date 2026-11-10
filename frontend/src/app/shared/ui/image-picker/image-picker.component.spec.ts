import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImagePickerComponent } from './image-picker.component';
import { ToastService } from '../toast/toast.service';

describe('ImagePickerComponent', () => {
  let fixture: ComponentFixture<ImagePickerComponent>;
  let component: ImagePickerComponent;
  let toastService: ToastService;

  beforeEach(async () => {
    // Garantir stubs para createObjectURL e revokeObjectURL caso ambiente jsdom não possua
    if (typeof URL.createObjectURL !== 'function') {
      URL.createObjectURL = () => 'blob:mock-url';
    }
    if (typeof URL.revokeObjectURL !== 'function') {
      URL.revokeObjectURL = () => {};
    }

    await TestBed.configureTestingModule({
      imports: [ImagePickerComponent],
      providers: [ToastService],
    }).compileComponents();

    fixture = TestBed.createComponent(ImagePickerComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve renderizar a zona de drag-and-drop quando value for vazio', () => {
    const dropZone = fixture.nativeElement.querySelector('[role="button"]');
    expect(dropZone).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Clique para enviar');
    expect(fixture.nativeElement.textContent).toContain('Recomendado JPG, PNG ou WebP até 5MB');
  });

  it('deve renderizar a prévia da imagem e botões de ação quando value for informado', () => {
    fixture.componentRef.setInput('value', 'https://example.com/banner.jpg');
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('https://example.com/banner.jpg');

    const removeBtn = fixture.nativeElement.querySelector('[aria-label="Remover imagem"]');
    expect(removeBtn).not.toBeNull();
  });

  it('deve emitir imageRemoved e urlChanged ao clicar no botão de remover', () => {
    fixture.componentRef.setInput('value', 'https://example.com/banner.jpg');
    fixture.detectChanges();

    let removedEmitted = false;
    let urlChangedValue: string | null = null;

    component.imageRemoved.subscribe(() => {
      removedEmitted = true;
    });

    component.urlChanged.subscribe((val) => {
      urlChangedValue = val;
    });

    component.onRemove();

    expect(removedEmitted).toBe(true);
    expect(urlChangedValue).toBe('');
    expect(component.localPreview()).toBeNull();
  });

  it('deve validar tipo MIME inválido e exibir toast de erro', () => {
    const errorSpy = vi.spyOn(toastService, 'error');
    let emitted = false;
    component.imageSelected.subscribe(() => {
      emitted = true;
    });

    const invalidFile = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });
    (component as any).handleFile(invalidFile);

    expect(errorSpy).toHaveBeenCalledWith('Formato inválido. Selecione uma imagem JPG, PNG ou WebP.');
    expect(emitted).toBe(false);
  });

  it('deve validar tamanho máximo do arquivo e exibir toast de erro', () => {
    const errorSpy = vi.spyOn(toastService, 'error');
    let emitted = false;
    component.imageSelected.subscribe(() => {
      emitted = true;
    });

    fixture.componentRef.setInput('maxSizeMb', 2);
    fixture.detectChanges();

    // Cria um arquivo de 3MB
    const largeContent = new Uint8Array(3 * 1024 * 1024);
    const largeFile = new File([largeContent], 'heavy.png', { type: 'image/png' });
    (component as any).handleFile(largeFile);

    expect(errorSpy).toHaveBeenCalledWith('O arquivo excede o limite de 2MB.');
    expect(emitted).toBe(false);
  });

  it('deve emitir imageSelected e definir localPreview quando arquivo for válido', () => {
    let emittedFile: File | null = null;
    component.imageSelected.subscribe((f) => {
      emittedFile = f;
    });

    const validFile = new File(['image-bytes'], 'banner.webp', { type: 'image/webp' });
    (component as any).handleFile(validFile);

    expect(emittedFile).toBe(validFile);
    expect(component.localPreview()).toBeTruthy();
  });

  it('deve atualizar o estado isDragging em eventos dragover e dragleave', () => {
    const dummyEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as DragEvent;

    component.onDragOver(dummyEvent);
    expect(component.isDragging()).toBe(true);

    component.onDragLeave(dummyEvent);
    expect(component.isDragging()).toBe(false);
  });

  it('deve processar arquivo no evento onDrop', () => {
    let emittedFile: File | null = null;
    component.imageSelected.subscribe((f) => {
      emittedFile = f;
    });

    const validFile = new File(['image-bytes'], 'banner.jpg', { type: 'image/jpeg' });
    const dropEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: {
        files: [validFile],
      },
    } as unknown as DragEvent;

    component.onDrop(dropEvent);
    expect(component.isDragging()).toBe(false);
    expect(emittedFile).toBe(validFile);
  });

  it('deve alternar a seção de URL e emitir urlChanged ao aplicar', () => {
    let urlEmitted: string | null = null;
    component.urlChanged.subscribe((url) => {
      urlEmitted = url;
    });

    component.toggleUrlInput();
    expect(component.showUrlInput()).toBe(true);

    component.urlInputValue.set('  https://images.unsplash.com/photo-test  ');
    component.applyUrl();

    expect(urlEmitted).toBe('https://images.unsplash.com/photo-test');
  });

  it('deve emitir toast warning ao disparar erro de imagem', () => {
    const warningSpy = vi.spyOn(toastService, 'warning');
    component.onImageError();
    expect(warningSpy).toHaveBeenCalledWith('Não foi possível carregar a prévia da imagem informada.');
  });
});
