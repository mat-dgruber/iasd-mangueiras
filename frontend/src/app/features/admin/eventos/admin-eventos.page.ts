import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { Evento } from '../../../core/models/content.models';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import defaultEventos from '../../../../content/eventos.json';

@Component({
  selector: 'app-admin-eventos-page',
  standalone: true,
  imports: [ReactiveFormsModule],
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
          <div class="p-8 text-center text-sm text-advent-muted">Carregando eventos…</div>
        } @else if (eventos().length === 0) {
          <div class="rounded-2xl border border-dashed border-advent-border p-12 text-center text-advent-muted">
            Nenhum evento cadastrado no momento. Clique em "+ Novo Evento" para adicionar.
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
                    (click)="deleteEvento(evento)"
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
      @if (isModalOpen()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-evento-title"
        >
          <div class="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div class="flex items-center justify-between pb-4 border-b border-advent-border">
              <h3 id="modal-evento-title" class="text-lg font-bold text-advent-text">
                {{ editingId() ? 'Editar Evento' : 'Novo Evento' }}
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

            <form [formGroup]="eventoForm" (ngSubmit)="saveEvento()" class="mt-5 space-y-4">
              <!-- Título e Departamento -->
              <div class="grid gap-3 sm:grid-cols-3">
                <div class="sm:col-span-2">
                  <label for="titulo" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Título do Evento *</label>
                  <input
                    id="titulo"
                    type="text"
                    formControlName="titulo"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="Ex: Semana de Oração da Família"
                  />
                </div>
                <div>
                  <label for="departamento" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Departamento</label>
                  <select
                    id="departamento"
                    formControlName="departamento"
                    class="w-full rounded-card border border-advent-border px-3 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden bg-white"
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
                  <label for="data" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Data / Período *</label>
                  <input
                    id="data"
                    type="text"
                    formControlName="data"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="Ex: 15 a 22 de Março"
                  />
                </div>

                <div>
                  <label for="horario" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Horário *</label>
                  <input
                    id="horario"
                    type="text"
                    formControlName="horario"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="Ex: 19:30"
                  />
                </div>

                <div>
                  <label for="local" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Local</label>
                  <input
                    id="local"
                    type="text"
                    formControlName="local"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="Ex: Templo Principal"
                  />
                </div>
              </div>

              <!-- Datas Estruturadas (Início e Fim) -->
              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label for="data_inicio" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Data Início</label>
                  <input
                    id="data_inicio"
                    type="date"
                    formControlName="data_inicio"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                  />
                </div>

                <div>
                  <label for="data_fim" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Data Fim</label>
                  <input
                    id="data_fim"
                    type="date"
                    formControlName="data_fim"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                  />
                </div>
              </div>

              <!-- Endereço Completo e WhatsApp de Contato -->
              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label for="endereco" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Endereço</label>
                  <input
                    id="endereco"
                    type="text"
                    formControlName="endereco"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="Ex: Rua Chiquinha Rodrigues, 1005 - Tatuí, SP"
                  />
                </div>

                <div>
                  <label for="whatsapp_contato" class="block text-xs font-semibold uppercase text-advent-muted mb-1">WhatsApp de Contato</label>
                  <input
                    id="whatsapp_contato"
                    type="text"
                    formControlName="whatsapp_contato"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="Ex: 5515999999999"
                  />
                </div>
              </div>

              <!-- Palestrante, Entrada e Público -->
              <div class="grid gap-3 sm:grid-cols-3">
                <div>
                  <label for="palestrante" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Orador / Palestrante</label>
                  <input
                    id="palestrante"
                    type="text"
                    formControlName="palestrante"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="Ex: Pr. Luís Gonçalves"
                  />
                </div>

                <div>
                  <label for="valor_entrada" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Entrada / Valor</label>
                  <input
                    id="valor_entrada"
                    type="text"
                    formControlName="valor_entrada"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="Ex: Gratuito / 1kg de Alimento"
                  />
                </div>

                <div>
                  <label for="publico_alvo" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Público-Alvo</label>
                  <input
                    id="publico_alvo"
                    type="text"
                    formControlName="publico_alvo"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="Ex: Toda a Igreja / Casais"
                  />
                </div>
              </div>

              <!-- Link de Inscrição / Banner -->
              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label for="link_inscricao" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Link de Inscrição / Ingressos</label>
                  <input
                    id="link_inscricao"
                    type="text"
                    formControlName="link_inscricao"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="https://forms.gle/... ou https://wa.me/..."
                  />
                </div>

                <div>
                  <label for="banner_url" class="block text-xs font-semibold uppercase text-advent-muted mb-1">URL da Imagem / Banner (ou upload)</label>
                  <input
                    id="banner_url"
                    type="text"
                    formControlName="banner_url"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                    placeholder="https://.../banner.jpg"
                  />
                </div>
              </div>

              <!-- Upload de Imagem de Cartaz / Banner -->
              <div>
                <label for="banner-upload" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Upload do Cartaz / Banner</label>
                <input
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  (change)="onFileSelected($event)"
                  class="w-full text-xs text-advent-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-card file:border-0 file:text-xs file:font-semibold file:bg-advent-blue/10 file:text-advent-blue hover:file:bg-advent-blue/20 cursor-pointer"
                />
              </div>

              <div>
                <label for="descricao" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Descrição do Evento *</label>
                <textarea
                  id="descricao"
                  rows="3"
                  formControlName="descricao"
                  class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-hidden"
                  placeholder="Informações completas sobre o evento, cronograma e orientações aos participantes..."
                ></textarea>
              </div>

              <!-- Checkbox de Destaque -->
              <div class="flex items-center gap-2 pt-1">
                <input
                  id="destaque"
                  type="checkbox"
                  formControlName="destaque"
                  class="h-4 w-4 rounded border-advent-border text-advent-blue focus:ring-advent-blue"
                />
                <label for="destaque" class="text-xs font-semibold text-advent-text cursor-pointer">
                  ⭐ Destacar este evento no topo da página e na Home
                </label>
              </div>

              <div class="mt-6 flex justify-end gap-2 pt-3 border-t border-advent-border">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="rounded-card border border-advent-border px-4 py-2 text-xs font-semibold text-advent-text hover:bg-slate-50 cursor-pointer min-h-[36px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="eventoForm.invalid || isSaving()"
                  class="rounded-card bg-advent-blue px-6 py-2 text-xs font-semibold text-white shadow hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner disabled:opacity-50 cursor-pointer min-h-[36px]"
                >
                  {{ isSaving() ? 'Salvando...' : 'Salvar Evento' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminEventosPage implements OnInit {
  private readonly cmsService = inject(AdminCmsService);
  private readonly toastService = inject(ToastService);

  readonly eventos = signal<Evento[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isSaving = signal<boolean>(false);
  readonly isModalOpen = signal<boolean>(false);
  readonly editingId = signal<string | null>(null);
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
    });
    this.selectedFile = null;
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  editEvento(evento: Evento): void {
    this.editingId.set(evento.id || null);
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  async saveEvento(): Promise<void> {
    if (this.eventoForm.invalid) return;
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
      const newEv = this.eventoForm.value as unknown as Evento;
      this.eventos.update((prev) => [newEv, ...prev]);
      this.toastService.info('Evento salvo na pré-visualização local.');
      this.closeModal();
    } finally {
      this.isSaving.set(false);
    }
  }

  async deleteEvento(evento: Evento): Promise<void> {
    if (!confirm(`Deseja realmente excluir o evento "${evento.titulo}"?`)) return;
    try {
      if (evento.id) {
        await this.cmsService.deleteEvento(evento.id);
      }
      this.eventos.update((prev) => prev.filter((e) => e !== evento && e.id !== evento.id));
      this.toastService.info(`Evento "${evento.titulo}" excluído.`);
    } catch {
      this.eventos.update((prev) => prev.filter((e) => e !== evento));
    }
  }
}
