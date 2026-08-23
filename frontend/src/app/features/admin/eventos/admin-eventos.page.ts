import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { Evento } from '../../../core/models/content.models';
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
            📅 Eventos & Programações
          </h1>
          <p class="text-sm text-advent-muted mt-1">
            Cadastre e edite as programações especiais da igreja.
          </p>
        </div>

        <button
          type="button"
          (click)="openModal()"
          class="rounded-card bg-advent-blue px-5 py-2.5 text-xs font-semibold text-white shadow transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner cursor-pointer"
        >
          + Novo Evento
        </button>
      </header>

      <!-- Feedback de Notificação -->
      @if (feedbackMsg()) {
        <div class="mt-4 rounded-card border border-green-200 bg-green-50 p-3.5 text-xs font-semibold text-green-800 animate-fadeIn" role="status">
          ✓ {{ feedbackMsg() }}
        </div>
      }

      <!-- Listagem de Eventos -->
      <div class="mt-8 space-y-4">
        @if (isLoading()) {
          <div class="p-8 text-center text-sm text-advent-muted">Carregando eventos...</div>
        } @else if (eventos().length === 0) {
          <div class="rounded-2xl border border-dashed border-advent-border p-12 text-center text-advent-muted">
            Nenhum evento cadastrado no momento. Clique em "+ Novo Evento" para adicionar.
          </div>
        } @else {
          <div class="grid gap-4">
            @for (evento of eventos(); track (evento.id || evento.titulo)) {
              <article class="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-advent-border bg-white p-5 shadow-xs hover:border-advent-blue/40 transition-colors">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="rounded bg-advent-blue/10 px-2.5 py-0.5 text-xs font-bold uppercase text-advent-blue">
                      {{ evento.data }} • {{ evento.horario }}
                    </span>
                    @if (evento.local) {
                      <span class="text-xs text-advent-muted">📍 {{ evento.local }}</span>
                    }
                  </div>
                  <h2 class="text-lg font-bold text-advent-text">{{ evento.titulo }}</h2>
                  <p class="text-xs text-advent-muted max-w-2xl leading-relaxed">{{ evento.descricao }}</p>
                </div>

                <div class="flex items-center gap-2 self-end md:self-center">
                  <button
                    type="button"
                    (click)="editEvento(evento)"
                    class="rounded px-3 py-1.5 text-xs font-semibold text-advent-blue bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    (click)="deleteEvento(evento)"
                    class="rounded px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
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
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div class="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div class="flex items-center justify-between pb-4 border-b border-advent-border">
              <h3 class="text-lg font-bold text-advent-text">
                {{ editingId() ? 'Editar Evento' : 'Novo Evento' }}
              </h3>
              <button type="button" (click)="closeModal()" class="text-advent-muted hover:text-advent-text text-lg cursor-pointer">✕</button>
            </div>

            <form [formGroup]="eventoForm" (ngSubmit)="saveEvento()" class="mt-5 space-y-4">
              <div>
                <label for="titulo" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Título do Evento *</label>
                <input
                  id="titulo"
                  type="text"
                  formControlName="titulo"
                  class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                  placeholder="Ex: Semana de Oração da Família"
                />
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label for="data" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Data / Período *</label>
                  <input
                    id="data"
                    type="text"
                    formControlName="data"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                    placeholder="Ex: 15 a 22 de Março"
                  />
                </div>

                <div>
                  <label for="horario" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Horário *</label>
                  <input
                    id="horario"
                    type="text"
                    formControlName="horario"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                    placeholder="Ex: 19:30"
                  />
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label for="local" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Local</label>
                  <input
                    id="local"
                    type="text"
                    formControlName="local"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                    placeholder="Ex: Templo Principal"
                  />
                </div>

                <div>
                  <label for="href" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Link de Inscrição / Detalhes</label>
                  <input
                    id="href"
                    type="text"
                    formControlName="href"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label for="descricao" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Descrição do Evento *</label>
                <textarea
                  id="descricao"
                  rows="3"
                  formControlName="descricao"
                  class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                  placeholder="Informações sobre o evento para os membros e visitantes..."
                ></textarea>
              </div>

              <!-- Upload de Imagem de Cartaz -->
              <div>
                <label for="banner-upload" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Cartaz / Banner (opcional)</label>
                <input
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  (change)="onFileSelected($event)"
                  class="w-full text-xs text-advent-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-card file:border-0 file:text-xs file:font-semibold file:bg-advent-blue/10 file:text-advent-blue hover:file:bg-advent-blue/20 cursor-pointer"
                />
              </div>

              <div class="mt-6 flex justify-end gap-2 pt-3 border-t border-advent-border">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="rounded-card border border-advent-border px-4 py-2 text-xs font-semibold text-advent-text hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="eventoForm.invalid || isSaving()"
                  class="rounded-card bg-advent-blue px-6 py-2 text-xs font-semibold text-white shadow hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner disabled:opacity-50 cursor-pointer"
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

  readonly eventos = signal<Evento[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isSaving = signal<boolean>(false);
  readonly isModalOpen = signal<boolean>(false);
  readonly editingId = signal<string | null>(null);
  readonly feedbackMsg = signal<string | null>(null);
  private selectedFile: File | null = null;

  readonly eventoForm = new FormGroup({
    titulo: new FormControl('', [Validators.required, Validators.minLength(3)]),
    data: new FormControl('', [Validators.required]),
    horario: new FormControl('', [Validators.required]),
    local: new FormControl('Templo IASD Mangueiras'),
    descricao: new FormControl('', [Validators.required, Validators.minLength(5)]),
    href: new FormControl(''),
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
    this.eventoForm.reset({ local: 'Templo IASD Mangueiras' });
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
      href: evento.href || '',
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
      let bannerUrl = '';
      if (this.selectedFile) {
        bannerUrl = await this.cmsService.uploadBanner(this.selectedFile);
      }

      const formVal = this.eventoForm.value;
      const eventoData: Partial<Evento> = {
        titulo: formVal.titulo!,
        data: formVal.data!,
        horario: formVal.horario!,
        local: formVal.local || 'Templo IASD Mangueiras',
        descricao: formVal.descricao!,
        href: formVal.href || undefined,
        ...(bannerUrl ? { imagem_url: bannerUrl } : {}),
      };

      await this.cmsService.saveEvento(eventoData, this.editingId() || undefined);
      this.feedbackMsg.set('Evento salvo com sucesso no site!');
      setTimeout(() => this.feedbackMsg.set(null), 4000);
      this.closeModal();
      await this.loadEventos();
    } catch {
      // Fallback local se Firestore não estiver com chaves ativas
      const newEv = this.eventoForm.value as Evento;
      this.eventos.update((prev) => [newEv, ...prev]);
      this.feedbackMsg.set('Evento registrado na visualização local!');
      setTimeout(() => this.feedbackMsg.set(null), 4000);
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
      this.feedbackMsg.set('Evento removido com sucesso.');
      setTimeout(() => this.feedbackMsg.set(null), 4000);
    } catch {
      this.eventos.update((prev) => prev.filter((e) => e !== evento));
    }
  }
}
