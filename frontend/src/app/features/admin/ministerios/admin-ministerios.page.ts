import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { Ministerio } from '../../../core/models/content.models';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import defaultMinisterios from '../../../../content/ministerios.json';

@Component({
  selector: 'app-admin-ministerios-page',
  standalone: true,
  imports: [ReactiveFormsModule],
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
          <div class="p-8 text-center text-sm text-advent-muted">Carregando ministérios…</div>
        } @else if (ministerios().length === 0) {
          <div class="rounded-2xl border border-dashed border-advent-border p-12 text-center text-advent-muted">
            Nenhum ministério cadastrado no momento. Clique em "+ Novo Ministério" para adicionar.
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
                    (click)="deleteMinisterio(ministerio)"
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
      @if (isModalOpen()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-ministerio-title"
        >
          <div class="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div class="flex items-center justify-between pb-4 border-b border-advent-border">
              <h3 id="modal-ministerio-title" class="text-lg font-bold text-advent-text">
                {{ editingId() ? 'Editar Ministério' : 'Novo Ministério' }}
              </h3>
              <button
                type="button"
                (click)="closeModal()"
                class="text-advent-muted hover:text-advent-text cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
                aria-label="Fechar modal"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form [formGroup]="ministerioForm" (ngSubmit)="saveMinisterio()" class="mt-5 space-y-4">
              <!-- Nome e Categoria -->
              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label for="nome" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Nome do Ministério *</label>
                  <input
                    id="nome"
                    type="text"
                    formControlName="nome"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="Ex: Música e Louvor"
                  />
                </div>
                <div>
                  <label for="categoria" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Categoria</label>
                  <input
                    id="categoria"
                    type="text"
                    formControlName="categoria"
                    list="categorias-list"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
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
                <label for="descricao" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Descrição *</label>
                <textarea
                  id="descricao"
                  rows="3"
                  formControlName="descricao"
                  class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                  placeholder="Descreva o ministério, sua missão e atuação..."
                ></textarea>
              </div>

              <!-- Líderes e Reuniões -->
              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label for="lideres" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Líderes</label>
                  <input
                    id="lideres"
                    type="text"
                    formControlName="lideres"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="Ex: Equipe de Música"
                  />
                </div>
                <div>
                  <label for="reunioes_horario" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Horário das Reuniões</label>
                  <input
                    id="reunioes_horario"
                    type="text"
                    formControlName="reunioes_horario"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="Ex: Sábados às 09:00"
                  />
                </div>
              </div>

              <!-- WhatsApp e Público-Alvo -->
              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label for="contato_whatsapp" class="block text-xs font-semibold uppercase text-advent-muted mb-1">WhatsApp de Contato</label>
                  <input
                    id="contato_whatsapp"
                    type="text"
                    formControlName="contato_whatsapp"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="Ex: 5515999999999"
                  />
                </div>
                <div>
                  <label for="publico_alvo" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Público-Alvo</label>
                  <input
                    id="publico_alvo"
                    type="text"
                    formControlName="publico_alvo"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="Ex: Jovens e Universitários"
                  />
                </div>
              </div>

              <!-- Banner URL + Upload -->
              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label for="banner_url" class="block text-xs font-semibold uppercase text-advent-muted mb-1">URL da Imagem / Banner</label>
                  <input
                    id="banner_url"
                    type="text"
                    formControlName="banner_url"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="https://.../banner.jpg"
                  />
                </div>
                <div>
                  <label for="banner-upload" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Upload da Imagem</label>
                  <input
                    id="banner-upload"
                    type="file"
                    accept="image/*"
                    (change)="onFileSelected($event)"
                    class="w-full text-xs text-advent-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-card file:border-0 file:text-xs file:font-semibold file:bg-advent-blue/10 file:text-advent-blue hover:file:bg-advent-blue/20 cursor-pointer"
                  />
                </div>
              </div>

              <!-- Atividades -->
              <div>
                <label for="atividades" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Atividades (uma por linha)</label>
                <textarea
                  id="atividades"
                  rows="4"
                  formControlName="atividades"
                  class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                  placeholder="Boas-vindas na entrada do templo&#10;Orientação de visitantes&#10;Distribuição de materiais"
                ></textarea>
              </div>

              <!-- Checkboxes -->
              <div class="flex flex-wrap gap-4 pt-1">
                <div class="flex items-center gap-2">
                  <input
                    id="destaque"
                    type="checkbox"
                    formControlName="destaque"
                    class="h-4 w-4 rounded border-advent-border text-advent-blue focus:ring-advent-blue"
                  />
                  <label for="destaque" class="text-xs font-semibold text-advent-text cursor-pointer">
                    Destacar este ministério
                  </label>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    id="ativo"
                    type="checkbox"
                    formControlName="ativo"
                    class="h-4 w-4 rounded border-advent-border text-advent-blue focus:ring-advent-blue"
                  />
                  <label for="ativo" class="text-xs font-semibold text-advent-text cursor-pointer">
                    Ministério ativo
                  </label>
                </div>
              </div>

              <div class="mt-6 flex justify-end gap-2 pt-3 border-t border-advent-border">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="rounded-card border border-advent-border px-4 py-2 text-xs font-semibold text-advent-text hover:bg-slate-50 cursor-pointer min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="ministerioForm.invalid || isSaving()"
                  class="rounded-card bg-advent-blue px-6 py-2 text-xs font-semibold text-white shadow hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner disabled:opacity-50 cursor-pointer min-h-[44px]"
                >
                  {{ isSaving() ? 'Salvando...' : 'Salvar Ministério' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
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
  readonly isModalOpen = signal<boolean>(false);
  readonly editingId = signal<string | null>(null);
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
    });
    this.selectedFile = null;
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  editMinisterio(ministerio: Ministerio): void {
    this.editingId.set(ministerio.id || null);
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  async saveMinisterio(): Promise<void> {
    if (this.ministerioForm.invalid) return;
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

  async deleteMinisterio(ministerio: Ministerio): Promise<void> {
    if (!confirm(`Deseja realmente excluir o ministério "${ministerio.nome}"?`)) return;
    try {
      if (ministerio.id) {
        await this.cmsService.deleteMinisterio(ministerio.id);
      }
      this.ministerios.update((prev) => prev.filter((m) => m !== ministerio && m.id !== ministerio.id));
      this.updateCategorias();
      this.toastService.info(`Ministério "${ministerio.nome}" excluído.`);
    } catch {
      this.toastService.error(`Erro ao excluir "${ministerio.nome}". Tente novamente.`);
    }
  }
}
