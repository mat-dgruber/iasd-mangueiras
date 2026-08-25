import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { PequenoGrupo } from '../../../core/models/content.models';
import defaultPgs from '../../../../content/pgs.json';

@Component({
  selector: 'app-admin-pgs-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-advent-text md:text-3xl">
            Gestão de Pequenos Grupos (PGs)
          </h1>
          <p class="text-sm text-advent-muted mt-1">
            Cadastre os Pequenos Grupos da IASD Mangueiras e os contatos de seus líderes.
          </p>
        </div>

        <button
          type="button"
          (click)="openModal()"
          class="rounded-card bg-advent-blue px-5 py-2.5 text-xs font-semibold text-white shadow transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner cursor-pointer min-h-[40px] flex items-center justify-center"
        >
          + Novo Pequeno Grupo
        </button>
      </header>

      @if (feedbackMsg()) {
        <div class="mt-4 rounded-card border border-green-200 bg-green-50 p-3.5 text-xs font-semibold text-green-800 animate-fadeIn flex items-center gap-2" role="status" aria-live="polite">
          <svg class="h-4 w-4 shrink-0 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <span>{{ feedbackMsg() }}</span>
        </div>
      }

      <div class="mt-8 space-y-4">
        @if (isLoading()) {
          <div class="p-8 text-center text-sm text-advent-muted">Carregando Pequenos Grupos…</div>
        } @else if (pgs().length === 0) {
          <div class="rounded-2xl border border-dashed border-advent-border p-12 text-center text-advent-muted">
            Nenhum Pequeno Grupo cadastrado. Clique em "+ Novo Pequeno Grupo" para adicionar.
          </div>
        } @else {
          <div class="grid gap-4 sm:grid-cols-2">
            @for (pg of pgs(); track (pg.id || pg.nome)) {
              <article class="flex flex-col justify-between rounded-2xl border border-advent-border bg-white p-5 shadow-xs transition-colors hover:border-advent-blue/40">
                <div>
                  <div class="flex items-center justify-between gap-2">
                    <span class="rounded bg-advent-blue/10 px-2 py-0.5 text-[10px] font-bold uppercase text-advent-blue">
                      {{ pg.perfil }}
                    </span>
                    <span class="inline-flex items-center gap-1 text-xs text-advent-muted font-semibold">
                      <svg class="h-3.5 w-3.5 shrink-0 text-advent-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {{ pg.bairro }}
                    </span>
                  </div>

                  <h2 class="mt-2 text-lg font-bold text-advent-text">{{ pg.nome }}</h2>
                  <p class="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-advent-blue">
                    <svg class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ pg.dia }} às {{ pg.horario }}
                  </p>

                  <p class="mt-2 text-xs text-advent-muted leading-relaxed">{{ pg.descricao }}</p>

                  <div class="mt-3 pt-2.5 border-t border-slate-100 text-xs text-advent-text">
                    <p><strong>Líderes:</strong> {{ pg.lider }}</p>
                    <p class="text-green-700 font-semibold mt-0.5 inline-flex items-center gap-1">
                      <svg class="h-3.5 w-3.5 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                      {{ pg.telefone }}
                    </p>
                  </div>
                </div>

                <div class="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    (click)="editPg(pg)"
                    class="rounded-lg px-3.5 py-2 text-xs font-semibold text-advent-blue bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer min-h-[36px] flex items-center"
                    aria-label="Editar PG {{ pg.nome }}"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    (click)="deletePg(pg)"
                    class="rounded-lg px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer min-h-[36px] flex items-center"
                    aria-label="Excluir PG {{ pg.nome }}"
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
          aria-labelledby="modal-pg-title"
        >
          <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div class="flex items-center justify-between pb-4 border-b border-advent-border">
              <h3 id="modal-pg-title" class="text-lg font-bold text-advent-text">
                {{ editingId() ? 'Editar Pequeno Grupo' : 'Novo Pequeno Grupo' }}
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

            <form [formGroup]="pgForm" (ngSubmit)="savePg()" class="mt-5 space-y-4">
              <div>
                <label for="pg-nome" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Nome do PG *</label>
                <input
                  id="pg-nome"
                  type="text"
                  formControlName="nome"
                  class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                  placeholder="Ex: PG Conexão Jovem"
                />
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label for="pg-lider" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Líder(es) *</label>
                  <input
                    id="pg-lider"
                    type="text"
                    formControlName="lider"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                    placeholder="Ex: Lucas e Beatriz"
                  />
                </div>

                <div>
                  <label for="pg-telefone" class="block text-xs font-semibold uppercase text-advent-muted mb-1">WhatsApp / Telefone *</label>
                  <input
                    id="pg-telefone"
                    type="tel"
                    formControlName="telefone"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                    placeholder="(15) 99999-9999"
                  />
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label for="pg-bairro" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Bairro em Tatuí *</label>
                  <input
                    id="pg-bairro"
                    type="text"
                    formControlName="bairro"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                    placeholder="Ex: Centro / Jd. Wanderley"
                  />
                </div>

                <div>
                  <label for="pg-perfil" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Perfil / Público *</label>
                  <select
                    id="pg-perfil"
                    formControlName="perfil"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none bg-white"
                  >
                    <option value="Geral">Geral (Aberto a todos)</option>
                    <option value="Jovens (JA)">Jovens (JA)</option>
                    <option value="Famílias">Famílias</option>
                    <option value="Casais">Casais</option>
                    <option value="Universitários">Universitários</option>
                    <option value="Melhor Idade">Melhor Idade</option>
                  </select>
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label for="pg-dia" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Dia da Semana *</label>
                  <input
                    id="pg-dia"
                    type="text"
                    formControlName="dia"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                    placeholder="Ex: Terça-feira"
                  />
                </div>

                <div>
                  <label for="pg-horario" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Horário *</label>
                  <input
                    id="pg-horario"
                    type="text"
                    formControlName="horario"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                    placeholder="Ex: 19:30"
                  />
                </div>
              </div>

              <div>
                <label for="pg-descricao" class="block text-xs font-semibold uppercase text-advent-muted mb-1">Descrição do PG *</label>
                <textarea
                  id="pg-descricao"
                  rows="3"
                  formControlName="descricao"
                  class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                  placeholder="Conte um pouco sobre a dinâmica deste Pequeno Grupo..."
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
                  [disabled]="pgForm.invalid || isSaving()"
                  class="rounded-card bg-advent-blue px-6 py-2 text-xs font-semibold text-white shadow hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner disabled:opacity-50 cursor-pointer"
                >
                  {{ isSaving() ? 'Salvando...' : 'Salvar PG' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminPgsPage implements OnInit {
  private readonly cmsService = inject(AdminCmsService);

  readonly pgs = signal<PequenoGrupo[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isSaving = signal<boolean>(false);
  readonly isModalOpen = signal<boolean>(false);
  readonly editingId = signal<string | null>(null);
  readonly feedbackMsg = signal<string | null>(null);

  readonly pgForm = new FormGroup({
    nome: new FormControl('', [Validators.required, Validators.minLength(3)]),
    lider: new FormControl('', [Validators.required, Validators.minLength(3)]),
    telefone: new FormControl('', [Validators.required, Validators.minLength(10)]),
    bairro: new FormControl('', [Validators.required]),
    dia: new FormControl('Terça-feira', [Validators.required]),
    horario: new FormControl('19:30', [Validators.required]),
    perfil: new FormControl<'Geral' | 'Jovens (JA)' | 'Famílias' | 'Casais' | 'Universitários' | 'Melhor Idade'>(
      'Geral',
      [Validators.required],
    ),
    descricao: new FormControl('', [Validators.required, Validators.minLength(5)]),
  });

  async ngOnInit(): Promise<void> {
    await this.loadPgs();
  }

  async loadPgs(): Promise<void> {
    this.isLoading.set(true);
    const firestorePgs = await this.cmsService.getPgs();
    if (firestorePgs.length > 0) {
      this.pgs.set(firestorePgs);
    } else {
      this.pgs.set(defaultPgs as PequenoGrupo[]);
    }
    this.isLoading.set(false);
  }

  openModal(): void {
    this.editingId.set(null);
    this.pgForm.reset({ dia: 'Terça-feira', horario: '19:30', perfil: 'Geral' });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  editPg(pg: PequenoGrupo): void {
    this.editingId.set(pg.id || null);
    this.pgForm.patchValue({
      nome: pg.nome,
      lider: pg.lider,
      telefone: pg.telefone,
      bairro: pg.bairro,
      dia: pg.dia,
      horario: pg.horario,
      perfil: pg.perfil,
      descricao: pg.descricao,
    });
    this.isModalOpen.set(true);
  }

  async savePg(): Promise<void> {
    if (this.pgForm.invalid) return;
    this.isSaving.set(true);
    const formVal = this.pgForm.value;
    const pgData: Partial<PequenoGrupo> = {
      nome: formVal.nome!,
      lider: formVal.lider!,
      telefone: formVal.telefone!,
      bairro: formVal.bairro!,
      dia: formVal.dia!,
      horario: formVal.horario!,
      perfil: formVal.perfil!,
      descricao: formVal.descricao!,
      ativo: true,
    };

    try {
      await this.cmsService.savePg(pgData, this.editingId() || undefined);
      this.feedbackMsg.set('Pequeno Grupo salvo com sucesso!');
      setTimeout(() => this.feedbackMsg.set(null), 4000);
      this.closeModal();
      await this.loadPgs();
    } catch {
      this.pgs.update((prev) => [pgData as PequenoGrupo, ...prev]);
      this.feedbackMsg.set('PG adicionado na visualização local!');
      setTimeout(() => this.feedbackMsg.set(null), 4000);
      this.closeModal();
    } finally {
      this.isSaving.set(false);
    }
  }

  async deletePg(pg: PequenoGrupo): Promise<void> {
    if (!confirm(`Deseja excluir o PG "${pg.nome}"?`)) return;
    try {
      if (pg.id) {
        await this.cmsService.deletePg(pg.id);
      }
      this.pgs.update((prev) => prev.filter((p) => p !== pg && p.id !== pg.id));
      this.feedbackMsg.set('Pequeno Grupo removido.');
      setTimeout(() => this.feedbackMsg.set(null), 4000);
    } catch {
      this.pgs.update((prev) => prev.filter((p) => p !== pg));
    }
  }
}
