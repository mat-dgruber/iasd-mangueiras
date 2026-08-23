import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminCmsService, AvisoHorarioEspecial } from '../../../core/services/admin-cms.service';
import defaultHorarios from '../../../../content/horarios.json';

@Component({
  selector: 'app-admin-horarios-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-advent-text md:text-3xl">
            ⏰ Horários & Avisos Especiais
          </h1>
          <p class="text-sm text-advent-muted mt-1">
            Consulte a grade regular e publique alterações de cultos em datas comemorativas.
          </p>
        </div>

        <button
          type="button"
          (click)="openModal()"
          class="rounded-card bg-advent-blue px-5 py-2.5 text-xs font-semibold text-white shadow transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner cursor-pointer"
        >
          + Aviso de Horário Especial
        </button>
      </header>

      @if (feedbackMsg()) {
        <div class="mt-4 rounded-card border border-green-200 bg-green-50 p-3.5 text-xs font-semibold text-green-800 animate-fadeIn" role="status">
          ✓ {{ feedbackMsg() }}
        </div>
      }

      <!-- Grade Regular (Informativa) -->
      <section class="mt-8">
        <h2 class="text-sm font-bold uppercase tracking-wider text-advent-muted mb-3">
          Grade Regular de Cultos
        </h2>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          @for (h of regularHorarios; track h.titulo) {
            <div class="rounded-xl border border-advent-border bg-white p-4 shadow-xs">
              <span class="rounded bg-advent-blue/10 px-2 py-0.5 text-[10px] font-bold uppercase text-advent-blue">
                {{ h.dia }} • {{ h.horario }}
              </span>
              <h3 class="mt-2 text-sm font-bold text-advent-text">{{ h.titulo }}</h3>
              <p class="mt-1 text-xs text-advent-muted leading-relaxed">{{ h.descricao }}</p>
            </div>
          }
        </div>
      </section>

      <!-- Avisos Especiais Cadastrados -->
      <section class="mt-10">
        <h2 class="text-sm font-bold uppercase tracking-wider text-advent-muted mb-3">
          Avisos de Alteração / Horários Especiais
        </h2>
        @if (avisos().length === 0) {
          <div class="rounded-2xl border border-dashed border-advent-border p-8 text-center text-xs text-advent-muted">
            Nenhuma alteração temporária ativa. Os cultos estão seguindo a grade normal.
          </div>
        } @else {
          <div class="grid gap-3">
            @for (aviso of avisos(); track (aviso.id || aviso.titulo)) {
              <div class="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                <div>
                  <span class="rounded bg-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                    {{ aviso.data_evento || 'Horário Especial' }}
                  </span>
                  <h3 class="mt-1 text-sm font-bold text-amber-950">{{ aviso.titulo }}</h3>
                  <p class="text-xs text-amber-900 leading-relaxed">{{ aviso.mensagem }}</p>
                </div>

                <button
                  type="button"
                  (click)="deleteAviso(aviso)"
                  class="rounded px-3 py-1.5 text-xs font-semibold text-red-600 bg-white border border-red-200 hover:bg-red-50 cursor-pointer"
                >
                  Remover
                </button>
              </div>
            }
          </div>
        }
      </section>

      <!-- Modal Novo Aviso -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div class="flex items-center justify-between pb-4 border-b border-advent-border">
              <h3 class="text-lg font-bold text-advent-text">Novo Aviso de Horário Especial</h3>
              <button type="button" (click)="closeModal()" class="text-advent-muted hover:text-advent-text text-lg cursor-pointer">✕</button>
            </div>

            <form [formGroup]="avisoForm" (ngSubmit)="saveAviso()" class="mt-5 space-y-4">
              <div>
                <label for="aviso-titulo" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Título do Aviso *</label>
                <input
                  id="aviso-titulo"
                  type="text"
                  formControlName="titulo"
                  class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                  placeholder="Ex: Culto de Ano Novo em Horário Especial"
                />
              </div>

              <div>
                <label for="aviso-data" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Data / Horário Especial</label>
                <input
                  id="aviso-data"
                  type="text"
                  formControlName="data_evento"
                  class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                  placeholder="Ex: 31 de Dezembro às 20:00"
                />
              </div>

              <div>
                <label for="aviso-mensagem" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Detalhes do Aviso *</label>
                <textarea
                  id="aviso-mensagem"
                  rows="3"
                  formControlName="mensagem"
                  class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                  placeholder="Ex: Não haverá culto regular pela manhã. Nos reuniremos à noite..."
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
                  [disabled]="avisoForm.invalid || isSaving()"
                  class="rounded-card bg-advent-blue px-6 py-2 text-xs font-semibold text-white shadow hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner disabled:opacity-50 cursor-pointer"
                >
                  {{ isSaving() ? 'Salvando...' : 'Publicar Aviso' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminHorariosPage implements OnInit {
  private readonly cmsService = inject(AdminCmsService);

  readonly regularHorarios = defaultHorarios;
  readonly avisos = signal<AvisoHorarioEspecial[]>([]);
  readonly isModalOpen = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly feedbackMsg = signal<string | null>(null);

  readonly avisoForm = new FormGroup({
    titulo: new FormControl('', [Validators.required, Validators.minLength(3)]),
    data_evento: new FormControl(''),
    mensagem: new FormControl('', [Validators.required, Validators.minLength(5)]),
  });

  async ngOnInit(): Promise<void> {
    await this.loadAvisos();
  }

  async loadAvisos(): Promise<void> {
    const list = await this.cmsService.getAvisosHorarios();
    this.avisos.set(list);
  }

  openModal(): void {
    this.avisoForm.reset();
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  async saveAviso(): Promise<void> {
    if (this.avisoForm.invalid) return;
    this.isSaving.set(true);
    const formVal = this.avisoForm.value;
    const newAviso: Partial<AvisoHorarioEspecial> = {
      titulo: formVal.titulo!,
      data_evento: formVal.data_evento || 'Horário Especial',
      mensagem: formVal.mensagem!,
      ativo: true,
    };
    try {
      await this.cmsService.saveAvisoHorario(newAviso);
      this.feedbackMsg.set('Aviso de horário publicado com sucesso!');
      setTimeout(() => this.feedbackMsg.set(null), 4000);
      this.closeModal();
      await this.loadAvisos();
    } catch {
      this.avisos.update((prev) => [newAviso as AvisoHorarioEspecial, ...prev]);
      this.feedbackMsg.set('Aviso adicionado na visualização local!');
      setTimeout(() => this.feedbackMsg.set(null), 4000);
      this.closeModal();
    } finally {
      this.isSaving.set(false);
    }
  }

  async deleteAviso(aviso: AvisoHorarioEspecial): Promise<void> {
    if (!confirm(`Remover o aviso "${aviso.titulo}"?`)) return;
    try {
      if (aviso.id) {
        await this.cmsService.deleteAvisoHorario(aviso.id);
      }
      this.avisos.update((prev) => prev.filter((a) => a !== aviso && a.id !== aviso.id));
      this.feedbackMsg.set('Aviso removido.');
      setTimeout(() => this.feedbackMsg.set(null), 4000);
    } catch {
      this.avisos.update((prev) => prev.filter((a) => a !== aviso));
    }
  }
}
