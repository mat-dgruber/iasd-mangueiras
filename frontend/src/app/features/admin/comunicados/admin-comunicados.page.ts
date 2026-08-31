import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { Comunicado } from '../../../core/models/content.models';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import defaultComunicados from '../../../../content/comunicados.json';

@Component({
  selector: 'app-admin-comunicados-page',
  standalone: true,
  imports: [ReactiveFormsModule, SkeletonComponent, ConfirmDialogComponent, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-advent-text md:text-3xl">
            Comunicados & Avisos
          </h1>
          <p class="text-sm text-advent-muted mt-1">
            Publique avisos importantes e alertas visíveis aos membros e visitantes.
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
          <span>Novo Comunicado</span>
        </button>
      </header>

      <div class="mt-8 space-y-4">
        @if (isLoading()) {
          <div class="grid gap-4">
            @for (i of [1, 2, 3]; track i) {
              <div class="rounded-2xl border border-advent-border bg-white p-5 shadow-xs space-y-3">
                <div class="flex items-center gap-2">
                  <app-ui-skeleton width="80px" height="20px" rounded="sm" />
                  <app-ui-skeleton width="100px" height="16px" rounded="sm" />
                </div>
                <app-ui-skeleton width="45%" height="22px" rounded="md" />
                <app-ui-skeleton width="90%" height="16px" rounded="sm" />
                <app-ui-skeleton width="70%" height="16px" rounded="sm" />
              </div>
            }
          </div>
        } @else if (comunicados().length === 0) {
          <div class="rounded-2xl border border-dashed border-advent-border bg-white p-12 text-center text-advent-muted flex flex-col items-center justify-center">
            <svg class="h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.75.932 1.345.932h.66c.595 0 1.098-.382 1.345-.932.401-.891.732-1.821.985-2.783m-4.32 0h4.32m0 0c.688.06 1.386.09 2.09.09h.75a4.5 4.5 0 100-9h-.75c-.704 0-1.402.03-2.09.09m0 0a17.842 17.842 0 00-4.32 0" />
            </svg>
            <p class="font-medium text-advent-text mb-1">Nenhum comunicado ativo</p>
            <p class="text-xs text-advent-muted mb-4 max-w-sm">Cadastre avisos importantes para manter a congregação e visitantes informados.</p>
            <button
              type="button"
              (click)="openModal()"
              class="rounded-card bg-advent-blue px-4 py-2 text-xs font-semibold text-white shadow hover:bg-advent-blue-dark active:scale-[0.98] transition-all cursor-pointer min-h-[38px] inline-flex items-center gap-1.5"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>+ Criar Primeiro Comunicado</span>
            </button>
          </div>
        } @else {
          <div class="grid gap-4">
            @for (com of comunicados(); track (com.id || com.titulo)) {
              <article class="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-advent-border bg-white p-5 shadow-xs transition-colors hover:border-advent-blue/40">
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
                    class="rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer min-h-[36px] flex items-center"
                    [class.bg-green-50]="com.ativo !== false"
                    [class.text-green-800]="com.ativo !== false"
                    [class.bg-slate-100]="com.ativo === false"
                    [class.text-slate-600]="com.ativo === false"
                    aria-label="Alternar status do comunicado {{ com.titulo }}"
                  >
                    {{ com.ativo !== false ? 'Pausar' : 'Ativar' }}
                  </button>
                  <button
                    type="button"
                    (click)="confirmDelete(com)"
                    class="rounded-lg px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer min-h-[36px] flex items-center"
                    aria-label="Excluir comunicado {{ com.titulo }}"
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
      <app-ui-modal
        [isOpen]="isModalOpen()"
        title="Novo Comunicado"
        [size]="'md'"
        (close)="closeModal()"
      >
        <form [formGroup]="comunicadoForm" (ngSubmit)="saveComunicado()" class="space-y-4">
          <div>
            <label for="com-titulo" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
              Título do Comunicado *
            </label>
            <input
              id="com-titulo"
              type="text"
              formControlName="titulo"
              class="w-full rounded-card border px-3.5 py-2 text-sm text-advent-text focus:outline-none transition-colors"
              [class.border-red-500]="comunicadoForm.get('titulo')?.invalid && comunicadoForm.get('titulo')?.touched"
              [class.border-advent-border]="!comunicadoForm.get('titulo')?.invalid || !comunicadoForm.get('titulo')?.touched"
              [class.focus:border-advent-blue]="!comunicadoForm.get('titulo')?.invalid || !comunicadoForm.get('titulo')?.touched"
              [class.focus:border-red-500]="comunicadoForm.get('titulo')?.invalid && comunicadoForm.get('titulo')?.touched"
              placeholder="Ex: Aviso de Santa Ceia neste sábado"
            />
            @if (comunicadoForm.get('titulo')?.invalid && comunicadoForm.get('titulo')?.touched) {
              <p class="mt-1 text-xs text-red-600">
                @if (comunicadoForm.get('titulo')?.errors?.['required']) {
                  O título é obrigatório.
                } @else if (comunicadoForm.get('titulo')?.errors?.['minlength']) {
                  O título deve ter no mínimo 3 caracteres.
                }
              </p>
            }
          </div>

          <div>
            <label for="com-data" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
              Data / Período
            </label>
            <input
              id="com-data"
              type="text"
              formControlName="data"
              class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none transition-colors"
              placeholder="Ex: Vigente até 30 de Março"
            />
          </div>

          <div>
            <label for="com-mensagem" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
              Mensagem *
            </label>
            <textarea
              id="com-mensagem"
              rows="4"
              formControlName="mensagem"
              class="w-full rounded-card border px-3.5 py-2 text-sm text-advent-text focus:outline-none transition-colors"
              [class.border-red-500]="comunicadoForm.get('mensagem')?.invalid && comunicadoForm.get('mensagem')?.touched"
              [class.border-advent-border]="!comunicadoForm.get('mensagem')?.invalid || !comunicadoForm.get('mensagem')?.touched"
              [class.focus:border-advent-blue]="!comunicadoForm.get('mensagem')?.invalid || !comunicadoForm.get('mensagem')?.touched"
              [class.focus:border-red-500]="comunicadoForm.get('mensagem')?.invalid && comunicadoForm.get('mensagem')?.touched"
              placeholder="Texto do comunicado a ser divulgado..."
            ></textarea>
            @if (comunicadoForm.get('mensagem')?.invalid && comunicadoForm.get('mensagem')?.touched) {
              <p class="mt-1 text-xs text-red-600">
                @if (comunicadoForm.get('mensagem')?.errors?.['required']) {
                  A mensagem é obrigatória.
                } @else if (comunicadoForm.get('mensagem')?.errors?.['minlength']) {
                  A mensagem deve ter no mínimo 5 caracteres.
                }
              </p>
            }
          </div>

          <div class="mt-6 flex justify-end gap-2 pt-3 border-t border-advent-border">
            <button
              type="button"
              (click)="closeModal()"
              class="rounded-card border border-advent-border px-4 py-2 text-xs font-semibold text-advent-text hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="comunicadoForm.invalid || isSaving()"
              class="rounded-card bg-advent-blue px-6 py-2 text-xs font-semibold text-white shadow hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner disabled:opacity-50 transition-all cursor-pointer"
            >
              {{ isSaving() ? 'Publicando...' : 'Publicar Comunicado' }}
            </button>
          </div>
        </form>
      </app-ui-modal>

      <!-- Diálogo de Confirmação de Exclusão -->
      <app-ui-confirm-dialog
        [isOpen]="!!comunicadoToDelete()"
        title="Excluir Comunicado"
        [message]="'Tem certeza que deseja excluir o comunicado &quot;' + (comunicadoToDelete()?.titulo || '') + '&quot;? Esta ação não pode ser desfeita.'"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        [isLoading]="isDeleting()"
        (confirmed)="executeDeleteComunicado()"
        (cancelled)="comunicadoToDelete.set(null)"
      />
    </div>
  `,
})
export class AdminComunicadosPage implements OnInit {
  private readonly cmsService = inject(AdminCmsService);
  private readonly toastService = inject(ToastService);

  readonly comunicados = signal<Comunicado[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isSaving = signal<boolean>(false);
  readonly isDeleting = signal<boolean>(false);
  readonly isModalOpen = signal<boolean>(false);
  readonly comunicadoToDelete = signal<Comunicado | null>(null);

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
    this.comunicadoForm.reset({
      titulo: '',
      data: '',
      mensagem: '',
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  async saveComunicado(): Promise<void> {
    if (this.comunicadoForm.invalid) {
      this.comunicadoForm.markAllAsTouched();
      return;
    }
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
      this.toastService.success('Comunicado publicado com sucesso!');
      this.closeModal();
      await this.loadComunicados();
    } catch {
      this.comunicados.update((prev) => [newCom as Comunicado, ...prev]);
      this.toastService.success('Comunicado adicionado na visualização local!');
      this.closeModal();
    } finally {
      this.isSaving.set(false);
    }
  }

  async toggleStatus(com: Comunicado): Promise<void> {
    const nextStatus = com.ativo === false;
    com.ativo = nextStatus;
    this.comunicados.update((prev) => [...prev]);
    this.toastService.info(nextStatus ? 'Comunicado ativado.' : 'Comunicado pausado.');
    if (com.id) {
      try {
        await this.cmsService.saveComunicado({ ativo: nextStatus }, com.id);
      } catch {
        // ok
      }
    }
  }

  confirmDelete(com: Comunicado): void {
    this.comunicadoToDelete.set(com);
  }

  async executeDeleteComunicado(): Promise<void> {
    const com = this.comunicadoToDelete();
    if (!com) return;

    this.isDeleting.set(true);
    try {
      if (com.id) {
        await this.cmsService.deleteComunicado(com.id);
      }
      this.comunicados.update((prev) => prev.filter((c) => c !== com && c.id !== com.id));
      this.toastService.success('Comunicado excluído com sucesso.');
    } catch {
      this.comunicados.update((prev) => prev.filter((c) => c !== com));
      this.toastService.success('Comunicado removido localmente.');
    } finally {
      this.isDeleting.set(false);
      this.comunicadoToDelete.set(null);
    }
  }
}
