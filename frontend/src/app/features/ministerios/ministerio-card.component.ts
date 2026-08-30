import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Ministerio } from '../../core/models/content.models';

@Component({
  selector: 'app-ministerio-card',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="flex flex-col justify-between rounded-2xl border border-advent-border bg-white overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <div>
        @if (ministerio().banner_url || ministerio().imagem_url) {
          <div class="aspect-video w-full overflow-hidden bg-gray-100 border-b border-advent-border">
            <img
              [src]="ministerio().banner_url || ministerio().imagem_url"
              [alt]="ministerio().nome"
              class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          </div>
        } @else {
          <div class="h-3 bg-linear-to-r from-advent-blue via-blue-400 to-advent-gold/70"></div>
        }

        <div class="p-6">
          <div class="flex flex-wrap items-center gap-2 mb-3">
            @if (ministerio().categoria) {
              <span
                class="inline-block rounded-md bg-advent-blue/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-advent-blue"
              >
                {{ ministerio().categoria }}
              </span>
            }

            @if (ministerio().destaque) {
              <span class="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                ⭐ Destaque
              </span>
            }
          </div>

          <h3 class="text-xl font-bold text-advent-text leading-snug">{{ ministerio().nome }}</h3>

          <p class="mt-2.5 text-sm text-advent-muted leading-relaxed">
            {{ ministerio().descricao }}
          </p>

          <div class="mt-4 space-y-2 border-t border-advent-border/60 pt-3 text-xs text-advent-text">
            @if (ministerio().lideres) {
              <p class="flex items-center gap-1.5 font-medium">
                <span class="text-advent-muted">👥 Liderança:</span>
                <span class="font-semibold text-advent-blue">{{ ministerio().lideres }}</span>
              </p>
            }

            @if (ministerio().publico_alvo) {
              <p class="flex items-center gap-1.5 font-medium">
                <span class="text-advent-muted">🎯 Público:</span>
                <span>{{ ministerio().publico_alvo }}</span>
              </p>
            }

            @if (ministerio().reunioes_horario) {
              <p class="flex items-start gap-1.5 font-medium">
                <span class="text-advent-muted shrink-0">⏰ Encontros:</span>
                <span>{{ ministerio().reunioes_horario }}</span>
              </p>
            }

            @if (ministerio().atividades && ministerio().atividades!.length > 0) {
              <div class="pt-2">
                <span class="text-advent-muted font-semibold block mb-1">Principais Atividades:</span>
                <ul class="list-disc list-inside space-y-0.5 text-advent-muted text-[11px]">
                  @for (ativ of ministerio().atividades!.slice(0, 3); track ativ) {
                    <li class="truncate">{{ ativ }}</li>
                  }
                </ul>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="p-6 pt-0 flex items-center justify-between border-t border-advent-border/50">
        <button
          type="button"
          (click)="details.emit(ministerio())"
          class="text-xs font-semibold text-advent-blue hover:underline cursor-pointer"
        >
          Ver detalhes completos →
        </button>

        <div class="flex items-center gap-2">
          @if (ministerio().contato_whatsapp) {
            <a
              class="rounded-lg bg-green-100 hover:bg-green-600 hover:text-white text-green-700 px-3 py-1.5 text-xs font-bold transition-colors"
              [href]="'https://wa.me/' + ministerio().contato_whatsapp"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          }

          <a
            class="rounded-lg bg-advent-blue/10 hover:bg-advent-blue hover:text-white text-advent-blue px-3 py-1.5 text-xs font-bold transition-colors"
            routerLink="/contato"
          >
            Quero Servir
          </a>
        </div>
      </div>
    </article>
  `,
})
export class MinisterioCardComponent {
  readonly ministerio = input.required<Ministerio>();
  readonly details = output<Ministerio>();
}
