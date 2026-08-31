import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AdminCmsService, PedidoOracaoAdmin } from '../../../core/services/admin-cms.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-admin-oracoes-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <header class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-advent-text md:text-3xl">
            Caixa de Pedidos de Oração & Estudos
          </h1>
          <p class="text-sm text-advent-muted mt-1">
            Acompanhe os pedidos de oração e solicitações recebidos através do site.
          </p>
        </div>

        <!-- Filtros Rápidos -->
        <div class="flex flex-wrap gap-1.5">
          @for (f of ['Todos', 'Pendentes', 'Orados', 'Confidenciais']; track f) {
            <button
              type="button"
              (click)="selectedFilter.set(f)"
              class="rounded-full px-3.5 py-1.5 min-h-[38px] sm:min-h-[34px] inline-flex items-center justify-center text-xs font-semibold transition-colors cursor-pointer"
              [class.bg-advent-blue]="selectedFilter() === f"
              [class.text-white]="selectedFilter() === f"
              [class.bg-white]="selectedFilter() !== f"
              [class.text-advent-muted]="selectedFilter() !== f"
              [class.border]="selectedFilter() !== f"
              [class.border-advent-border]="selectedFilter() !== f"
            >
              {{ f }}
            </button>
          }
        </div>
      </header>

      <div class="mt-8 space-y-4">
        @if (isLoading()) {
          <div class="p-8 text-center text-sm text-advent-muted">Carregando pedidos de oração…</div>
        } @else if (filteredOracoes().length === 0) {
          <div
            class="rounded-2xl border border-dashed border-advent-border p-12 text-center text-advent-muted"
          >
            Nenhum pedido de oração encontrado para o filtro selecionado.
          </div>
        } @else {
          <div class="grid gap-4">
            @for (oracao of filteredOracoes(); track oracao.id || oracao.nome) {
              <article
                class="rounded-2xl border border-advent-border bg-white p-5 shadow-xs transition-colors hover:border-advent-blue/40"
              >
                <div
                  class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100"
                >
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold text-advent-text">{{ oracao.nome }}</span>
                    @if (oracao.confidencial) {
                      <span
                        class="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-800"
                      >
                        <svg class="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        Confidencial
                      </span>
                    }
                    <span
                      class="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase"
                      [class.bg-amber-100]="oracao.status === 'pendente'"
                      [class.text-amber-800]="oracao.status === 'pendente'"
                      [class.bg-green-100]="oracao.status === 'orado'"
                      [class.text-green-800]="oracao.status === 'orado'"
                    >
                      @if (oracao.status === 'orado') {
                        <svg class="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Orado
                      } @else {
                        Pendente
                      }
                    </span>
                  </div>

                  @if (oracao.telefone) {
                    <a
                      [href]="'https://wa.me/' + cleanPhone(oracao.telefone)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-xs font-semibold text-green-700 hover:underline inline-flex items-center gap-1.5 min-h-[36px]"
                    >
                      <svg class="h-3.5 w-3.5 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                      WhatsApp: {{ oracao.telefone }}
                    </a>
                  }
                </div>

                <p
                  class="mt-3 text-xs text-advent-text whitespace-pre-line leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100"
                >
                  {{ oracao.pedido }}
                </p>

                <div class="mt-4 flex items-center justify-between gap-2">
                  <span class="text-[11px] text-advent-muted">
                    Equipe de Oração e Ministério Pessoal
                  </span>

                  <div class="flex items-center gap-2">
                    @if (oracao.status !== 'orado') {
                      <button
                        type="button"
                        (click)="markAsOrado(oracao)"
                        class="rounded-lg px-3.5 py-2 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer min-h-[36px] inline-flex items-center gap-1.5"
                        aria-label="Marcar como orado o pedido de {{ oracao.nome }}"
                      >
                        <svg class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Marcar como Orado
                      </button>
                    }
                    <button
                      type="button"
                      (click)="deleteOracao(oracao)"
                      class="rounded-lg px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer min-h-[36px] flex items-center"
                      aria-label="Excluir pedido de {{ oracao.nome }}"
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
    </div>
  `,
})
export class AdminOracoesPage implements OnInit {
  private readonly cmsService = inject(AdminCmsService);
  private readonly toastService = inject(ToastService);

  readonly oracoes = signal<PedidoOracaoAdmin[]>([]);
  readonly selectedFilter = signal<string>('Todos');
  readonly isLoading = signal<boolean>(true);

  readonly filteredOracoes = computed(() => {
    const list = this.oracoes();
    const filter = this.selectedFilter();
    if (filter === 'Pendentes') return list.filter((o) => o.status !== 'orado');
    if (filter === 'Orados') return list.filter((o) => o.status === 'orado');
    if (filter === 'Confidenciais') return list.filter((o) => o.confidencial);
    return list;
  });

  async ngOnInit(): Promise<void> {
    await this.loadOracoes();
  }

  async loadOracoes(): Promise<void> {
    this.isLoading.set(true);
    const firestoreOracoes = await this.cmsService.getOracoes();
    if (firestoreOracoes.length > 0) {
      this.oracoes.set(firestoreOracoes);
    } else {
      // Exemplo ilustrativo se vazio
      this.oracoes.set([
        {
          id: 'mock-1',
          nome: 'Maria Silva',
          telefone: '(15) 99888-7766',
          pedido:
            'Peço oração pela saúde da minha família e por direção em uma nova decisão profissional.',
          confidencial: false,
          status: 'pendente',
        },
        {
          id: 'mock-2',
          nome: 'Carlos Santos',
          telefone: '(15) 99777-6655',
          pedido: 'Solicitação de Estudo Bíblico gratuito (digital). Telefone: (15) 99777-6655',
          confidencial: true,
          status: 'orado',
        },
      ]);
    }
    this.isLoading.set(false);
  }

  cleanPhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  async markAsOrado(oracao: PedidoOracaoAdmin): Promise<void> {
    oracao.status = 'orado';
    this.oracoes.update((prev) => [...prev]);
    this.toastService.success(`Pedido de ${oracao.nome} marcado como orado.`);
    if (oracao.id) {
      try {
        await this.cmsService.updateOracaoStatus(oracao.id, 'orado');
      } catch {
        // ok
      }
    }
  }

  async deleteOracao(oracao: PedidoOracaoAdmin): Promise<void> {
    if (!confirm(`Excluir o pedido de "${oracao.nome}"?`)) return;
    try {
      if (oracao.id) {
        await this.cmsService.deleteOracao(oracao.id);
      }
      this.oracoes.update((prev) => prev.filter((o) => o !== oracao && o.id !== oracao.id));
      this.toastService.info(`Pedido de ${oracao.nome} excluído.`);
    } catch {
      this.oracoes.update((prev) => prev.filter((o) => o !== oracao));
    }
  }
}
