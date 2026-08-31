import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { CultoEscalaGroup } from '../../../core/models/content.models';
import { EscalaMinisterioRowComponent } from './escala-ministerio-row.component';
import { formatEscalaShareText } from '../utils/escalas.utils';
import { ToastService } from '../../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-escala-culto-card',
  standalone: true,
  imports: [EscalaMinisterioRowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="overflow-hidden rounded-2xl border transition-all duration-300 shadow-sm"
      [class.border-advent-blue]="group().isProximoCulto && !group().isPassado"
      [class.ring-2]="group().isProximoCulto && !group().isPassado"
      [class.ring-advent-blue/20]="group().isProximoCulto && !group().isPassado"
      [class.border-advent-border]="!group().isProximoCulto || group().isPassado"
      [class.bg-white]="!group().isPassado"
      [class.dark:bg-slate-900]="!group().isPassado"
      [class.bg-slate-50/70]="group().isPassado"
      [class.dark:bg-slate-950/70]="group().isPassado"
      [class.opacity-85]="group().isPassado"
    >
      <!-- Header do Card -->
      <div
        class="flex flex-col gap-3 border-b border-advent-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        [class.bg-advent-blue/5]="group().isProximoCulto && !group().isPassado"
        [class.dark:bg-advent-blue/10]="group().isProximoCulto && !group().isPassado"
        [class.bg-slate-50/50]="!group().isProximoCulto"
        [class.dark:bg-slate-800/40]="!group().isProximoCulto"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-white border border-advent-border/80 shadow-2xs dark:bg-slate-800 dark:border-slate-700"
          >
            <span class="text-[10px] font-bold uppercase tracking-wider text-advent-blue dark:text-blue-400">
              {{ group().diaSemana.slice(0, 3) }}
            </span>
            <span class="text-base font-extrabold leading-none text-advent-text dark:text-white">
              {{ group().data.split('-')[2] }}
            </span>
          </div>

          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-base font-bold text-advent-text dark:text-white">
                {{ group().diaSemana }}, {{ group().dataFormatada }}
              </h3>

              @if (group().isHoje) {
                <span
                  class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Hoje
                </span>
              }

              @if (group().isProximoCulto && !group().isHoje && !group().isPassado) {
                <span
                  class="inline-flex items-center gap-1 rounded-full bg-advent-blue/10 px-2.5 py-0.5 text-xs font-bold text-advent-blue dark:bg-blue-950/80 dark:text-blue-300"
                >
                  Próximo Culto
                </span>
              }

              @if (group().isPassado) {
                <span
                  class="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                >
                  Encerrado
                </span>
              }
            </div>

            <p class="text-xs text-advent-muted dark:text-slate-400 mt-0.5">
              {{ group().escalas.length }} equipe{{ group().escalas.length > 1 ? 's' : '' }} escalada{{ group().escalas.length > 1 ? 's' : '' }}
            </p>
          </div>
        </div>

        <!-- Botão de Compartilhar Escala do Culto -->
        <button
          type="button"
          (click)="onShare()"
          class="inline-flex items-center gap-1.5 rounded-xl border border-advent-border bg-white px-3 py-1.5 text-xs font-semibold text-advent-text shadow-2xs hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer min-h-[38px] dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700 self-start sm:self-center"
          aria-label="Compartilhar escala do culto"
        >
          <span class="material-symbols-outlined text-[16px] text-advent-blue dark:text-blue-400">share</span>
          <span>Compartilhar Dia</span>
        </button>
      </div>

      <!-- Lista de Ministérios -->
      <div class="p-5 flex flex-col gap-3">
        @for (escala of group().escalas; track escala.id || escala.departamento) {
          <app-escala-ministerio-row
            [escala]="escala"
            [highlightName]="highlightName()"
          />
        }
      </div>
    </article>
  `,
})
export class EscalaCultoCardComponent {
  private readonly toast = inject(ToastService, { optional: true });

  readonly group = input.required<CultoEscalaGroup>();
  readonly highlightName = input<string>('');

  async onShare(): Promise<void> {
    const text = formatEscalaShareText(this.group());
    const title = `Escala ${this.group().diaSemana} - ${this.group().dataFormatada}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text });
        return;
      } catch {
        // Usuário cancelou ou navegador não suportou, fallback para clipboard
      }
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        this.toast?.success('Escala do dia copiada para a área de transferência!');
      }
    } catch {
      this.toast?.error('Não foi possível copiar o texto da escala.');
    }
  }
}
