import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EscalaItem } from '../../../core/models/content.models';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-escalas-page',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent, SkeletonComponent, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <!-- Header da Página de Escalas -->
      <header class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-advent-text md:text-3xl">
            Escalas dos Departamentos & Oficiais
          </h1>
          <p class="text-sm text-advent-muted mt-1">
            Organize e publique as escalas semanais de voluntários e equipes da igreja.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            (click)="copyFullEscalaWhatsApp()"
            class="inline-flex items-center gap-1.5 rounded-card bg-green-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-green-800 active:scale-[0.98] transition-all cursor-pointer min-h-[40px]"
            aria-label="Copiar escala completa para WhatsApp"
          >
            <svg class="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span>Copiar Escala WhatsApp</span>
          </button>

          <button
            type="button"
            (click)="generateAndDownloadStory()"
            class="inline-flex items-center gap-1.5 rounded-card border border-advent-border bg-white px-4 py-2.5 text-xs font-semibold text-advent-text shadow-sm hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer min-h-[40px]"
            aria-label="Gerar card visual da escala para stories"
          >
            <svg class="h-4 w-4 shrink-0 text-advent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Gerar Card (.PNG)</span>
          </button>

          <button
            type="button"
            (click)="openCreateModal()"
            class="inline-flex items-center gap-1.5 rounded-card bg-advent-blue px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-advent-blue-dark active:scale-[0.98] transition-all cursor-pointer min-h-[40px]"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Nova Escala</span>
          </button>
        </div>
      </header>

      <!-- Filtros por Departamento -->
      <div class="mt-6 flex flex-wrap gap-2 pt-4 border-t border-advent-border">
        @for (dep of departamentosFilter; track dep) {
          <button
            type="button"
            (click)="selectedDept.set(dep)"
            class="rounded-full px-3.5 py-1.5 min-h-[38px] sm:min-h-[34px] inline-flex items-center justify-center text-xs font-semibold transition-all cursor-pointer"
            [class.bg-advent-blue]="selectedDept() === dep"
            [class.text-white]="selectedDept() === dep"
            [class.bg-white]="selectedDept() !== dep"
            [class.text-advent-muted]="selectedDept() !== dep"
            [class.border]="selectedDept() !== dep"
            [class.border-advent-border]="selectedDept() !== dep"
          >
            {{ dep }}
          </button>
        }
      </div>

      <!-- Grid de Escalas -->
      <div class="mt-8">
        @if (isLoading()) {
          <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            @for (i of [1, 2, 3]; track i) {
              <div class="rounded-2xl border border-advent-border bg-white p-5 shadow-xs space-y-4">
                <div class="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <app-ui-skeleton width="120px" height="22px" rounded="full" />
                  <app-ui-skeleton width="90px" height="16px" rounded="sm" />
                </div>
                <div class="space-y-2">
                  <app-ui-skeleton width="80px" height="12px" rounded="sm" />
                  <app-ui-skeleton width="100%" height="32px" rounded="md" />
                  <app-ui-skeleton width="100%" height="32px" rounded="md" />
                </div>
                <app-ui-skeleton width="60%" height="16px" rounded="sm" />
                <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <app-ui-skeleton width="100px" height="16px" rounded="sm" />
                  <div class="flex gap-2">
                    <app-ui-skeleton width="45px" height="24px" rounded="sm" />
                    <app-ui-skeleton width="45px" height="24px" rounded="sm" />
                  </div>
                </div>
              </div>
            }
          </div>
        } @else if (filteredEscalas().length === 0) {
          <div class="rounded-2xl border border-dashed border-advent-border bg-white p-12 text-center text-advent-muted flex flex-col items-center justify-center">
            <svg class="h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <p class="font-medium text-advent-text mb-1">
              {{ selectedDept() === 'Todos' ? 'Nenhuma escala cadastrada' : 'Nenhuma escala para ' + selectedDept() }}
            </p>
            <p class="text-xs text-advent-muted mb-4 max-w-sm">
              Organize as equipes e voluntários cadastrando as escalas dos cultos e eventos.
            </p>
            <button
              type="button"
              (click)="openCreateModal()"
              class="rounded-card bg-advent-blue px-4 py-2 text-xs font-semibold text-white shadow hover:bg-advent-blue-dark active:scale-[0.98] transition-all cursor-pointer min-h-[38px] inline-flex items-center gap-1.5"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>+ Nova Escala</span>
            </button>
          </div>
        } @else {
          <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            @for (escala of filteredEscalas(); track (escala.id || escala.departamento)) {
              <article class="flex flex-col justify-between rounded-2xl border border-advent-border bg-white p-5 shadow-xs transition-all hover:border-advent-blue hover:shadow-md">
                <div>
                  <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <span class="rounded-full bg-advent-blue/10 px-2.5 py-0.5 text-[11px] font-bold text-advent-blue">
                      {{ escala.departamento }}
                    </span>
                    <span class="text-xs font-semibold text-advent-muted">
                      {{ escala.dia_semana }} ({{ escala.data }})
                    </span>
                  </div>

                  <div class="mt-4">
                    <span class="text-[11px] font-bold uppercase tracking-wider text-advent-muted block mb-1">
                      Oficiais Escalados:
                    </span>
                    <div class="space-y-1">
                      @for (oficial of escala.oficiais; track oficial) {
                        <div class="flex items-center gap-2 text-xs font-semibold text-advent-text bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                          <svg class="h-3.5 w-3.5 text-advent-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                          <span>{{ oficial }}</span>
                        </div>
                      }
                    </div>
                  </div>

                  @if (escala.horario) {
                    <p class="mt-3 text-xs text-advent-blue font-semibold inline-flex items-center gap-1.5">
                      <svg class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Horário: {{ escala.horario }}</span>
                    </p>
                  }

                  @if (escala.observacoes) {
                    <div class="mt-2 text-xs text-advent-muted bg-amber-50/70 p-2.5 rounded-lg border border-amber-100 flex items-start gap-2">
                      <svg class="h-4 w-4 shrink-0 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.002 6.002 0 00-4-5.659V7.5a4 4 0 118 0v-.409A6.002 6.002 0 0012 12.75zm-1.5 8.25h3a1.5 1.5 0 001.5-1.5v-.75H9v.75a1.5 1.5 0 001.5 1.5z" />
                      </svg>
                      <p class="leading-relaxed">{{ escala.observacoes }}</p>
                    </div>
                  }
                </div>

                <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    (click)="copySingleEscalaWhatsApp(escala)"
                    class="text-xs font-semibold text-green-700 hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    Copiar WhatsApp
                  </button>

                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      (click)="openEditModal(escala)"
                      class="rounded-lg px-2.5 py-1 text-xs font-semibold text-advent-blue hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      (click)="confirmDelete(escala)"
                      class="rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            }
          </div>
        }
      </div>

      <!-- Canvas Oculto para Renderização de Card PNG -->
      <canvas #storyCanvas class="hidden" width="1080" height="1920"></canvas>

      <!-- Modal de Criação / Edição de Escala -->
      <app-ui-modal
        [isOpen]="isModalOpen()"
        [title]="editingEscala() ? 'Editar Escala' : 'Nova Escala de Departamento'"
        [size]="'md'"
        (close)="closeModal()"
      >
        <form [formGroup]="escalaForm" (ngSubmit)="saveEscala()" class="space-y-4">
          <div>
            <label for="escala-departamento" class="block text-xs font-bold text-advent-text mb-1">
              Departamento *
            </label>
            <select
              id="escala-departamento"
              formControlName="departamento"
              class="w-full rounded-card border px-3 py-2 text-xs text-advent-text focus:outline-none transition-colors"
              [class.border-red-500]="escalaForm.get('departamento')?.invalid && escalaForm.get('departamento')?.touched"
              [class.border-advent-border]="!escalaForm.get('departamento')?.invalid || !escalaForm.get('departamento')?.touched"
              [class.focus:border-advent-blue]="!escalaForm.get('departamento')?.invalid || !escalaForm.get('departamento')?.touched"
              [class.focus:border-red-500]="escalaForm.get('departamento')?.invalid && escalaForm.get('departamento')?.touched"
            >
              @for (d of departamentos; track d) {
                <option [value]="d">{{ d }}</option>
              }
            </select>
            @if (escalaForm.get('departamento')?.invalid && escalaForm.get('departamento')?.touched) {
              <p class="mt-1 text-xs text-red-600">Selecione o departamento.</p>
            }
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label for="escala-data" class="block text-xs font-bold text-advent-text mb-1">
                Data *
              </label>
              <input
                id="escala-data"
                type="date"
                formControlName="data"
                class="w-full rounded-card border px-3 py-2 text-xs text-advent-text focus:outline-none transition-colors"
                [class.border-red-500]="escalaForm.get('data')?.invalid && escalaForm.get('data')?.touched"
                [class.border-advent-border]="!escalaForm.get('data')?.invalid || !escalaForm.get('data')?.touched"
                [class.focus:border-advent-blue]="!escalaForm.get('data')?.invalid || !escalaForm.get('data')?.touched"
                [class.focus:border-red-500]="escalaForm.get('data')?.invalid && escalaForm.get('data')?.touched"
              />
              @if (escalaForm.get('data')?.invalid && escalaForm.get('data')?.touched) {
                <p class="mt-1 text-xs text-red-600">A data é obrigatória.</p>
              }
            </div>
            <div>
              <label for="escala-dia-semana" class="block text-xs font-bold text-advent-text mb-1">
                Dia da Semana *
              </label>
              <input
                id="escala-dia-semana"
                type="text"
                formControlName="dia_semana"
                placeholder="Ex: Sábado"
                class="w-full rounded-card border px-3 py-2 text-xs text-advent-text focus:outline-none transition-colors"
                [class.border-red-500]="escalaForm.get('dia_semana')?.invalid && escalaForm.get('dia_semana')?.touched"
                [class.border-advent-border]="!escalaForm.get('dia_semana')?.invalid || !escalaForm.get('dia_semana')?.touched"
                [class.focus:border-advent-blue]="!escalaForm.get('dia_semana')?.invalid || !escalaForm.get('dia_semana')?.touched"
                [class.focus:border-red-500]="escalaForm.get('dia_semana')?.invalid && escalaForm.get('dia_semana')?.touched"
              />
              @if (escalaForm.get('dia_semana')?.invalid && escalaForm.get('dia_semana')?.touched) {
                <p class="mt-1 text-xs text-red-600">O dia da semana é obrigatório.</p>
              }
            </div>
          </div>

          <div>
            <label for="escala-oficiais" class="block text-xs font-bold text-advent-text mb-1">
              Oficiais Escalados (separados por vírgula) *
            </label>
            <input
              id="escala-oficiais"
              type="text"
              formControlName="oficiaisStr"
              placeholder="Ex: Carlos Silva, Lucas Oliveira, Matheus Diniz"
              class="w-full rounded-card border px-3 py-2 text-xs text-advent-text focus:outline-none transition-colors"
              [class.border-red-500]="escalaForm.get('oficiaisStr')?.invalid && escalaForm.get('oficiaisStr')?.touched"
              [class.border-advent-border]="!escalaForm.get('oficiaisStr')?.invalid || !escalaForm.get('oficiaisStr')?.touched"
              [class.focus:border-advent-blue]="!escalaForm.get('oficiaisStr')?.invalid || !escalaForm.get('oficiaisStr')?.touched"
              [class.focus:border-red-500]="escalaForm.get('oficiaisStr')?.invalid && escalaForm.get('oficiaisStr')?.touched"
            />
            @if (escalaForm.get('oficiaisStr')?.invalid && escalaForm.get('oficiaisStr')?.touched) {
              <p class="mt-1 text-xs text-red-600">Informe pelo menos um oficial.</p>
            }

            @if (uniqueOficiais().length > 0) {
              <div class="mt-2 flex flex-wrap items-center gap-1">
                <span class="text-[11px] font-semibold text-advent-muted mr-1">Sugestões:</span>
                @for (oficial of uniqueOficiais(); track oficial) {
                  <button
                    type="button"
                    (click)="appendOficial(oficial)"
                    class="rounded-md border border-advent-border bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700 hover:bg-advent-blue hover:text-white transition-colors cursor-pointer"
                  >
                    + {{ oficial }}
                  </button>
                }
              </div>
            }
          </div>

          <div>
            <label for="escala-horario" class="block text-xs font-bold text-advent-text mb-1">
              Horário / Período
            </label>
            <input
              id="escala-horario"
              type="text"
              formControlName="horario"
              placeholder="Ex: 08:45 às 12:00"
              class="w-full rounded-card border border-advent-border px-3 py-2 text-xs text-advent-text focus:border-advent-blue focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label for="escala-observacoes" class="block text-xs font-bold text-advent-text mb-1">
              Observações / Instruções
            </label>
            <textarea
              id="escala-observacoes"
              rows="2"
              formControlName="observacoes"
              placeholder="Ex: Chegar 15 min antes para conferência de equipamentos."
              class="w-full rounded-card border border-advent-border px-3 py-2 text-xs text-advent-text focus:border-advent-blue focus:outline-none transition-colors"
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              (click)="closeModal()"
              class="rounded-card border border-advent-border px-4 py-2 text-xs font-semibold text-advent-muted hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="escalaForm.invalid || isSaving()"
              class="rounded-card bg-advent-blue px-5 py-2 text-xs font-semibold text-white shadow hover:bg-advent-blue-dark transition-colors disabled:opacity-50 cursor-pointer"
            >
              {{ isSaving() ? 'Salvando…' : 'Salvar Escala' }}
            </button>
          </div>
        </form>
      </app-ui-modal>

      <!-- Diálogo de Confirmação de Exclusão -->
      <app-ui-confirm-dialog
        [isOpen]="!!escalaToDelete()"
        title="Excluir Escala"
        [message]="'Tem certeza que deseja excluir a escala de &quot;' + (escalaToDelete()?.departamento || '') + '&quot;? Esta ação não pode ser desfeita.'"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        [isLoading]="isDeleting()"
        (confirmed)="executeDeleteEscala()"
        (cancelled)="escalaToDelete.set(null)"
      />
    </div>
  `,
})
export class AdminEscalasPage implements OnInit {
  private readonly cmsService = inject(AdminCmsService);
  private readonly toastService = inject(ToastService);

  @ViewChild('storyCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly escalas = signal<EscalaItem[]>([]);
  readonly selectedDept = signal<string>('Todos');
  readonly isLoading = signal<boolean>(true);
  readonly isModalOpen = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly isDeleting = signal<boolean>(false);
  readonly editingEscala = signal<EscalaItem | null>(null);
  readonly escalaToDelete = signal<EscalaItem | null>(null);

  readonly departamentos = [
    'Sonorização & Transmissão',
    'Diaconato',
    'Recepção',
    'Escola Sabatina',
    'Música & Louvor',
    'Ministério Infantil',
  ] as const;

  readonly departamentosFilter = ['Todos', ...this.departamentos];

  readonly filteredEscalas = computed(() => {
    const list = this.escalas();
    const dept = this.selectedDept();
    if (dept === 'Todos') return list;
    return list.filter((e) => e.departamento === dept);
  });

  readonly uniqueOficiais = computed(() => {
    const set = new Set<string>();
    for (const esc of this.escalas()) {
      for (const ofc of esc.oficiais || []) {
        const trimmed = ofc.trim();
        if (trimmed) set.add(trimmed);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  });

  readonly escalaForm = new FormGroup({
    departamento: new FormControl('Sonorização & Transmissão', Validators.required),
    data: new FormControl('', Validators.required),
    dia_semana: new FormControl('Sábado', Validators.required),
    oficiaisStr: new FormControl('', Validators.required),
    horario: new FormControl(''),
    observacoes: new FormControl(''),
  });

  constructor() {
    this.escalaForm.get('data')?.valueChanges.subscribe((dataVal) => {
      if (dataVal) {
        const [year, month, day] = dataVal.split('-').map(Number);
        if (year && month && day) {
          const date = new Date(year, month - 1, day);
          const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
          const dia = daysOfWeek[date.getDay()];
          this.escalaForm.get('dia_semana')?.setValue(dia, { emitEvent: false });
        }
      }
    });
  }

  appendOficial(nome: string): void {
    const current = this.escalaForm.get('oficiaisStr')?.value?.trim() || '';
    if (!current) {
      this.escalaForm.get('oficiaisStr')?.setValue(nome);
    } else {
      const list = current.split(',').map((s) => s.trim());
      if (!list.includes(nome)) {
        this.escalaForm.get('oficiaisStr')?.setValue(`${current}, ${nome}`);
      }
    }
  }

  async ngOnInit(): Promise<void> {
    await this.loadEscalas();
  }

  async loadEscalas(): Promise<void> {
    this.isLoading.set(true);
    const list = await this.cmsService.getEscalas();
    if (list.length > 0) {
      this.escalas.set(list);
    } else {
      // Carrega padrão se o Firestore estiver vazio
      const defaultData: EscalaItem[] = [
        {
          id: 'escala-1',
          data: '2026-08-29',
          dia_semana: 'Sábado',
          departamento: 'Sonorização & Transmissão',
          oficiais: ['Matheus Diniz', 'Lucas Oliveira'],
          horario: '08:45 às 12:00',
          observacoes: 'Chegar 15 min antes para teste dos microfones e link do YouTube.',
        },
        {
          id: 'escala-2',
          data: '2026-08-29',
          dia_semana: 'Sábado',
          departamento: 'Diaconato',
          oficiais: ['Paulo Roberto', 'Gabriel Souza', 'José Silva'],
          horario: '08:40 às 12:30',
          observacoes: 'Apoio no estacionamento, recolhimento dos dízimos e climatização.',
        },
        {
          id: 'escala-3',
          data: '2026-08-29',
          dia_semana: 'Sábado',
          departamento: 'Recepção',
          oficiais: ['Ana Paula Diniz', 'Carla Rodrigues'],
          horario: '08:45 às 10:30',
          observacoes: 'Acolhimento aos visitantes na porta principal.',
        },
      ];
      this.escalas.set(defaultData);
    }
    this.isLoading.set(false);
  }

  openCreateModal(): void {
    this.editingEscala.set(null);
    this.escalaForm.reset({
      departamento: 'Sonorização & Transmissão',
      data: new Date().toISOString().split('T')[0],
      dia_semana: 'Sábado',
      oficiaisStr: '',
      horario: '08:45 às 12:00',
      observacoes: '',
    });
    this.isModalOpen.set(true);
  }

  openEditModal(escala: EscalaItem): void {
    this.editingEscala.set(escala);
    this.escalaForm.patchValue({
      departamento: escala.departamento,
      data: escala.data,
      dia_semana: escala.dia_semana,
      oficiaisStr: escala.oficiais.join(', '),
      horario: escala.horario || '',
      observacoes: escala.observacoes || '',
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingEscala.set(null);
  }

  async saveEscala(): Promise<void> {
    if (this.escalaForm.invalid) {
      this.escalaForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    const formVal = this.escalaForm.value;

    const oficiais = (formVal.oficiaisStr || '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload: Partial<EscalaItem> = {
      departamento: formVal.departamento as EscalaItem['departamento'],
      data: formVal.data || '',
      dia_semana: formVal.dia_semana || 'Sábado',
      oficiais,
      horario: formVal.horario || undefined,
      observacoes: formVal.observacoes || undefined,
    };

    const currentEditing = this.editingEscala();

    try {
      if (currentEditing?.id) {
        await this.cmsService.saveEscala(payload, currentEditing.id);
        this.escalas.update((prev) =>
          prev.map((item) =>
            item.id === currentEditing.id ? ({ ...item, ...payload } as EscalaItem) : item,
          ),
        );
        this.toastService.success('Escala atualizada com sucesso!');
      } else {
        const newId = await this.cmsService.saveEscala(payload);
        this.escalas.update((prev) => [{ id: newId, ...payload } as EscalaItem, ...prev]);
        this.toastService.success('Nova escala cadastrada com sucesso!');
      }
      this.closeModal();
    } catch {
      // Fallback local se offline
      const mockId = `mock-${Date.now()}`;
      this.escalas.update((prev) => [{ id: mockId, ...payload } as EscalaItem, ...prev]);
      this.toastService.success('Escala salva localmente.');
      this.closeModal();
    } finally {
      this.isSaving.set(false);
    }
  }

  confirmDelete(escala: EscalaItem): void {
    this.escalaToDelete.set(escala);
  }

  async executeDeleteEscala(): Promise<void> {
    const escala = this.escalaToDelete();
    if (!escala) return;

    this.isDeleting.set(true);
    try {
      if (escala.id) {
        await this.cmsService.deleteEscala(escala.id);
      }
      this.escalas.update((prev) => prev.filter((e) => e !== escala && e.id !== escala.id));
      this.toastService.success(`Escala de ${escala.departamento} excluída.`);
    } catch {
      this.escalas.update((prev) => prev.filter((e) => e !== escala));
      this.toastService.success(`Escala de ${escala.departamento} excluída localmente.`);
    } finally {
      this.isDeleting.set(false);
      this.escalaToDelete.set(null);
    }
  }

  copySingleEscalaWhatsApp(escala: EscalaItem): void {
    const text =
      `⛪ *IASD MANGUEIRAS — ESCALA ${escala.dia_semana.toUpperCase()}*\n` +
      `📅 *Data:* ${escala.data}\n` +
      `🏷️ *Departamento:* ${escala.departamento}\n` +
      `👥 *Oficiais:* ${escala.oficiais.join(', ')}\n` +
      (escala.horario ? `🕒 *Horário:* ${escala.horario}\n` : '') +
      (escala.observacoes ? `💡 *Obs:* ${escala.observacoes}\n` : '') +
      `\n_Deus abençoe a dedicação de todos no ministério!_`;

    try {
      navigator.clipboard?.writeText(text);
      this.toastService.success('Escala copiada para a área de transferência!');
    } catch {
      this.toastService.error('Não foi possível copiar para a área de transferência.');
    }
  }

  copyFullEscalaWhatsApp(): void {
    const list = this.escalas();
    if (list.length === 0) {
      this.toastService.warning('Nenhuma escala disponível para copiar.');
      return;
    }

    let text = `⛪ *ESCALA GERAL DOS DEPARTAMENTOS — IASD MANGUEIRAS*\n`;
    text += `📅 *Próximo Sábado*\n\n`;

    for (const item of list) {
      text += `🔹 *${item.departamento}*\n`;
      text += `   👥 ${item.oficiais.join(', ')}\n`;
      if (item.horario) text += `   🕒 ${item.horario}\n`;
      text += `\n`;
    }

    text += `_"Tudo o que fizerem, façam de todo o coração, como para o Senhor." (Colossenses 3:23)_\n`;
    text += `https://iasdmangueiras.org.br`;

    try {
      navigator.clipboard?.writeText(text);
      this.toastService.success('Escala geral copiada com sucesso para o WhatsApp!');
    } catch {
      this.toastService.error('Não foi possível copiar para a área de transferência.');
    }
  }

  generateAndDownloadStory(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) {
      this.toastService.error('Erro ao acessar o canvas para gerar imagem.');
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.toastService.error('Erro ao processar renderização da imagem.');
      return;
    }

    const width = 1080;
    const height = 1920;

    // Fundo Gradiente Nobre
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#062c4a');
    gradient.addColorStop(0.5, '#0c4a6e');
    gradient.addColorStop(1, '#072e4c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Borda Decorativa
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, width - 100, height - 100);

    // Cabeçalho
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('IASD MANGUEIRAS • TATUÍ', width / 2, 180);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText('ESCALA DOS DEPARTAMENTOS', width / 2, 250);

    // Linha de divisão
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 200, 290);
    ctx.lineTo(width / 2 + 200, 290);
    ctx.stroke();

    // Renderizar itens da escala
    let currentY = 380;
    const list = this.escalas().slice(0, 5);

    for (const item of list) {
      // Box de fundo para cada departamento
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(100, currentY - 40, width - 200, 180);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(100, currentY - 40, width - 200, 180);

      // Nome do Departamento
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.departamento, 140, currentY + 15);

      // Oficiais
      ctx.fillStyle = '#ffffff';
      ctx.font = '28px sans-serif';
      ctx.fillText(`👥 ${item.oficiais.join(', ')}`, 140, currentY + 70);

      // Horário
      if (item.horario) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '22px sans-serif';
        ctx.fillText(`🕒 ${item.horario}`, 140, currentY + 115);
      }

      currentY += 220;
    }

    // Rodapé
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('iasdmangueiras.org.br', width / 2, height - 120);

    // Download
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `escala-iasd-mangueiras.png`;
      link.href = dataUrl;
      link.click();
      this.toastService.success('Card da escala gerado e baixado com sucesso!');
    } catch {
      this.toastService.error('Erro ao gerar arquivo de imagem.');
    }
  }
}
