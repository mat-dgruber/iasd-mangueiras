import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { Ministerio } from '../../../core/models/content.models';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { ImagePickerComponent } from '../../../shared/ui/image-picker/image-picker.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import defaultMinisterios from '../../../../content/ministerios.json';

@Component({
  selector: 'app-admin-ministerios-page',
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
            Ministérios
          </h1>
          <p class="text-sm text-advent-muted mt-1">
            Gerencie os ministérios da igreja, seus líderes, horários de reunião e atividades.
          </p>
        </div>

        <button
          type="button"
          (click)="openModal()"
          class="rounded-card bg-advent-blue px-5 py-2.5 text-xs font-semibold text-white shadow transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Ministério
        </button>
      </header>

      <!-- Listagem de Ministérios -->
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
                      <app-ui-skeleton width="100px" height="20px" rounded="sm" />
                      <app-ui-skeleton width="70px" height="20px" rounded="sm" />
                    </div>
                    <app-ui-skeleton width="45%" height="22px" rounded="md" />
                    <app-ui-skeleton width="85%" height="16px" rounded="sm" />
                  </div>
                </div>
                <div class="flex gap-2 shrink-0">
                  <app-ui-skeleton width="70px" height="36px" rounded="md" />
                  <app-ui-skeleton width="70px" height="36px" rounded="md" />
                </div>
              </div>
            }
          </div>
        } @else if (ministerios().length === 0) {
          <div class="rounded-2xl border border-dashed border-advent-border bg-white p-12 text-center text-advent-muted flex flex-col items-center justify-center">
            <svg class="h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.199l-.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <p class="font-medium text-advent-text mb-1">Nenhum ministério cadastrado</p>
            <p class="text-xs text-advent-muted mb-4 max-w-sm">Cadastre os departamentos e ministérios da igreja para que os membros e visitantes conheçam seus trabalhos.</p>
            <button
              type="button"
              (click)="openModal()"
              class="rounded-card bg-advent-blue px-4 py-2 text-xs font-semibold text-white shadow hover:bg-advent-blue-dark active:scale-[0.98] transition-all cursor-pointer min-h-[40px] inline-flex items-center gap-1.5"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>+ Novo Ministério</span>
            </button>
          </div>
        } @else {
          <div class="grid gap-4">
            @for (ministerio of ministerios(); track (ministerio.id || ministerio.nome)) {
              <article class="flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-2xl border border-advent-border bg-white p-5 shadow-xs hover:border-advent-blue/40 transition-colors">
                <div class="flex items-start gap-4">
                  @if (ministerio.banner_url) {
                    <div class="h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-advent-border bg-slate-100 hidden sm:block">
                      <img
                        [src]="ministerio.banner_url"
                        [alt]="ministerio.nome"
                        class="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  }

                  <div class="space-y-1.5">
                    <div class="flex flex-wrap items-center gap-2">
                      @if (ministerio.categoria) {
                        <span class="rounded-md bg-advent-blue/10 px-2.5 py-0.5 text-xs font-bold uppercase text-advent-blue">
                          {{ ministerio.categoria }}
                        </span>
                      }

                      @if (ministerio.destaque) {
                        <span class="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 flex items-center gap-1">
                          Destaque
                        </span>
                      }

                      <span
                        class="rounded-md px-2 py-0.5 text-[11px] font-bold"
                        [class]="ministerio.ativo !== false ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'"
                      >
                        {{ ministerio.ativo !== false ? 'Ativo' : 'Inativo' }}
                      </span>
                    </div>

                    <h2 class="text-lg font-bold text-advent-text">{{ ministerio.nome }}</h2>

                    @if (ministerio.lideres) {
                      <p class="text-xs font-semibold text-advent-blue">
                        Líderes: {{ ministerio.lideres }}
                      </p>
                    }

                    <p class="text-xs text-advent-muted max-w-2xl leading-relaxed">{{ ministerio.descricao }}</p>

                    @if (ministerio.reunioes_horario) {
                      <p class="inline-flex items-center gap-1 text-xs text-advent-muted">
                        <svg class="h-3.5 w-3.5 shrink-0 text-advent-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ ministerio.reunioes_horario }}
                      </p>
                    }
                  </div>
                </div>

                <div class="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    (click)="editMinisterio(ministerio)"
                    class="rounded-lg px-3.5 py-2 text-xs font-semibold text-advent-blue bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer min-h-[44px] flex items-center"
                    aria-label="Editar ministério {{ ministerio.nome }}"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    (click)="confirmDelete(ministerio)"
                    class="rounded-lg px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer min-h-[44px] flex items-center"
                    aria-label="Excluir ministério {{ ministerio.nome }}"
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
        [title]="editingId() ? 'Editar Ministério' : 'Novo Ministério'"
        [size]="'lg'"
        (close)="closeModal()"
      >
        <form [formGroup]="ministerioForm" (ngSubmit)="saveMinisterio()" class="space-y-4">
          <!-- Nome e Categoria -->
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label for="min-nome" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                Nome do Ministério *
              </label>
              <input
                id="min-nome"
                type="text"
                formControlName="nome"
                class="w-full rounded-card border px-3.5 py-2 text-sm text-advent-text focus:outline-none transition-colors"
                [class.border-red-500]="ministerioForm.get('nome')?.invalid && ministerioForm.get('nome')?.touched"
                [class.border-advent-border]="!ministerioForm.get('nome')?.invalid || !ministerioForm.get('nome')?.touched"
                [class.focus:border-advent-blue]="!ministerioForm.get('nome')?.invalid || !ministerioForm.get('nome')?.touched"
                [class.focus:border-red-500]="ministerioForm.get('nome')?.invalid && ministerioForm.get('nome')?.touched"
                placeholder="Ex: Música e Louvor"
              />
              @if (ministerioForm.get('nome')?.invalid && ministerioForm.get('nome')?.touched) {
                <p class="mt-1 text-xs text-red-600">
                  @if (ministerioForm.get('nome')?.errors?.['required']) {
                    O nome do ministério é obrigatório.
                  } @else if (ministerioForm.get('nome')?.errors?.['minlength']) {
                    O nome deve ter no mínimo 2 caracteres.
                  }
                </p>
              }
            </div>
            <div>
              <label for="min-categoria" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                Categoria
              </label>
              <input
                id="min-categoria"
                type="text"
                formControlName="categoria"
                list="categorias-list"
                class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none transition-colors"
                placeholder="Ex: Louvor & Adoração"
              />
              <datalist id="categorias-list">
                @for (cat of categorias(); track cat) {
                  <option [value]="cat"></option>
                }
              </datalist>
            </div>
          </div>

          <!-- Descrição -->
          <div>
            <label for="min-descricao" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
              Descrição *
            </label>
            <textarea
              id="min-descricao"
              rows="3"
              formControlName="descricao"
              class="w-full rounded-card border px-3.5 py-2 text-sm text-advent-text focus:outline-none transition-colors"
              [class.border-red-500]="ministerioForm.get('descricao')?.invalid && ministerioForm.get('descricao')?.touched"
              [class.border-advent-border]="!ministerioForm.get('descricao')?.invalid || !ministerioForm.get('descricao')?.touched"
              [class.focus:border-advent-blue]="!ministerioForm.get('descricao')?.invalid || !ministerioForm.get('descricao')?.touched"
              [class.focus:border-red-500]="ministerioForm.get('descricao')?.invalid && ministerioForm.get('descricao')?.touched"
              placeholder="Descreva o ministério, sua missão e atuação..."
            ></textarea>
            @if (ministerioForm.get('descricao')?.invalid && ministerioForm.get('descricao')?.touched) {
              <p class="mt-1 text-xs text-red-600">
                @if (ministerioForm.get('descricao')?.errors?.['required']) {
                  A descrição é obrigatória.
                } @else if (ministerioForm.get('descricao')?.errors?.['minlength']) {
                  A descrição deve ter no mínimo 5 caracteres.
                }
              </p>
            }
          </div>

          <!-- Líderes e Reuniões -->
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label for="min-lideres" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                Líderes
              </label>
              <input
                id="min-lideres"
                type="text"
                formControlName="lideres"
                class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none transition-colors"
                placeholder="Ex: Equipe de Música"
              />
            </div>
            <div>
              <label for="min-reunioes" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                Horário das Reuniões
              </label>
              <input
                id="min-reunioes"
                type="text"
                formControlName="reunioes_horario"
                class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none transition-colors"
                placeholder="Ex: Sábados às 09:00"
              />
            </div>
          </div>

          <!-- WhatsApp e Público-Alvo -->
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label for="min-whatsapp" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                WhatsApp de Contato
              </label>
              <input
                id="min-whatsapp"
                type="text"
                formControlName="contato_whatsapp"
                class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none transition-colors"
                placeholder="Ex: 5515999999999"
              />
            </div>
            <div>
              <label for="min-publico" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                Público-Alvo
              </label>
              <input
                id="min-publico"
                type="text"
                formControlName="publico_alvo"
                class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none transition-colors"
                placeholder="Ex: Jovens e Universitários"
              />
            </div>
          </div>

          <!-- Image Picker para Banner do Ministério -->
          <div>
            <app-ui-image-picker
              [value]="ministerioForm.get('banner_url')?.value || ''"
              label="Banner / Imagem do Ministério"
              helpText="Recomendado JPG, PNG ou WebP até 5MB"
              (imageSelected)="onImageSelected($event)"
              (imageRemoved)="onImageRemoved()"
              (urlChanged)="onUrlChanged($event)"
            />
          </div>

          <!-- Atividades -->
          <div>
            <label for="min-atividades" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
              Atividades (uma por linha)
            </label>
            <textarea
              id="min-atividades"
              rows="4"
              formControlName="atividades"
              class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none transition-colors"
              placeholder="Boas-vindas na entrada do templo&#10;Orientação de visitantes&#10;Distribuição de materiais"
            ></textarea>
          </div>

          <!-- Checkboxes -->
          <div class="flex flex-wrap gap-4 pt-1">
            <div class="flex items-center gap-2">
              <input
                id="min-destaque"
                type="checkbox"
                formControlName="destaque"
                class="h-4 w-4 rounded border-advent-border text-advent-blue focus:ring-advent-blue"
              />
              <label for="min-destaque" class="text-xs font-semibold text-advent-text cursor-pointer">
                Destacar este ministério
              </label>
            </div>
            <div class="flex items-center gap-2">
              <input
                id="min-ativo"
                type="checkbox"
                formControlName="ativo"
                class="h-4 w-4 rounded border-advent-border text-advent-blue focus:ring-advent-blue"
              />
              <label for="min-ativo" class="text-xs font-semibold text-advent-text cursor-pointer">
                Ministério ativo
              </label>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2 pt-3 border-t border-advent-border">
            <button
              type="button"
              (click)="closeModal()"
              class="rounded-card border border-advent-border px-4 py-2 text-xs font-semibold text-advent-text hover:bg-slate-50 transition-colors cursor-pointer min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="ministerioForm.invalid || isSaving()"
              class="rounded-card bg-advent-blue px-6 py-2 text-xs font-semibold text-white shadow hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner disabled:opacity-50 transition-all cursor-pointer min-h-[44px]"
            >
              {{ isSaving() ? 'Salvando...' : 'Salvar Ministério' }}
            </button>
          </div>
        </form>
      </app-ui-modal>

      <!-- Diálogo de Confirmação de Exclusão -->
      <app-ui-confirm-dialog
        [isOpen]="!!ministerioToDelete()"
        title="Excluir Ministério"
        [message]="'Tem certeza que deseja excluir o ministério &quot;' + (ministerioToDelete()?.nome || '') + '&quot;? Esta ação não pode ser desfeita.'"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        [isLoading]="isDeleting()"
        (confirmed)="executeDeleteMinisterio()"
        (cancelled)="ministerioToDelete.set(null)"
      />
    </div>
  `,
})
export class AdminMinisteriosPage implements OnInit {
  private readonly cmsService = inject(AdminCmsService);
  private readonly toastService = inject(ToastService);

  readonly ministerios = signal<Ministerio[]>([]);
  readonly categorias = signal<string[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isSaving = signal<boolean>(false);
  readonly isDeleting = signal<boolean>(false);
  readonly isModalOpen = signal<boolean>(false);
  readonly editingId = signal<string | null>(null);
  readonly ministerioToDelete = signal<Ministerio | null>(null);
  private selectedFile: File | null = null;

  readonly ministerioForm = new FormGroup({
    nome: new FormControl('', [Validators.required, Validators.minLength(2)]),
    descricao: new FormControl('', [Validators.required, Validators.minLength(5)]),
    categoria: new FormControl(''),
    lideres: new FormControl(''),
    reunioes_horario: new FormControl(''),
    contato_whatsapp: new FormControl(''),
    publico_alvo: new FormControl(''),
    banner_url: new FormControl(''),
    atividades: new FormControl(''),
    destaque: new FormControl(false),
    ativo: new FormControl(true),
  });

  async ngOnInit(): Promise<void> {
    await this.loadMinisterios();
  }

  async loadMinisterios(): Promise<void> {
    this.isLoading.set(true);
    const firestoreMinisterios = await this.cmsService.getMinisterios();
    if (firestoreMinisterios.length > 0) {
      this.ministerios.set(firestoreMinisterios);
    } else {
      this.ministerios.set(defaultMinisterios as Ministerio[]);
    }
    this.updateCategorias();
    this.isLoading.set(false);
  }

  private updateCategorias(): void {
    const cats = new Set(
      this.ministerios()
        .map((m) => m.categoria)
        .filter((c): c is string => !!c),
    );
    this.categorias.set([...cats].sort());
  }

  openModal(): void {
    this.editingId.set(null);
    this.ministerioForm.reset({
      categoria: '',
      destaque: false,
      ativo: true,
      banner_url: '',
    });
    this.selectedFile = null;
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  editMinisterio(ministerio: Ministerio): void {
    this.editingId.set(ministerio.id || null);
    this.selectedFile = null;
    this.ministerioForm.patchValue({
      nome: ministerio.nome,
      descricao: ministerio.descricao,
      categoria: ministerio.categoria || '',
      lideres: ministerio.lideres || '',
      reunioes_horario: ministerio.reunioes_horario || '',
      contato_whatsapp: ministerio.contato_whatsapp || '',
      publico_alvo: ministerio.publico_alvo || '',
      banner_url: ministerio.banner_url || '',
      atividades: ministerio.atividades?.join('\n') || '',
      destaque: Boolean(ministerio.destaque),
      ativo: ministerio.ativo !== false,
    });
    this.isModalOpen.set(true);
  }

  onImageSelected(file: File): void {
    this.selectedFile = file;
  }

  onImageRemoved(): void {
    this.selectedFile = null;
    this.ministerioForm.patchValue({ banner_url: '' });
  }

  onUrlChanged(url: string): void {
    this.selectedFile = null;
    this.ministerioForm.patchValue({ banner_url: url });
  }

  async saveMinisterio(): Promise<void> {
    if (this.ministerioForm.invalid) {
      this.ministerioForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    try {
      let uploadedBanner = '';
      if (this.selectedFile) {
        uploadedBanner = await this.cmsService.uploadMinisterioImage(this.selectedFile);
      }

      const formVal = this.ministerioForm.value;
      const bannerFinal = uploadedBanner || formVal.banner_url || undefined;

      const atividadesArray = formVal.atividades
        ? formVal.atividades.split('\n').map((a) => a.trim()).filter((a) => a.length > 0)
        : [];

      const ministerioData: Partial<Ministerio> = {
        nome: formVal.nome!,
        descricao: formVal.descricao!,
        categoria: formVal.categoria || undefined,
        lideres: formVal.lideres || undefined,
        reunioes_horario: formVal.reunioes_horario || undefined,
        contato_whatsapp: formVal.contato_whatsapp || undefined,
        publico_alvo: formVal.publico_alvo || undefined,
        banner_url: bannerFinal,
        atividades: atividadesArray.length > 0 ? atividadesArray : undefined,
        destaque: Boolean(formVal.destaque),
        ativo: Boolean(formVal.ativo),
      };

      await this.cmsService.saveMinisterio(ministerioData, this.editingId() || undefined);
      this.toastService.success(`Ministério "${ministerioData.nome}" salvo com sucesso!`);
      this.closeModal();
      await this.loadMinisterios();
    } catch {
      // Fallback local se Firestore não estiver com chaves ativas
      const formVal = this.ministerioForm.value;
      const atividadesArray = formVal.atividades
        ? formVal.atividades.split('\n').map((a) => a.trim()).filter((a) => a.length > 0)
        : [];
      const newMin: Ministerio = {
        nome: formVal.nome!,
        descricao: formVal.descricao!,
        categoria: formVal.categoria || undefined,
        lideres: formVal.lideres || undefined,
        reunioes_horario: formVal.reunioes_horario || undefined,
        contato_whatsapp: formVal.contato_whatsapp || undefined,
        publico_alvo: formVal.publico_alvo || undefined,
        banner_url: formVal.banner_url || undefined,
        atividades: atividadesArray.length > 0 ? atividadesArray : undefined,
        destaque: Boolean(formVal.destaque),
        ativo: Boolean(formVal.ativo),
      };
      this.ministerios.update((prev) => [newMin, ...prev]);
      this.updateCategorias();
      this.toastService.info('Ministério salvo na pré-visualização local.');
      this.closeModal();
    } finally {
      this.isSaving.set(false);
    }
  }

  confirmDelete(ministerio: Ministerio): void {
    this.ministerioToDelete.set(ministerio);
  }

  async executeDeleteMinisterio(): Promise<void> {
    const ministerio = this.ministerioToDelete();
    if (!ministerio) return;

    this.isDeleting.set(true);
    try {
      if (ministerio.id) {
        await this.cmsService.deleteMinisterio(ministerio.id);
      }
      this.ministerios.update((prev) => prev.filter((m) => m !== ministerio && m.id !== ministerio.id));
      this.updateCategorias();
      this.toastService.success(`Ministério "${ministerio.nome}" excluído.`);
    } catch {
      this.ministerios.update((prev) => prev.filter((m) => m !== ministerio));
      this.updateCategorias();
      this.toastService.info(`Ministério "${ministerio.nome}" removido da pré-visualização local.`);
    } finally {
      this.isDeleting.set(false);
      this.ministerioToDelete.set(null);
    }
  }
}
