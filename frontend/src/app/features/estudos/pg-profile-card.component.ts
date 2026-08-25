import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { UserPgProfile, UserProfileService } from '../../core/services/user-profile.service';

@Component({
  selector: 'app-pg-profile-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="overflow-hidden rounded-2xl border border-advent-blue/20 bg-linear-to-br from-advent-blue/5 via-white to-blue-50/20 shadow-sm transition-all">
      @if (!isExpanded() && currentProfile()) {
        <!-- Modo Resumo / Colapsado -->
        <div class="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-advent-blue text-white shadow-xs">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-extrabold uppercase tracking-wider text-advent-blue">Seu Perfil Salvo</span>
                <span class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">
                  IA Ativa
                </span>
              </div>
              <p class="text-sm font-semibold text-advent-text mt-0.5">
                {{ summaryText() }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-2 sm:pt-0">
            <button
              type="button"
              (click)="isExpanded.set(true)"
              class="rounded-lg border border-advent-border bg-white px-3 py-1.5 text-xs font-bold text-advent-text hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              Editar Perfil
            </button>
            <button
              type="button"
              (click)="clearProfile()"
              class="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Apagar dados salvos no navegador"
            >
              Esquecer
            </button>
          </div>
        </div>
      } @else {
        <!-- Modo Expandido / Formulário Interativo -->
        <div class="p-6 md:p-7">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="rounded-full bg-advent-blue px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-white">
                  Rede Neural no Navegador
                </span>
                <span class="text-xs font-semibold text-advent-muted">Sem cookies • Sem cadastro</span>
              </div>
              <h2 class="mt-2 text-xl font-bold text-advent-text md:text-2xl">
                Encontre o Pequeno Grupo Ideal para Você
              </h2>
              <p class="mt-1 text-xs text-advent-muted md:text-sm">
                Nossa IA analisa seu momento e disponibilidade para recomendar os melhores encontros nos lares em Tatuí.
              </p>
            </div>

            @if (currentProfile()) {
              <button
                type="button"
                (click)="isExpanded.set(false)"
                class="text-xs font-semibold text-advent-muted hover:text-advent-text cursor-pointer"
              >
                ✕ Fechar
              </button>
            }
          </div>

          <!-- Campos de Perfil -->
          <div class="mt-6 space-y-5 border-t border-advent-border/60 pt-5">
            <!-- 1. Perfil / Público -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-advent-blue mb-2">
                1. Você se identifica mais com qual perfil?
              </label>
              <div class="flex flex-wrap gap-2">
                @for (p of perfis(); track p) {
                  <button
                    type="button"
                    (click)="selectedPerfil.set(p)"
                    class="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer"
                    [class.bg-advent-blue]="selectedPerfil() === p"
                    [class.text-white]="selectedPerfil() === p"
                    [class.shadow-xs]="selectedPerfil() === p"
                    [class.bg-white]="selectedPerfil() !== p"
                    [class.border]="selectedPerfil() !== p"
                    [class.border-advent-border]="selectedPerfil() !== p"
                    [class.text-advent-text]="selectedPerfil() !== p"
                    [class.hover:bg-slate-50]="selectedPerfil() !== p"
                  >
                    {{ p }}
                  </button>
                }
              </div>
            </div>

            <!-- 2. Bairro Preferido -->
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="profile-bairro" class="block text-xs font-bold uppercase tracking-wider text-advent-blue mb-1.5">
                  2. Bairro de Preferência em Tatuí
                </label>
                <select
                  id="profile-bairro"
                  [value]="selectedBairro()"
                  (change)="onBairroChange($event)"
                  class="w-full rounded-xl border border-advent-border bg-white px-3.5 py-2 text-xs font-medium text-advent-text focus:border-advent-blue focus:outline-none shadow-2xs"
                >
                  <option value="Todos">Qualquer bairro / Mais flexível</option>
                  @for (b of bairros(); track b) {
                    <option [value]="b">{{ b }}</option>
                  }
                </select>
              </div>

              <!-- 3. Turno de Horário -->
              <div>
                <span class="block text-xs font-bold uppercase tracking-wider text-advent-blue mb-1.5">
                  3. Período do Dia Preferido
                </span>
                <div class="flex gap-2">
                  @for (turno of turnos; track turno.id) {
                    <button
                      type="button"
                      (click)="toggleTurno(turno.id)"
                      class="flex-1 rounded-xl px-2.5 py-2 text-xs font-semibold transition-all border cursor-pointer text-center"
                      [class.bg-advent-blue]="isTurnoSelected(turno.id)"
                      [class.border-advent-blue]="isTurnoSelected(turno.id)"
                      [class.text-white]="isTurnoSelected(turno.id)"
                      [class.bg-white]="!isTurnoSelected(turno.id)"
                      [class.border-advent-border]="!isTurnoSelected(turno.id)"
                      [class.text-advent-text]="!isTurnoSelected(turno.id)"
                    >
                      {{ turno.label }}
                    </button>
                  }
                </div>
              </div>
            </div>

            <!-- 4. Dias Disponíveis -->
            <div>
              <span class="block text-xs font-bold uppercase tracking-wider text-advent-blue mb-2">
                4. Dias da Semana Livres para Encontros
              </span>
              <div class="flex flex-wrap gap-2">
                @for (dia of diasSemana; track dia) {
                  <button
                    type="button"
                    (click)="toggleDia(dia)"
                    class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border cursor-pointer"
                    [class.bg-advent-blue]="isDiaSelected(dia)"
                    [class.border-advent-blue]="isDiaSelected(dia)"
                    [class.text-white]="isDiaSelected(dia)"
                    [class.bg-white]="!isDiaSelected(dia)"
                    [class.border-advent-border]="!isDiaSelected(dia)"
                    [class.text-advent-text]="!isDiaSelected(dia)"
                  >
                    {{ dia }}
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- Ações -->
          <div class="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-advent-border/60 pt-5">
            <div class="flex items-center gap-1.5 text-[11px] text-advent-muted">
              <svg class="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span>Privacidade Total: Salvo exclusivamente no seu dispositivo (LocalStorage).</span>
            </div>

            <div class="flex items-center gap-3">
              <button
                type="button"
                (click)="save()"
                class="inline-flex items-center gap-2 rounded-xl bg-advent-blue px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-advent-blue-dark active:scale-[0.98] transition-all cursor-pointer"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                Calcular e Salvar Recomendações
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class PgProfileCardComponent {
  private readonly userProfileService = inject(UserProfileService);

  readonly bairros = input<string[]>([]);
  readonly perfis = input<string[]>([]);

  readonly profileSaved = output<UserPgProfile>();
  readonly profileCleared = output<void>();

  readonly currentProfile = computed(() => this.userProfileService.profile());
  readonly isExpanded = signal<boolean>(false);

  readonly selectedPerfil = signal<string>('Todos');
  readonly selectedBairro = signal<string>('Todos');
  readonly selectedTurnos = signal<('manha' | 'tarde' | 'noite')[]>(['noite']);
  readonly selectedDias = signal<string[]>([]);

  readonly turnos: { id: 'manha' | 'tarde' | 'noite'; label: string }[] = [
    { id: 'manha', label: '☀️ Manhã' },
    { id: 'tarde', label: '🌤️ Tarde' },
    { id: 'noite', label: '🌙 Noite' },
  ];

  readonly diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  readonly summaryText = computed(() => {
    const p = this.currentProfile();
    if (!p) return '';
    const parts: string[] = [];
    if (p.perfil && p.perfil !== 'Todos') parts.push(p.perfil);
    if (p.bairro && p.bairro !== 'Todos') parts.push(p.bairro);
    if (p.horarioPref.length) parts.push(p.horarioPref.join('/'));
    if (p.diasPref.length) parts.push(p.diasPref.join(', '));
    return parts.length ? parts.join(' • ') : 'Geral em Tatuí';
  });

  constructor() {
    const prof = this.userProfileService.profile();
    if (prof) {
      this.selectedPerfil.set(prof.perfil || 'Todos');
      this.selectedBairro.set(prof.bairro || 'Todos');
      this.selectedTurnos.set(prof.horarioPref || []);
      this.selectedDias.set(prof.diasPref || []);
      this.isExpanded.set(false);
    } else {
      this.isExpanded.set(true);
    }
  }

  onBairroChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedBairro.set(val);
  }

  isTurnoSelected(t: 'manha' | 'tarde' | 'noite'): boolean {
    return this.selectedTurnos().includes(t);
  }

  toggleTurno(t: 'manha' | 'tarde' | 'noite'): void {
    const current = this.selectedTurnos();
    if (current.includes(t)) {
      this.selectedTurnos.set(current.filter((item) => item !== t));
    } else {
      this.selectedTurnos.set([...current, t]);
    }
  }

  isDiaSelected(d: string): boolean {
    return this.selectedDias().includes(d);
  }

  toggleDia(d: string): void {
    const current = this.selectedDias();
    if (current.includes(d)) {
      this.selectedDias.set(current.filter((item) => item !== d));
    } else {
      this.selectedDias.set([...current, d]);
    }
  }

  save(): void {
    const data = {
      bairro: this.selectedBairro(),
      perfil: this.selectedPerfil(),
      horarioPref: this.selectedTurnos(),
      diasPref: this.selectedDias(),
    };
    this.userProfileService.saveProfile(data);
    this.isExpanded.set(false);
    const saved = this.userProfileService.profile();
    if (saved) {
      this.profileSaved.emit(saved);
    }
  }

  clearProfile(): void {
    this.userProfileService.clearProfile();
    this.selectedPerfil.set('Todos');
    this.selectedBairro.set('Todos');
    this.selectedTurnos.set(['noite']);
    this.selectedDias.set([]);
    this.isExpanded.set(true);
    this.profileCleared.emit();
  }
}
