import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { Comunicado } from '../../../core/models/content.models';
import defaultComunicados from '../../../../content/comunicados.json';

@Component({
  selector: 'app-admin-comunicados-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-advent-text md:text-3xl">
            📢 Comunicados & Avisos
          </h1>
          <p class="text-sm text-advent-muted mt-1">
            Publique avisos importantes e alertas visíveis aos membros e visitantes.
          </p>
        </div>

        <button
          type="button"
          (click)="openModal()"
          class="rounded-card bg-advent-blue px-5 py-2.5 text-xs font-semibold text-white shadow transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner cursor-pointer"
        >
          + Novo Comunicado
        </button>
      </header>

      @if (feedbackMsg()) {
        <div class="mt-4 rounded-card border border-green-200 bg-green-50 p-3.5 text-xs font-semibold text-green-800 animate-fadeIn" role="status">
          ✓ {{ feedbackMsg() }}
        </div>
      }

      <div class="mt-8 space-y-4">
        @if (isLoading()) {
          <div class="p-8 text-center text-sm text-advent-muted">Carregando comunicados...</div>
        } @else if (comunicados().length === 0) {
          <div class="rounded-2xl border border-dashed border-advent-border p-12 text-center text-advent-muted">
            Nenhum comunicado ativo. Clique em "+ Novo Comunicado" para cadastrar um aviso.
          </div>
        } @else {
          <div class="grid gap-4">
            @for (com of comunicados(); track (com.id || com.titulo)) {
              <article class="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-advent-border bg-white p-5 shadow-xs">
                <div class="space-y-1.5">
                  <div class="flex items-center gap-2">
                    <span class="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                      {{ com.data || 'Aviso Ativo' }}
                    </span>
                    @if (com.ativo !== false) {
                      <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700">
                        <span class="h-2 w-2 rounded-full bg-green-500"></span> Visível no Site
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                        <span class="h-2 w-2 rounded-full bg-slate-300"></span> Pausado
                      </span>
                    }
                  </div>
                  <h2 class="text-base font-bold text-advent-text">{{ com.titulo }}</h2>
                  <p class="text-xs text-advent-muted max-w-2xl leading-relaxed">{{ com.mensagem || com.descricao }}</p>
                </div>


                <div class="flex items-center gap-2 self-end md:self-center">
                  <button
                    type="button"
                    (click)="toggleStatus(com)"
                    class="rounded px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                    [class.bg-green-50]="com.ativo !== false"
                    [class.text-green-800]="com.ativo !== false"
                    [class.bg-slate-100]="com.ativo === false"
                    [class.text-slate-600]="com.ativo === false"
                  >
                    {{ com.ativo !== false ? 'Pausar' : 'Ativar' }}
                  </button>
                  <button
                    type="button"
                    (click)="deleteComunicado(com)"
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

      <!-- Modal Novo Comunicado -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div class="flex items-center justify-between pb-4 border-b border-advent-border">
              <h3 class="text-lg font-bold text-advent-text">Novo Comunicado</h3>
              <button type="button" (click)="closeModal()" class="text-advent-muted hover:text-advent-text text-lg cursor-pointer">✕</button>
            </div>

            <form [formGroup]="comunicadoForm" (ngSubmit)="saveComunicado()" class="mt-5 space-y-4">
              <div>
                <label for="com-titulo" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Título do Comunicado *</label>
                <input
                  id="com-titulo"
                  type="text"
                  formControlName="titulo"
                  class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                  placeholder="Ex: Aviso de Santa Ceia neste sábado"
                />
              </div>

              <div>
                <label for="com-data" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Data / Período</label>
                <input
                  id="com-data"
                  type="text"
                  formControlName="data"
                  class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                  placeholder="Ex: Vigente até 30 de Março"
                />
              </div>

              <div>
                <label for="com-mensagem" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Mensagem *</label>
                <textarea
                  id="com-mensagem"
                  rows="3"
                  formControlName="mensagem"
                  class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                  placeholder="Texto do comunicado a ser divulgado..."
                ></textarea>
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
                  [disabled]="comunicadoForm.invalid || isSaving()"
                  class="rounded-card bg-advent-blue px-6 py-2 text-xs font-semibold text-white shadow hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner disabled:opacity-50 cursor-pointer"
                >
                  {{ isSaving() ? 'Publicando...' : 'Publicar Comunicado' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminComunicadosPage implements OnInit {
  private readonly cmsService = inject(AdminCmsService);

  readonly comunicados = signal<Comunicado[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isSaving = signal<boolean>(false);
  readonly isModalOpen = signal<boolean>(false);
  readonly feedbackMsg = signal<string | null>(null);

  readonly comunicadoForm = new FormGroup({
    titulo: new FormControl('', [Validators.required, Validators.minLength(3)]),
    data: new FormControl(''),
    mensagem: new FormControl('', [Validators.required, Validators.minLength(5)]),
  });

  async ngOnInit(): Promise<void> {
    await this.loadComunicados();
  }

  async loadComunicados(): Promise<void> {
    this.isLoading.set(true);
    const firestoreItems = await this.cmsService.getComunicados();
    if (firestoreItems.length > 0) {
      this.comunicados.set(firestoreItems);
    } else {
      this.comunicados.set(defaultComunicados as Comunicado[]);
    }
    this.isLoading.set(false);
  }

  openModal(): void {
    this.comunicadoForm.reset();
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  async saveComunicado(): Promise<void> {
    if (this.comunicadoForm.invalid) return;
    this.isSaving.set(true);
    const formVal = this.comunicadoForm.value;
    const newCom: Partial<Comunicado> = {
      titulo: formVal.titulo!,
      data: formVal.data || 'Aviso Recente',
      mensagem: formVal.mensagem!,
      descricao: formVal.mensagem!,
      ativo: true,
    };

    try {
      await this.cmsService.saveComunicado(newCom);
      this.feedbackMsg.set('Comunicado publicado com sucesso!');
      setTimeout(() => this.feedbackMsg.set(null), 4000);
      this.closeModal();
      await this.loadComunicados();
    } catch {
      this.comunicados.update((prev) => [newCom as Comunicado, ...prev]);
      this.feedbackMsg.set('Comunicado adicionado na visualização local!');
      setTimeout(() => this.feedbackMsg.set(null), 4000);
      this.closeModal();
    } finally {
      this.isSaving.set(false);
    }
  }

  async toggleStatus(com: Comunicado): Promise<void> {
    const nextStatus = com.ativo === false;
    com.ativo = nextStatus;
    this.comunicados.update((prev) => [...prev]);
    if (com.id) {
      try {
        await this.cmsService.saveComunicado({ ativo: nextStatus }, com.id);
      } catch {
        // ok
      }
    }
  }

  async deleteComunicado(com: Comunicado): Promise<void> {
    if (!confirm(`Deseja excluir o comunicado "${com.titulo}"?`)) return;
    try {
      if (com.id) {
        await this.cmsService.deleteComunicado(com.id);
      }
      this.comunicados.update((prev) => prev.filter((c) => c !== com && c.id !== com.id));
      this.feedbackMsg.set('Comunicado excluído.');
      setTimeout(() => this.feedbackMsg.set(null), 4000);
    } catch {
      this.comunicados.update((prev) => prev.filter((c) => c !== com));
    }
  }
}
