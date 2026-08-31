import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { EscalaItem } from '../../../core/models/content.models';
import {
  generateGoogleCalendarUrl,
  generateIcsBlob,
  downloadIcsFile,
  generateWhatsAppTrocaUrl,
  normalizeText,
} from '../utils/escalas.utils';

@Component({
  selector: 'app-escala-ministerio-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="group relative rounded-xl border border-advent-border/60 bg-white/70 p-4 transition-all hover:border-advent-blue/40 hover:bg-white hover:shadow-xs dark:bg-slate-800/60 dark:hover:bg-slate-800"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <!-- Info Principal -->
        <div class="flex items-start gap-3 min-w-0">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-advent-blue/10 text-advent-blue dark:bg-advent-blue/20 dark:text-blue-300"
            [attr.aria-hidden]="true"
          >
            <span class="material-symbols-outlined text-[20px]">{{ iconName() }}</span>
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h4 class="text-sm font-bold text-advent-text dark:text-white truncate">
                {{ escala().departamento }}
              </h4>
              @if (escala().horario) {
                <span
                  class="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                >
                  <span class="material-symbols-outlined text-[14px]">schedule</span>
                  {{ escala().horario }}
                </span>
              }
            </div>

            <!-- Lista de Oficiais -->
            <div class="mt-2.5 flex flex-wrap gap-1.5">
              @for (oficial of escala().oficiais; track oficial) {
                <span
                  class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors"
                  [class.highlight-oficial]="isHighlighted(oficial)"
                  [class.bg-amber-100]="isHighlighted(oficial)"
                  [class.text-amber-900]="isHighlighted(oficial)"
                  [class.dark:bg-amber-900/40]="isHighlighted(oficial)"
                  [class.dark:text-amber-200]="isHighlighted(oficial)"
                  [class.ring-2]="isHighlighted(oficial)"
                  [class.ring-amber-500]="isHighlighted(oficial)"
                  [class.bg-slate-100]="!isHighlighted(oficial)"
                  [class.text-slate-800]="!isHighlighted(oficial)"
                  [class.dark:bg-slate-700/60]="!isHighlighted(oficial)"
                  [class.dark:text-slate-200]="!isHighlighted(oficial)"
                >
                  <span class="material-symbols-outlined text-[14px]">person</span>
                  {{ oficial }}
                </span>
              }
            </div>

            @if (escala().observacoes) {
              <p class="mt-2 text-xs text-advent-muted dark:text-slate-400 italic">
                {{ escala().observacoes }}
              </p>
            }
          </div>
        </div>

        <!-- Ações Rápidas -->
        <div class="flex items-center gap-1.5 self-end sm:self-start shrink-0 pt-1">
          <!-- WhatsApp Troca -->
          <a
            [href]="whatsappUrl()"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 rounded-lg border border-advent-border bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 cursor-pointer min-h-[36px] transition-colors"
            title="Solicitar troca ou tirar dúvida via WhatsApp"
            aria-label="Solicitar troca ou falar com líder via WhatsApp"
          >
            <span class="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">chat</span>
            <span class="hidden md:inline">Trocar</span>
          </a>

          <!-- Google Calendar -->
          <a
            [href]="googleCalUrl()"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 rounded-lg border border-advent-border bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 cursor-pointer min-h-[36px] transition-colors"
            title="Adicionar ao Google Calendar"
            aria-label="Adicionar escala ao Google Calendar"
          >
            <span class="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">calendar_today</span>
            <span class="hidden md:inline">Google</span>
          </a>

          <!-- Download .ICS -->
          <button
            type="button"
            (click)="onDownloadIcs()"
            class="inline-flex items-center gap-1 rounded-lg border border-advent-border bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 cursor-pointer min-h-[36px] transition-colors"
            title="Baixar arquivo .ICS (Apple / Outlook)"
            aria-label="Baixar arquivo ICS para Apple ou Outlook"
          >
            <span class="material-symbols-outlined text-[16px]">download</span>
            <span class="hidden md:inline">.ICS</span>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class EscalaMinisterioRowComponent {
  readonly escala = input.required<EscalaItem>();
  readonly highlightName = input<string>('');

  readonly iconName = computed(() => {
    const dept = normalizeText(this.escala().departamento);
    if (dept.includes('som') || dept.includes('sonorizacao') || dept.includes('transmissao')) return 'volume_up';
    if (dept.includes('diacon')) return 'volunteer_activism';
    if (dept.includes('recep')) return 'waving_hand';
    if (dept.includes('musica') || dept.includes('louvor')) return 'piano';
    if (dept.includes('escola') || dept.includes('sabatina')) return 'menu_book';
    if (dept.includes('infantil') || dept.includes('crianca')) return 'child_care';
    return 'group';
  });

  readonly googleCalUrl = computed(() => generateGoogleCalendarUrl(this.escala()));
  readonly whatsappUrl = computed(() => generateWhatsAppTrocaUrl(this.escala()));

  isHighlighted(oficial: string): boolean {
    const search = normalizeText(this.highlightName());
    if (!search || search.length < 2) return false;
    return normalizeText(oficial).includes(search);
  }

  onDownloadIcs(): void {
    const esc = this.escala();
    const blob = generateIcsBlob(esc);
    const filename = `escala-${esc.departamento.toLowerCase().replace(/\s+/g, '-')}-${esc.data}.ics`;
    downloadIcsFile(blob, filename);
  }
}
