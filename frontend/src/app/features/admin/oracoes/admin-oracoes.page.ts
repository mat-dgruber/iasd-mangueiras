import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { AdminCmsService, PedidoOracaoAdmin } from '../../../core/services/admin-cms.service';

@Component({
  selector: 'app-admin-oracoes-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <header class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-advent-text md:text-3xl">
            🙏 Caixa de Pedidos de Oração & Estudos
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
              class="rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer"
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

      @if (feedbackMsg()) {
        <div class="mt-4 rounded-card border border-green-200 bg-green-50 p-3.5 text-xs font-semibold text-green-800 animate-fadeIn" role="status">
          ✓ {{ feedbackMsg() }}
        </div>
      }

      <div class="mt-8 space-y-4">
        @if (isLoading()) {
          <div class="p-8 text-center text-sm text-advent-muted">Carregando pedidos de oração...</div>
        } @else if (filteredOracoes().length === 0) {
          <div class="rounded-2xl border border-dashed border-advent-border p-12 text-center text-advent-muted">
            Nenhum pedido de oração encontrado para o filtro selecionado.
          </div>
        } @else {
          <div class="grid gap-4">
            @for (oracao of filteredOracoes(); track oracao.id || oracao.nome) {
              <article class="rounded-2xl border border-advent-border bg-white p-5 shadow-xs transition-colors hover:border-advent-blue/40">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold text-advent-text">{{ oracao.nome }}</span>
                    @if (oracao.confidencial) {
                      <span class="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-800">
                        🔒 Confidencial
                      </span>
                    }
                    <span
                      class="rounded px-2 py-0.5 text-[10px] font-bold uppercase"
                      [class.bg-amber-100]="oracao.status === 'pendente'"
                      [class.text-amber-800]="oracao.status === 'pendente'"
                      [class.bg-green-100]="oracao.status === 'orado'"
                      [class.text-green-800]="oracao.status === 'orado'"
                    >
                      {{ oracao.status === 'orado' ? '✓ Orado' : 'Pendente' }}
                    </span>
                  </div>

                  @if (oracao.telefone) {
                    <a
                      [href]="'https://wa.me/' + cleanPhone(oracao.telefone)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-xs font-semibold text-green-700 hover:underline flex items-center gap-1"
                    >
                      💬 WhatsApp: {{ oracao.telefone }}
                    </a>
                  }
                </div>

                <p class="mt-3 text-xs text-advent-text whitespace-pre-line leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
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
                        class="rounded px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer"
                      >
                        ✓ Marcar como Orado
                      </button>
                    }
                    <button
                      type="button"
                      (click)="deleteOracao(oracao)"
                      class="rounded px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
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

  readonly oracoes = signal<PedidoOracaoAdmin[]>([]);
  readonly selectedFilter = signal<string>('Todos');
  readonly isLoading = signal<boolean>(true);
  readonly feedbackMsg = signal<string | null>(null);

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
          pedido: 'Peço oração pela saúde da minha família e por direção em uma nova decisão profissional.',
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
    this.feedbackMsg.set('Pedido marcado como orado.');
    setTimeout(() => this.feedbackMsg.set(null), 4000);
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
      this.feedbackMsg.set('Pedido excluído.');
      setTimeout(() => this.feedbackMsg.set(null), 4000);
    } catch {
      this.oracoes.update((prev) => prev.filter((o) => o !== oracao));
    }
  }
}
