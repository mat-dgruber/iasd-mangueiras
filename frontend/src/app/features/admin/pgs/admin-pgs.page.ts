import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { PequenoGrupo } from '../../../core/models/content.models';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import defaultPgs from '../../../../content/pgs.json';

@Component({
  selector: 'app-admin-pgs-page',
  standalone: true,
  imports: [ReactiveFormsModule, ConfirmDialogComponent, SkeletonComponent],
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
          class="rounded-card bg-advent-blue px-5 py-2.5 text-xs font-semibold text-white shadow transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner cursor-pointer min-h-[40px] flex items-center justify-center gap-1.5"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          + Novo Pequeno Grupo
        </button>
      </header>

      <!-- Lista de PGs -->
      <div class="mt-8 space-y-4">
        @if (isLoading()) {
          <div class="grid gap-4 sm:grid-cols-2" aria-busy="true" aria-label="Carregando pequenos grupos">
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="rounded-2xl border border-advent-border bg-white p-5 shadow-xs space-y-3">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <app-ui-skeleton width="140px" height="1.25rem" rounded="sm" />
                    <app-ui-skeleton width="70px" height="1.25rem" rounded="full" />
                  </div>
                  <app-ui-skeleton width="60px" height="1rem" rounded="sm" />
                </div>
                <app-ui-skeleton width="180px" height="1rem" rounded="sm" />
                <app-ui-skeleton width="100%" height="2.5rem" rounded="md" />
                <div class="flex items-center justify-between pt-2">
                  <app-ui-skeleton width="120px" height="1.5rem" rounded="sm" />
                  <div class="flex gap-2">
                    <app-ui-skeleton width="70px" height="2rem" rounded="md" />
                    <app-ui-skeleton width="70px" height="2rem" rounded="md" />
                  </div>
                </div>
              </div>
            }
          </div>
        } @else if (pgs().length === 0) {
          <div
            class="rounded-2xl border border-dashed border-advent-border bg-white p-12 text-center text-advent-muted"
          >
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-advent-muted mb-3">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-advent-text">Nenhum Pequeno Grupo cadastrado</p>
            <p class="text-xs text-advent-muted mt-1">
              Cadastre os grupos da igreja nos bairros para que os membros e visitantes encontrem um PG próximo.
            </p>
            <button
              type="button"
              (click)="openModal()"
              class="mt-4 inline-flex items-center gap-1.5 rounded-card bg-advent-blue px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-advent-blue-dark transition-all cursor-pointer min-h-[38px]"
            >
              + Cadastrar Primeiro PG
            </button>
          </div>
        } @else {
          <div class="grid gap-4 sm:grid-cols-2">
            @for (pg of pgs(); track (pg.id || pg.nome)) {
              <article
                class="flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-xs transition-colors"
                [class.border-advent-border]="pg.ativo !== false"
                [class.border-slate-200]="pg.ativo === false"
                [class.opacity-75]="pg.ativo === false"
              >
                <div>
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <span class="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                        {{ pg.perfil || 'Geral' }}
                      </span>
                      <span class="text-xs font-semibold text-advent-muted">
                        📍 {{ pg.bairro }}
                      </span>
                    </div>

                    @if (pg.ativo !== false) {
                      <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700">
                        <span class="h-2 w-2 rounded-full bg-green-500"></span> Ativo
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                        <span class="h-2 w-2 rounded-full bg-slate-300"></span> Pausado
                      </span>
                    }
                  </div>

                  <h2 class="mt-3 text-base font-bold text-advent-text">{{ pg.nome }}</h2>

                  <div class="mt-2 space-y-1 text-xs text-advent-muted">
                    <p><strong>Líder(es):</strong> {{ pg.lider }}</p>
                    <p><strong>Encontros:</strong> {{ pg.dia }} às {{ pg.horario }}</p>
                    @if (pg.telefone) {
                      <p><strong>Contato:</strong> {{ pg.telefone }}</p>
                    }
                  </div>

                  <p class="mt-3 text-xs text-advent-muted leading-relaxed line-clamp-2">{{ pg.descricao }}</p>
                </div>

                <div class="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    (click)="editPg(pg)"
                    class="rounded-lg px-3 py-1.5 text-xs font-semibold text-advent-blue bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer min-h-[34px]"
                    [attr.aria-label]="'Editar ' + pg.nome"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    (click)="toggleStatus(pg)"
                    class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer min-h-[34px]"
                    [class.bg-green-50]="pg.ativo !== false"
                    [class.text-green-800]="pg.ativo !== false"
                    [class.hover:bg-green-100]="pg.ativo !== false"
                    [class.bg-slate-100]="pg.ativo === false"
                    [class.text-slate-600]="pg.ativo === false"
                    [class.hover:bg-slate-200]="pg.ativo === false"
                    [attr.aria-label]="(pg.ativo !== false ? 'Pausar ' : 'Ativar ') + pg.nome"
                  >
                    {{ pg.ativo !== false ? 'Pausar' : 'Ativar' }}
                  </button>

                  <button
                    type="button"
                    (click)="openDeleteDialog(pg)"
                    class="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer min-h-[34px]"
                    [attr.aria-label]="'Excluir ' + pg.nome"
                  >
                    Excluir
                  </button>
                </div>
              </article>
            }
          </div>
        }
      </div>

      <!-- MODAL DE CADASTRO / EDIÇÃO DE PG -->
      @if (isModalOpen()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 border-b border-advent-border">
              <h2 id="modal-title" class="text-lg font-bold text-advent-text">
                {{ editingId() ? 'Editar Pequeno Grupo' : 'Novo Pequeno Grupo' }}
              </h2>
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
                <label for="pg-nome" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                  Nome do Pequeno Grupo *
                </label>
                <input
                  id="pg-nome"
                  type="text"
                  formControlName="nome"
                  class="w-full rounded-card border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                  [class.border-red-500]="pgForm.get('nome')?.invalid && pgForm.get('nome')?.touched"
                  [class.border-advent-border]="!pgForm.get('nome')?.invalid || !pgForm.get('nome')?.touched"
                  placeholder="Ex: PG Conexão Jovem, PG Esperança"
                />
                @if (pgForm.get('nome')?.invalid && pgForm.get('nome')?.touched) {
                  <span class="text-xs text-red-600 mt-1 block">Nome do grupo é obrigatório (mínimo 3 caracteres).</span>
                }
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="pg-lider" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                    Líder(es) Responsável(is) *
                  </label>
                  <input
                    id="pg-lider"
                    type="text"
                    formControlName="lider"
                    class="w-full rounded-card border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                    [class.border-red-500]="pgForm.get('lider')?.invalid && pgForm.get('lider')?.touched"
                    [class.border-advent-border]="!pgForm.get('lider')?.invalid || !pgForm.get('lider')?.touched"
                    placeholder="Ex: Lucas e Beatriz"
                  />
                  @if (pgForm.get('lider')?.invalid && pgForm.get('lider')?.touched) {
                    <span class="text-xs text-red-600 mt-1 block">Líder é obrigatório (mínimo 3 caracteres).</span>
                  }
                </div>

                <div>
                  <label for="pg-telefone" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    id="pg-telefone"
                    type="text"
                    formControlName="telefone"
                    class="w-full rounded-card border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                    [class.border-red-500]="pgForm.get('telefone')?.invalid && pgForm.get('telefone')?.touched"
                    [class.border-advent-border]="!pgForm.get('telefone')?.invalid || !pgForm.get('telefone')?.touched"
                    placeholder="Ex: (15) 99888-7766"
                  />
                  @if (pgForm.get('telefone')?.invalid && pgForm.get('telefone')?.touched) {
                    <span class="text-xs text-red-600 mt-1 block">Telefone é obrigatório.</span>
                  }
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="pg-bairro" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                    Bairro / Região *
                  </label>
                  <input
                    id="pg-bairro"
                    type="text"
                    formControlName="bairro"
                    class="w-full rounded-card border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                    [class.border-red-500]="pgForm.get('bairro')?.invalid && pgForm.get('bairro')?.touched"
                    [class.border-advent-border]="!pgForm.get('bairro')?.invalid || !pgForm.get('bairro')?.touched"
                    placeholder="Ex: Centro, Vila Dr. Laurindo"
                  />
                  @if (pgForm.get('bairro')?.invalid && pgForm.get('bairro')?.touched) {
                    <span class="text-xs text-red-600 mt-1 block">Bairro é obrigatório.</span>
                  }
                </div>

                <div>
                  <label for="pg-perfil" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                    Perfil do Grupo *
                  </label>
                  <select
                    id="pg-perfil"
                    formControlName="perfil"
                    class="w-full rounded-card border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none bg-white"
                    [class.border-red-500]="pgForm.get('perfil')?.invalid && pgForm.get('perfil')?.touched"
                    [class.border-advent-border]="!pgForm.get('perfil')?.invalid || !pgForm.get('perfil')?.touched"
                  >
                    <option value="Geral">Geral (Famílias)</option>
                    <option value="Jovens (JA)">Jovens (JA)</option>
                    <option value="Famílias">Famílias</option>
                    <option value="Casais">Casais</option>
                    <option value="Universitários">Universitários</option>
                    <option value="Melhor Idade">Melhor Idade</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="pg-dia" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                    Dia da Semana *
                  </label>
                  <select
                    id="pg-dia"
                    formControlName="dia"
                    class="w-full rounded-card border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none bg-white"
                    [class.border-red-500]="pgForm.get('dia')?.invalid && pgForm.get('dia')?.touched"
                    [class.border-advent-border]="!pgForm.get('dia')?.invalid || !pgForm.get('dia')?.touched"
                  >
                    <option value="Segunda-feira">Segunda-feira</option>
                    <option value="Terça-feira">Terça-feira</option>
                    <option value="Quarta-feira">Quarta-feira</option>
                    <option value="Quinta-feira">Quinta-feira</option>
                    <option value="Sexta-feira">Sexta-feira</option>
                    <option value="Sábado">Sábado</option>
                    <option value="Domingo">Domingo</option>
                  </select>
                </div>

                <div>
                  <label for="pg-horario" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                    Horário de Encontro *
                  </label>
                  <input
                    id="pg-horario"
                    type="text"
                    formControlName="horario"
                    class="w-full rounded-card border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                    [class.border-red-500]="pgForm.get('horario')?.invalid && pgForm.get('horario')?.touched"
                    [class.border-advent-border]="!pgForm.get('horario')?.invalid || !pgForm.get('horario')?.touched"
                    placeholder="Ex: 19:30 ou 20:00"
                  />
                  @if (pgForm.get('horario')?.invalid && pgForm.get('horario')?.touched) {
                    <span class="text-xs text-red-600 mt-1 block">Horário é obrigatório.</span>
                  }
                </div>
              </div>

              <div>
                <label for="pg-descricao" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                  Descrição & Dinâmica do Grupo *
                </label>
                <textarea
                  id="pg-descricao"
                  rows="3"
                  formControlName="descricao"
                  class="w-full rounded-card border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                  [class.border-red-500]="pgForm.get('descricao')?.invalid && pgForm.get('descricao')?.touched"
                  [class.border-advent-border]="!pgForm.get('descricao')?.invalid || !pgForm.get('descricao')?.touched"
                  placeholder="Ex: Encontro focado em comunhão, oração intercessória e estudo bíblico prático para jovens."
                ></textarea>
                @if (pgForm.get('descricao')?.invalid && pgForm.get('descricao')?.touched) {
                  <span class="text-xs text-red-600 mt-1 block">Descrição é obrigatória (mínimo 10 caracteres).</span>
                }
              </div>

              <div class="flex items-center gap-2 pt-1">
                <input
                  id="pg-ativo"
                  type="checkbox"
                  formControlName="ativo"
                  class="h-4 w-4 rounded border-advent-border text-advent-blue focus:ring-advent-blue"
                />
                <label for="pg-ativo" class="text-xs font-medium text-advent-text">
                  Pequeno Grupo ativo (visível na página pública de Pequenos Grupos)
                </label>
              </div>

              <div class="mt-6 flex justify-end gap-2 pt-3 border-t border-advent-border">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="rounded-card border border-advent-border px-4 py-2 text-xs font-semibold text-advent-text hover:bg-slate-50 cursor-pointer min-h-[38px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="pgForm.invalid || isSaving()"
                  class="rounded-card bg-advent-blue px-6 py-2 text-xs font-semibold text-white shadow hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner disabled:opacity-50 cursor-pointer min-h-[38px]"
                >
                  {{ isSaving() ? 'Salvando...' : (editingId() ? 'Salvar Alterações' : 'Cadastrar PG') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Diálogo de Confirmação de Exclusão -->
      <app-ui-confirm-dialog
        [isOpen]="isDeleteDialogOpen()"
        [title]="'Excluir Pequeno Grupo'"
        [message]="'Tem certeza que deseja excluir o ' + (pgToDelete()?.nome || 'Pequeno Grupo') + '? Esta ação não poderá ser desfeita.'"
        [confirmText]="'Excluir'"
        [cancelText]="'Cancelar'"
        [variant]="'danger'"
        [isLoading]="isDeleting()"
        (confirmed)="confirmDelete()"
        (cancelled)="cancelDelete()"
      />
    </div>
  `,
})
export class AdminPgsPage implements OnInit {
  private readonly cmsService = inject(AdminCmsService);
  private readonly toastService = inject(ToastService);

  readonly pgs = signal<PequenoGrupo[]>([]);
  readonly isModalOpen = signal<boolean>(false);
  readonly editingId = signal<string | null>(null);
  readonly isSaving = signal<boolean>(false);
  readonly isLoading = signal<boolean>(true);
  readonly isDeleteDialogOpen = signal<boolean>(false);
  readonly pgToDelete = signal<PequenoGrupo | null>(null);
  readonly isDeleting = signal<boolean>(false);

  readonly pgForm = new FormGroup({
    nome: new FormControl('', [Validators.required, Validators.minLength(3)]),
    lider: new FormControl('', [Validators.required, Validators.minLength(3)]),
    telefone: new FormControl('', [Validators.required]),
    bairro: new FormControl('', [Validators.required]),
    dia: new FormControl('Terça-feira', [Validators.required]),
    horario: new FormControl('19:30', [Validators.required]),
    perfil: new FormControl<PequenoGrupo['perfil']>('Geral', [Validators.required]),
    descricao: new FormControl('', [Validators.required, Validators.minLength(10)]),
    ativo: new FormControl(true),
  });

  async ngOnInit(): Promise<void> {
    await this.loadPgs();
  }

  async loadPgs(): Promise<void> {
    this.isLoading.set(true);
    try {
      const data = await this.cmsService.getPgs();
      if (data && data.length > 0) {
        this.pgs.set(data);
      } else {
        this.pgs.set(defaultPgs as unknown as PequenoGrupo[]);
      }
    } catch {
      this.pgs.set(defaultPgs as unknown as PequenoGrupo[]);
    } finally {
      this.isLoading.set(false);
    }
  }

  openModal(): void {
    this.editingId.set(null);
    this.pgForm.reset({
      nome: '',
      lider: '',
      telefone: '',
      bairro: '',
      dia: 'Terça-feira',
      horario: '19:30',
      perfil: 'Geral',
      descricao: '',
      ativo: true,
    });
    this.isModalOpen.set(true);
  }

  editPg(pg: PequenoGrupo): void {
    this.editingId.set(pg.id || null);
    this.pgForm.patchValue({
      nome: pg.nome,
      lider: pg.lider,
      telefone: pg.telefone || '',
      bairro: pg.bairro,
      dia: pg.dia,
      horario: pg.horario,
      perfil: pg.perfil || 'Geral',
      descricao: pg.descricao,
      ativo: pg.ativo !== false,
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingId.set(null);
  }

  async savePg(): Promise<void> {
    if (this.pgForm.invalid) return;
    this.isSaving.set(true);

    const formVal = this.pgForm.value;
    const editingId = this.editingId();

    const pgData: Partial<PequenoGrupo> = {
      nome: formVal.nome!,
      lider: formVal.lider!,
      telefone: formVal.telefone!,
      bairro: formVal.bairro!,
      dia: formVal.dia!,
      horario: formVal.horario!,
      perfil: formVal.perfil as PequenoGrupo['perfil'],
      descricao: formVal.descricao!,
      ativo: formVal.ativo ?? true,
    };

    try {
      if (editingId) {
        await this.cmsService.savePg(pgData, editingId);
        this.pgs.update((prev) =>
          prev.map((p) => (p.id === editingId ? { ...p, ...pgData, id: editingId } : p)),
        );
        this.toastService.success(`Pequeno Grupo "${pgData.nome}" atualizado com sucesso!`);
      } else {
        const newId = await this.cmsService.savePg(pgData);
        this.pgs.update((prev) => [...prev, { ...pgData, id: newId } as PequenoGrupo]);
        this.toastService.success(`Pequeno Grupo "${pgData.nome}" cadastrado com sucesso!`);
      }
      this.closeModal();
    } catch {
      // Fallback local se Firestore não estiver pronto
      if (editingId) {
        this.pgs.update((prev) =>
          prev.map((p) => (p.id === editingId ? { ...p, ...pgData, id: editingId } : p)),
        );
      } else {
        this.pgs.update((prev) => [...prev, pgData as PequenoGrupo]);
      }
      this.toastService.success(`Pequeno Grupo "${pgData.nome}" salvo localmente.`);
      this.closeModal();
    } finally {
      this.isSaving.set(false);
    }
  }

  async toggleStatus(pg: PequenoGrupo): Promise<void> {
    const newStatus = !(pg.ativo !== false);
    try {
      if (pg.id) {
        await this.cmsService.savePg({ ativo: newStatus }, pg.id);
      }
      this.pgs.update((prev) =>
        prev.map((p) => (p === pg || p.id === pg.id ? { ...p, ativo: newStatus } : p)),
      );
      this.toastService.success(
        newStatus ? `PG "${pg.nome}" ativado com sucesso.` : `PG "${pg.nome}" pausado.`,
      );
    } catch {
      this.pgs.update((prev) =>
        prev.map((p) => (p === pg || p.id === pg.id ? { ...p, ativo: newStatus } : p)),
      );
    }
  }

  openDeleteDialog(pg: PequenoGrupo): void {
    this.pgToDelete.set(pg);
    this.isDeleteDialogOpen.set(true);
  }

  cancelDelete(): void {
    this.isDeleteDialogOpen.set(false);
    this.pgToDelete.set(null);
  }

  // ponytail: backward compatible alias
  deletePg(pg: PequenoGrupo): void {
    this.openDeleteDialog(pg);
  }

  async confirmDelete(): Promise<void> {
    const pg = this.pgToDelete();
    if (!pg) return;

    this.isDeleting.set(true);
    try {
      if (pg.id) {
        await this.cmsService.deletePg(pg.id);
      }
      this.pgs.update((prev) => prev.filter((p) => p !== pg && p.id !== pg.id));
      this.toastService.success(`Pequeno Grupo "${pg.nome}" excluído com sucesso.`);
    } catch {
      this.pgs.update((prev) => prev.filter((p) => p !== pg && p.id !== pg.id));
      this.toastService.success(`Pequeno Grupo "${pg.nome}" removido.`);
    } finally {
      this.isDeleting.set(false);
      this.cancelDelete();
    }
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.isModalOpen()) {
      this.closeModal();
    }
  }
}
