import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Ministerio } from '../../core/models/content.models';

@Component({
  selector: 'app-ministerio-modal',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-ministerio-title"
      (click)="close.emit()"
    >
      <div
        class="w-full max-w-xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between pb-4 border-b border-advent-border">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-advent-blue">
              {{ ministerio().categoria }}
            </span>
            <h3 id="modal-ministerio-title" class="text-2xl font-bold text-advent-text mt-0.5">
              {{ ministerio().nome }}
            </h3>
          </div>
          <button
            type="button"
            (click)="close.emit()"
            class="text-advent-muted hover:text-advent-text cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
            aria-label="Fechar modal"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        @if (ministerio().banner_url || ministerio().imagem_url) {
          <div class="mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-advent-border shadow-xs bg-slate-100">
            <img
              [src]="ministerio().banner_url || ministerio().imagem_url"
              [alt]="ministerio().nome"
              class="h-full w-full object-cover"
              loading="lazy"
              width="600"
              height="338"
            />
          </div>
        }

        <div class="mt-5 space-y-4">
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-advent-muted mb-1">Sobre o Ministério</h4>
            <p class="text-sm text-advent-text leading-relaxed">{{ ministerio().descricao }}</p>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 bg-advent-neutral p-4 rounded-2xl border border-advent-border">
            @if (ministerio().lideres) {
              <div>
                <span class="text-xs font-bold text-advent-muted block">Liderança Responsável</span>
                <span class="text-sm font-semibold text-advent-blue">{{ ministerio().lideres }}</span>
              </div>
            }
            @if (ministerio().publico_alvo) {
              <div>
                <span class="text-xs font-bold text-advent-muted block">Público-Alvo</span>
                <span class="text-sm text-advent-text">{{ ministerio().publico_alvo }}</span>
              </div>
            }
            @if (ministerio().reunioes_horario) {
              <div class="sm:col-span-2">
                <span class="text-xs font-bold text-advent-muted block">Horários e Encontros</span>
                <span class="text-sm text-advent-text">{{ ministerio().reunioes_horario }}</span>
              </div>
            }
          </div>

          @if (ministerio().atividades && (ministerio().atividades?.length ?? 0) > 0) {
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-advent-muted mb-2">Projetos & Atividades</h4>
              <ul class="space-y-1.5">
                @for (ativ of ministerio().atividades; track ativ) {
                  <li class="flex items-start gap-2 text-xs md:text-sm text-advent-text">
                    <span class="material-symbols-outlined text-sm text-advent-blue">check_circle</span>
                    <span>{{ ativ }}</span>
                  </li>
                }
              </ul>
            </div>
          }
        </div>

        <div class="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-advent-border">
          <button
            type="button"
            (click)="close.emit()"
            class="w-full sm:w-auto rounded-card border border-advent-border px-5 min-h-[44px] flex items-center text-xs font-semibold text-advent-text hover:bg-slate-50 cursor-pointer"
          >
            Fechar
          </button>

          <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            @if (ministerio().contato_whatsapp) {
              <a
                class="w-full sm:w-auto rounded-card bg-green-600 px-6 min-h-[44px] flex items-center justify-center text-xs font-bold text-white shadow-sm hover:bg-green-700 active:scale-[0.98]"
                [href]="'https://wa.me/' + ministerio().contato_whatsapp"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            }

            <a
              routerLink="/contato"
              (click)="close.emit()"
              class="w-full sm:w-auto rounded-card bg-advent-blue px-6 min-h-[44px] flex items-center justify-center text-xs font-bold text-white shadow-sm hover:bg-advent-blue-dark active:scale-[0.98]"
            >
              Entrar em Contato para Servir →
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MinisterioModalComponent {
  readonly ministerio = input.required<Ministerio>();
  readonly close = output<void>();
}
