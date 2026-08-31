import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { ToastService } from '../toast/toast.service';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  selector: 'app-ui-image-picker',
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full space-y-2">
      @if (label()) {
        <label class="block text-xs font-semibold uppercase tracking-wider text-advent-text select-none">
          {{ label() }}
        </label>
      }

      <!-- File input escondido -->
      <input
        #fileInput
        type="file"
        class="sr-only"
        accept="image/jpeg,image/png,image/webp"
        (change)="onFileSelected($event)"
        tabindex="-1"
        aria-hidden="true"
      />

      <!-- Preview ou Zona de Upload -->
      @if (displayPreview()) {
        <div class="relative overflow-hidden rounded-2xl border border-advent-border bg-slate-50 group">
          <div class="relative aspect-video w-full overflow-hidden bg-slate-100 flex items-center justify-center">
            <img
              [src]="displayPreview()"
              [alt]="label() || 'Prévia da imagem'"
              class="h-full w-full object-cover"
              (error)="onImageError()"
            />

            <!-- Ações em Overlay (Desktop / Hover) -->
            <div
              class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 p-4"
            >
              <app-ui-button
                [variant]="'outline'"
                [size]="'sm'"
                (click)="triggerFileInput()"
                class="min-h-[44px]"
                aria-label="Trocar imagem"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Trocar
              </app-ui-button>

              <app-ui-button
                [variant]="'danger'"
                [size]="'sm'"
                (click)="onRemove()"
                class="min-h-[44px]"
                aria-label="Remover imagem"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Remover
              </app-ui-button>
            </div>
          </div>

          <!-- Barra de Ações Mobile / Touch (visível em telas pequenas) -->
          <div class="flex items-center justify-between p-2.5 bg-white border-t border-advent-border sm:hidden">
            <span class="text-xs text-advent-muted truncate max-w-[180px]">Imagem selecionada</span>
            <div class="flex gap-2">
              <app-ui-button [variant]="'outline'" [size]="'sm'" (click)="triggerFileInput()" aria-label="Trocar imagem">
                Trocar
              </app-ui-button>
              <app-ui-button [variant]="'danger'" [size]="'sm'" (click)="onRemove()" aria-label="Remover imagem">
                Remover
              </app-ui-button>
            </div>
          </div>
        </div>
      } @else {
        <!-- Zona Drag-and-Drop -->
        <div
          class="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer focus-within:ring-2 focus-within:ring-advent-blue focus-within:outline-none"
          [class.border-advent-blue]="isDragging()"
          [class.bg-advent-blue/5]="isDragging()"
          [class.border-advent-border]="!isDragging()"
          [class.hover:border-advent-blue/60]="!isDragging()"
          [class.hover:bg-slate-50]="!isDragging()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
          (click)="triggerFileInput()"
          (keydown.enter)="triggerFileInput()"
          (keydown.space)="triggerFileInput(); $event.preventDefault()"
          tabindex="0"
          role="button"
          [attr.aria-label]="label() || 'Selecionar ou soltar imagem'"
        >
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-advent-blue/10 text-advent-blue mb-3">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>

          <p class="text-sm font-medium text-advent-text">
            <span class="text-advent-blue font-semibold hover:underline">Clique para enviar</span>
            ou arraste e solte o arquivo aqui
          </p>

          @if (helpText()) {
            <p class="text-xs text-advent-muted mt-1">
              {{ helpText() }}
            </p>
          }
        </div>
      }

      <!-- Seção retrátil para URL direta -->
      <div class="pt-1">
        <button
          type="button"
          (click)="toggleUrlInput()"
          class="inline-flex items-center gap-1.5 text-xs font-medium text-advent-blue hover:text-advent-blue-dark transition-colors py-1 cursor-pointer min-h-[44px]"
          [attr.aria-expanded]="showUrlInput()"
        >
          <svg
            class="h-3.5 w-3.5 transition-transform duration-200"
            [class.rotate-90]="showUrlInput()"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span>{{ showUrlInput() ? 'Ocultar inserção por URL' : 'Ou colar link direto de imagem (URL)' }}</span>
        </button>

        @if (showUrlInput()) {
          <div class="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="url"
              [value]="urlInputValue()"
              (input)="onUrlInput($event)"
              (keydown.enter)="applyUrl()"
              placeholder="https://exemplo.com/imagem.webp"
              class="flex-1 rounded-xl border border-advent-border bg-white px-3.5 py-2.5 text-xs text-advent-text placeholder:text-advent-muted focus:border-advent-blue focus:ring-2 focus:ring-advent-blue/20 focus:outline-none min-h-[44px]"
              aria-label="URL direta da imagem"
            />
            <app-ui-button
              [variant]="'outline'"
              [size]="'sm'"
              (click)="applyUrl()"
              class="min-h-[44px]"
            >
              Aplicar URL
            </app-ui-button>
          </div>
        }
      </div>
    </div>
  `,
})
export class ImagePickerComponent implements OnDestroy {
  private readonly toastService = inject(ToastService);

  readonly value = input<string>('');
  readonly label = input<string>('Imagem / Banner');
  readonly helpText = input<string>('Recomendado JPG, PNG ou WebP até 5MB');
  readonly maxSizeMb = input<number>(5);

  readonly imageSelected = output<File>();
  readonly imageRemoved = output<void>();
  readonly urlChanged = output<string>();

  // ponytail: local object URL preview with auto-revocation
  readonly localPreview = signal<string | null>(null);
  readonly isDragging = signal<boolean>(false);
  readonly showUrlInput = signal<boolean>(false);
  readonly urlInputValue = signal<string>('');

  readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  readonly displayPreview = computed(() => {
    return this.localPreview() || this.value() || null;
  });

  ngOnDestroy(): void {
    this.revokeLocalPreview();
  }

  triggerFileInput(): void {
    this.fileInput()?.nativeElement.click();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
      input.value = '';
    }
  }

  private handleFile(file: File): void {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      this.toastService.error('Formato inválido. Selecione uma imagem JPG, PNG ou WebP.');
      return;
    }

    const maxBytes = this.maxSizeMb() * 1024 * 1024;
    if (file.size > maxBytes) {
      this.toastService.error(`O arquivo excede o limite de ${this.maxSizeMb()}MB.`);
      return;
    }

    this.revokeLocalPreview();

    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      const preview = URL.createObjectURL(file);
      this.localPreview.set(preview);
    }

    this.imageSelected.emit(file);
  }

  onRemove(): void {
    this.revokeLocalPreview();
    this.localPreview.set(null);
    this.urlInputValue.set('');
    if (this.fileInput()) {
      this.fileInput()!.nativeElement.value = '';
    }
    this.imageRemoved.emit();
    this.urlChanged.emit('');
  }

  toggleUrlInput(): void {
    this.showUrlInput.update((v) => !v);
  }

  onUrlInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.urlInputValue.set(input.value);
  }

  applyUrl(): void {
    const url = this.urlInputValue().trim();
    if (url) {
      this.revokeLocalPreview();
      this.localPreview.set(null);
      this.urlChanged.emit(url);
    }
  }

  onImageError(): void {
    this.toastService.warning('Não foi possível carregar a prévia da imagem informada.');
  }

  private revokeLocalPreview(): void {
    const current = this.localPreview();
    if (current && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(current);
    }
  }
}
