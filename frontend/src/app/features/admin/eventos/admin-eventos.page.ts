import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { Evento } from '../../../core/models/content.models';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { ImagePickerComponent } from '../../../shared/ui/image-picker/image-picker.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import defaultEventos from '../../../../content/eventos.json';

@Component({
  selector: 'app-admin-eventos-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ConfirmDialogComponent,
    ImagePickerComponent,
    ModalComponent,
    SkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-advent-text md:text-3xl">
            Eventos & Programações
          </h1>
          <p class="text-sm text-advent-muted mt-1">
            Cadastre eventos com banners ilustrativos, oradores convidados, público-alvo, datas estruturadas e links de inscrição.
          </p>
        </div>

        <button
          type="button"
          (click)="openModal()"
          class="rounded-card bg-advent-blue px-5 py-2.5 text-xs font-semibold text-white shadow transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner cursor-pointer min-h-[40px] flex items-center justify-center gap-1.5"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Evento
        </button>
      </header>

      <!-- Listagem de Eventos -->
      <div class="mt-8 space-y-4">
        @if (isLoading()) {
          <div class="grid gap-4">
            @for (i of [1, 2, 3]; track i) {
              <div class="rounded-2xl border border-advent-border bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div class="flex items-start gap-4 flex-1">
                  <div class="h-20 w-28 shrink-0 hidden sm:block">
                    <app-ui-skeleton width="100%" height="100%" rounded="lg" />
                  </div>
                  <div class="space-y-2 flex-1">
                    <div class="flex gap-2">
                      <app-ui-skeleton width="120px" height="20px" rounded="sm" />
                      <app-ui-skeleton width="80px" height="20px" rounded="sm" />
                    </div>
                    <app-ui-skeleton width="50%" height="22px" rounded="md" />
                    <app-ui-skeleton width="90%" height="16px" rounded="sm" />
                  </div>
                </div>
                <div class="flex gap-2 shrink-0">
                  <app-ui-skeleton width="70px" height="36px" rounded="md" />
                  <app-ui-skeleton width="70px" height="36px" rounded="md" />
                </div>
              </div>
            }
          </div>
        } @else if (eventos().length === 0) {
          <div class="rounded-2xl border border-dashed border-advent-border bg-white p-12 text-center text-advent-muted flex flex-col items-center justify-center">
            <svg class="h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
            </svg>
            <p class="font-medium text-advent-text mb-1">Nenhum evento cadastrado no momento</p>
            <p class="text-xs text-advent-muted mb-4 max-w-sm">Cadastre eventos e programações especiais da congregação para visualização dos membros.</p>
            <button
              type="button"
              (click)="openModal()"
              class="rounded-card bg-advent-blue px-4 py-2 text-xs font-semibold text-white shadow hover:bg-advent-blue-dark active:scale-[0.98] transition-all cursor-pointer min-h-[40px] inline-flex items-center gap-1.5"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>+ Novo Evento</span>
            </button>
          </div>
        } @else {
          <div class="grid gap-4">
            @for (evento of eventos(); track (evento.id || evento.titulo)) {
              <article class="flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-2xl border border-advent-border bg-white p-5 shadow-xs hover:border-advent-blue/40 transition-colors">
                <div class="flex items-start gap-4">
                  <!-- Thumbnail do Banner se existir -->
                  @if (evento.banner_url || evento.imagem_url) {
                    <div class="h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-advent-border bg-slate-100 hidden sm:block">
                      <img
                        [src]="evento.banner_url || evento.imagem_url"
                        [alt]="evento.titulo"
                        class="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  }

                  <div class="space-y-1.5">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="rounded-md bg-advent-blue/10 px-2.5 py-0.5 text-xs font-bold uppercase text-advent-blue">
                        {{ evento.data }} • {{ evento.horario }}
                      </span>

                      @if (evento.destaque) {
                        <span class="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 flex items-center gap-1">
                          ⭐ Destaque
                        </span>
                      }

                      @if (evento.departamento) {
                        <span class="rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
                          {{ evento.departamento }}
                        </span>
                      }

                      @if (evento.valor_entrada) {
                        <span class="rounded-md bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                          {{ evento.valor_entrada }}
                        </span>
                      }
                    </div>

                    <h2 class="text-lg font-bold text-advent-text">{{ evento.titulo }}</h2>

                    @if (evento.palestrante) {
                      <p class="text-xs font-semibold text-advent-blue">
                        🎙️ Orador/Convidado: {{ evento.palestrante }}
                      </p>
                    }

                    <p class="text-xs text-advent-muted max-w-2xl leading-relaxed">{{ evento.descricao }}</p>

                    @if (evento.endereco || evento.local) {
                      <p class="inline-flex items-center gap-1 text-xs text-advent-muted">
                        <svg class="h-3.5 w-3.5 shrink-0 text-advent-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {{ evento.endereco || evento.local }}
                      </p>
                    }
                  </div>
                </div>

                <div class="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    (click)="editEvento(evento)"
                    class="rounded-lg px-3.5 py-2 text-xs font-semibold text-advent-blue bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer min-h-[36px] flex items-center"
                    aria-label="Editar evento {{ evento.titulo }}"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    (click)="confirmDelete(evento)"
                    class="rounded-lg px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer min-h-[36px] flex items-center"
                    aria-label="Excluir evento {{ evento.titulo }}"
                  >
                    Excluir
                  </button>
                </div>
              </article>
            }
          </div>
        }
      </div>

      <!-- Modal de Criação / Edição -->
      <app-ui-modal
        [isOpen]="isModalOpen()"
        [title]="editingId() ? 'Editar Evento' : 'Novo Evento'"
        [size]="'lg'"
        (close)="closeModal()"
      >
        <form [formGroup]="eventoForm" (ngSubmit)="saveEvento()" class="space-y-4">
          <!-- Título e Departamento -->
          <div class="grid gap-3 sm:grid-cols-3">
            <div class="sm:col-span-2">
              <label for="evento-titulo" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                Título do Evento *
              </label>
              <input
                id="evento-titulo"
                type="text"
                formControlName="titulo"
                class="w-full rounded-card border px-3.5 py-2 text-sm text-advent-text focus:outline-none transition-colors"
                [class.border-red-500]="eventoForm.get('titulo')?.invalid && eventoForm.get('titulo')?.touched"
                [class.border-advent-border]="!eventoForm.get('titulo')?.invalid || !eventoForm.get('titulo')?.touched"
                [class.focus:border-advent-blue]="!eventoForm.get('titulo')?.invalid || !eventoForm.get('titulo')?.touched"
                [class.focus:border-red-500]="eventoForm.get('titulo')?.invalid && eventoForm.get('titulo')?.touched"
                placeholder="Ex: Semana de Oração da Família"
              />
              @if (eventoForm.get('titulo')?.invalid && eventoForm.get('titulo')?.touched) {
                <p class="mt-1 text-xs text-red-600">
                  @if (eventoForm.get('titulo')?.errors?.['required']) {
                    O título é obrigatório.
                  } @else if (eventoForm.get('titulo')?.errors?.['minlength']) {
                    O título deve ter no mínimo 3 caracteres.
                  }
                </p>
              }
            </div>
            <div>
              <label for="evento-departamento" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                Departamento
              </label>
              <select
                id="evento-departamento"
                formControlName="departamento"
                class="w-full rounded-card border border-advent-border px-3 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none bg-white transition-colors"
              >
                <option value="">Geral / Igreja</option>
                <option value="Jovens (JA)">Jovens (JA)</option>
                <option value="Ministério da Mulher">Ministério da Mulher</option>
                <option value="Desbravadores & Aventureiros">Desbravadores & Aventureiros</option>
                <option value="Família">Família</option>
                <option value="Música & Louvor">Música & Louvor</option>
                <option value="Ministério Infantil">Ministério Infantil</option>
                <option value="Evangelismo">Evangelismo</option>
              </select>
            </div>
          </div>

          <!-- Data, Horário e Local -->
          <div class="grid gap-3 sm:grid-cols-3">
            <div>
              <label for="evento-data" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                Data / Período *
              </label>
              <input
                id="evento-data"
                type="text"
                formControlName="data"
                class="w-full rounded-card border px-3.5 py-2 text-sm text-advent-text focus:outline-none transition-colors"
                [class.border-red-500]="eventoForm.get('data')?.invalid && eventoForm.get('data')?.touched"
                [class.border-advent-border]="!eventoForm.get('data')?.invalid || !eventoForm.get('data')?.touched"
                [class.focus:border-advent-blue]="!eventoForm.get('data')?.invalid || !eventoForm.get('data')?.touched"
                [class.focus:border-red-500]="eventoForm.get('data')?.invalid && eventoForm.get('data')?.touched"
                placeholder="Ex: 15 a 22 de Março"
              />
              @if (eventoForm.get('data')?.invalid && eventoForm.get('data')?.touched) {
                <p class="mt-1 text-xs text-red-600">A data ou período é obrigatório.</p>
              }
            </div>

            <div>
              <label for="evento-horario" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                Horário *
              </label>
              <input
                id="evento-horario"
                type="text"
                formControlName="horario"
                class="w-full rounded-card border px-3.5 py-2 text-sm text-advent-text focus:outline-none transition-colors"
                [class.border-red-500]="eventoForm.get('horario')?.invalid && eventoForm.get('horario')?.touched"
                [class.border-advent-border]="!eventoForm.get('horario')?.invalid || !eventoForm.get('horario')?.touched"
                [class.focus:border-advent-blue]="!eventoForm.get('horario')?.invalid || !eventoForm.get('horario')?.touched"
                [class.focus:border-red-500]="eventoForm.get('horario')?.invalid && eventoForm.get('horario')?.touched"
                placeholder="Ex: 19:30"
              />
              @if (eventoForm.get('horario')?.invalid && eventoForm.get('horario')?.touched) {
                <p class="mt-1 text-xs text-red-600">O horário é obrigatório.</p>
              }
            </div>

            <div>
              <label for="evento-local" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                Local
              </label>
              <input
                id="evento-local"
                type="text"
                formControlName="local"
                class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none transition-colors"
                placeholder="Ex: Templo Principal"
              />
            </div>
          </div>

          <!-- Datas Estruturadas (Início e Fim) -->
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label for="evento-data-inicio" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                Data Início
              </label>
              <input
                id="evento-data-inicio"
                type="date"
                formControlName="data_inicio"
                class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label for="evento-data-fim" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                Data Fim
              </label>
              <input
                id="evento-data-fim"
                type="date"
                formControlName="data_fim"
                class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none transition-colors"
              />
            </div>
          </div>

          <!-- Endereço Completo e WhatsApp de Contato -->
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label for="evento-endereco" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                Endereço
              </label>
              <input
                id="evento-endereco"
                type="text"
                formControlName="endereco"
                class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none transition-colors"
                placeholder="Ex: Rua Chiquinha Rodrigues, 1005 - Tatuí, SP"
              />
            </div>

            <div>
              <label for="evento-whatsapp" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                WhatsApp de Contato
              </label>
              <input
                id="evento-whatsapp"
                type="text"
                formControlName="whatsapp_contato"
                class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none transition-colors"
                placeholder="Ex: 5515999999999"
              />
            </div>
          </div>

          <!-- Palestrante, Entrada e Público -->
          <div class="grid gap-3 sm:grid-cols-3">
            <div>
              <label for="evento-palestrante" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                Orador / Palestrante
              </label>
              <input
                id="evento-palestrante"
                type="text"
                formControlName="palestrante"
                class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none transition-colors"
                placeholder="Ex: Pr. Luís Gonçalves"
              />
            </div>

            <div>
              <label for="evento-valor" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                Entrada / Valor
              </label>
              <input
                id="evento-valor"
                type="text"
                formControlName="valor_entrada"
                class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none transition-colors"
                placeholder="Ex: Gratuito / 1kg de Alimento"
              />
            </div>

            <div>
              <label for="evento-publico" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                Público-Alvo
              </label>
              <input
                id="evento-publico"
                type="text"
                formControlName="publico_alvo"
                class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none transition-colors"
                placeholder="Ex: Toda a Igreja / Casais"
              />
            </div>
          </div>

          <!-- Link de Inscrição -->
          <div>
            <label for="evento-link" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
              Link de Inscrição / Ingressos
            </label>
            <input
                id="evento-link"
                type="text"
                formControlName="link_inscricao"
                class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none transition-colors"
                placeholder="https://forms.gle/... ou https://wa.me/..."
            />
          </div>

          <!-- Image Picker para Banner / Imagem do Evento -->
          <div>
            <app-ui-image-picker
              [value]="eventoForm.get('banner_url')?.value || ''"
              label="Banner / Imagem do Evento"
              helpText="Recomendado JPG, PNG ou WebP até 5MB"
              (imageSelected)="onImageSelected($event)"
              (imageRemoved)="onImageRemoved()"
              (urlChanged)="onUrlChanged($event)"
            />
          </div>

          <!-- Descrição do Evento -->
          <div>
            <label for="evento-descricao" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
              Descrição do Evento *
            </label>
            <textarea
              id="evento-descricao"
              rows="3"
              formControlName="descricao"
              class="w-full rounded-card border px-3.5 py-2 text-sm text-advent-text focus:outline-none transition-colors"
              [class.border-red-500]="eventoForm.get('descricao')?.invalid && eventoForm.get('descricao')?.touched"
              [class.border-advent-border]="!eventoForm.get('descricao')?.invalid || !eventoForm.get('descricao')?.touched"
              [class.focus:border-advent-blue]="!eventoForm.get('descricao')?.invalid || !eventoForm.get('descricao')?.touched"
              [class.focus:border-red-500]="eventoForm.get('descricao')?.invalid && eventoForm.get('descricao')?.touched"
              placeholder="Informações completas sobre o evento, cronograma e orientações aos participantes..."
            ></textarea>
            @if (eventoForm.get('descricao')?.invalid && eventoForm.get('descricao')?.touched) {
              <p class="mt-1 text-xs text-red-600">
                @if (eventoForm.get('descricao')?.errors?.['required']) {
                  A descrição é obrigatória.
                } @else if (eventoForm.get('descricao')?.errors?.['minlength']) {
                  A descrição deve ter no mínimo 5 caracteres.
                }
              </p>
            }
          </div>

          <!-- Checkbox de Destaque -->
          <div class="flex items-center gap-2 pt-1">
            <input
              id="evento-destaque"
              type="checkbox"
              formControlName="destaque"
              class="h-4 w-4 rounded border-advent-border text-advent-blue focus:ring-advent-blue"
            />
            <label for="evento-destaque" class="text-xs font-semibold text-advent-text cursor-pointer">
              ⭐ Destacar este evento no topo da página e na Home
            </label>
          </div>

          <!-- Ações do Modal -->
          <div class="mt-6 flex justify-end gap-2 pt-3 border-t border-advent-border">
            <button
              type="button"
              (click)="closeModal()"
              class="rounded-card border border-advent-border px-4 py-2 text-xs font-semibold text-advent-text hover:bg-slate-50 transition-colors cursor-pointer min-h-[36px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="eventoForm.invalid || isSaving()"
              class="rounded-card bg-advent-blue px-6 py-2 text-xs font-semibold text-white shadow hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner disabled:opacity-50 transition-all cursor-pointer min-h-[36px]"
            >
              {{ isSaving() ? 'Salvando...' : 'Salvar Evento' }}
            </button>
          </div>
        </form>
      </app-ui-modal>

      <!-- Diálogo de Confirmação de Exclusão -->
      <app-ui-confirm-dialog
        [isOpen]="!!eventoToDelete()"
        title="Excluir Evento"
        [message]="'Tem certeza que deseja excluir o evento &quot;' + (eventoToDelete()?.titulo || '') + '&quot;? Esta ação não pode ser desfeita.'"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        [isLoading]="isDeleting()"
        (confirmed)="executeDeleteEvento()"
        (cancelled)="eventoToDelete.set(null)"
      />
    </div>
  `,
})
export class AdminEventosPage implements OnInit {
  private readonly cmsService = inject(AdminCmsService);
  private readonly toastService = inject(ToastService);

  readonly eventos = signal<Evento[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isSaving = signal<boolean>(false);
  readonly isDeleting = signal<boolean>(false);
  readonly isModalOpen = signal<boolean>(false);
  readonly editingId = signal<string | null>(null);
  readonly eventoToDelete = signal<Evento | null>(null);
  private selectedFile: File | null = null;

  readonly eventoForm = new FormGroup({
    titulo: new FormControl('', [Validators.required, Validators.minLength(3)]),
    data: new FormControl('', [Validators.required]),
    horario: new FormControl('', [Validators.required]),
    local: new FormControl('Templo IASD Mangueiras'),
    descricao: new FormControl('', [Validators.required, Validators.minLength(5)]),
    departamento: new FormControl(''),
    palestrante: new FormControl(''),
    valor_entrada: new FormControl('Gratuito'),
    publico_alvo: new FormControl('Toda a Igreja'),
    link_inscricao: new FormControl(''),
    banner_url: new FormControl(''),
    destaque: new FormControl(false),
    data_inicio: new FormControl(''),
    data_fim: new FormControl(''),
    endereco: new FormControl(''),
    whatsapp_contato: new FormControl(''),
  });

  async ngOnInit(): Promise<void> {
    await this.loadEventos();
  }

  async loadEventos(): Promise<void> {
    this.isLoading.set(true);
    const firestoreEventos = await this.cmsService.getEventos();
    if (firestoreEventos.length > 0) {
      this.eventos.set(firestoreEventos);
    } else {
      this.eventos.set(defaultEventos as Evento[]);
    }
    this.isLoading.set(false);
  }

  openModal(): void {
    this.editingId.set(null);
    this.eventoForm.reset({
      local: 'Templo IASD Mangueiras',
      valor_entrada: 'Gratuito',
      publico_alvo: 'Toda a Igreja',
      departamento: '',
      destaque: false,
      data_inicio: '',
      data_fim: '',
      endereco: '',
      whatsapp_contato: '',
      banner_url: '',
    });
    this.selectedFile = null;
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  editEvento(evento: Evento): void {
    this.editingId.set(evento.id || null);
    this.selectedFile = null;
    this.eventoForm.patchValue({
      titulo: evento.titulo,
      data: evento.data,
      horario: evento.horario,
      local: evento.local || 'Templo IASD Mangueiras',
      descricao: evento.descricao,
      departamento: evento.departamento || '',
      palestrante: evento.palestrante || '',
      valor_entrada: evento.valor_entrada || 'Gratuito',
      publico_alvo: evento.publico_alvo || 'Toda a Igreja',
      link_inscricao: evento.link_inscricao || evento.href || '',
      banner_url: evento.banner_url || evento.imagem_url || '',
      destaque: Boolean(evento.destaque),
      data_inicio: evento.data_inicio || '',
      data_fim: evento.data_fim || '',
      endereco: evento.endereco || '',
      whatsapp_contato: evento.whatsapp_contato || '',
    });
    this.isModalOpen.set(true);
  }

  onImageSelected(file: File): void {
    this.selectedFile = file;
  }

  onImageRemoved(): void {
    this.selectedFile = null;
    this.eventoForm.patchValue({ banner_url: '' });
  }

  onUrlChanged(url: string): void {
    this.selectedFile = null;
    this.eventoForm.patchValue({ banner_url: url });
  }

  async saveEvento(): Promise<void> {
    if (this.eventoForm.invalid) {
      this.eventoForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    try {
      let uploadedBanner = '';
      if (this.selectedFile) {
        uploadedBanner = await this.cmsService.uploadBanner(this.selectedFile);
      }

      const formVal = this.eventoForm.value;
      const bannerFinal = uploadedBanner || formVal.banner_url || undefined;

      const eventoData: Partial<Evento> = {
        titulo: formVal.titulo!,
        data: formVal.data!,
        horario: formVal.horario!,
        local: formVal.local || 'Templo IASD Mangueiras',
        descricao: formVal.descricao!,
        departamento: formVal.departamento || undefined,
        palestrante: formVal.palestrante || undefined,
        valor_entrada: formVal.valor_entrada || undefined,
        publico_alvo: formVal.publico_alvo || undefined,
        link_inscricao: formVal.link_inscricao || undefined,
        href: formVal.link_inscricao || undefined,
        destaque: Boolean(formVal.destaque),
        banner_url: bannerFinal,
        imagem_url: bannerFinal,
        data_inicio: formVal.data_inicio || undefined,
        data_fim: formVal.data_fim || undefined,
        endereco: formVal.endereco || undefined,
        whatsapp_contato: formVal.whatsapp_contato || undefined,
      };

      await this.cmsService.saveEvento(eventoData, this.editingId() || undefined);
      this.toastService.success(`Evento "${eventoData.titulo}" salvo com sucesso!`);
      this.closeModal();
      await this.loadEventos();
    } catch {
      // Fallback local se Firestore não estiver com chaves ativas
      const formVal = this.eventoForm.value;
      const newEv = this.eventoForm.value as unknown as Evento;
      this.eventos.update((prev) => [newEv, ...prev]);
      this.toastService.info('Evento salvo na pré-visualização local.');
      this.closeModal();
    } finally {
      this.isSaving.set(false);
    }
  }

  confirmDelete(evento: Evento): void {
    this.eventoToDelete.set(evento);
  }

  async executeDeleteEvento(): Promise<void> {
    const evento = this.eventoToDelete();
    if (!evento) return;

    this.isDeleting.set(true);
    try {
      if (evento.id) {
        await this.cmsService.deleteEvento(evento.id);
      }
      this.eventos.update((prev) => prev.filter((e) => e !== evento && e.id !== evento.id));
      this.toastService.success(`Evento "${evento.titulo}" excluído.`);
    } catch {
      this.eventos.update((prev) => prev.filter((e) => e !== evento));
      this.toastService.info(`Evento "${evento.titulo}" removido da pré-visualização local.`);
    } finally {
      this.isDeleting.set(false);
      this.eventoToDelete.set(null);
    }
  }
}
