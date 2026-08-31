import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  AdminCmsService,
  MensagemContatoAdmin,
} from '../../../core/services/admin-cms.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-admin-contatos-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <header class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-advent-text md:text-3xl">
            Mensagens de Contato
          </h1>
          <p class="text-sm text-advent-muted mt-1">
            Gerencie as mensagens e solicitações enviadas através do formulário Fale Conosco.
          </p>
        </div>

        <!-- Filtros Rápidos -->
        <div class="flex flex-wrap gap-1.5">
          @for (f of ['Todos', 'Não Lidos', 'Lidos', 'Respondidos']; track f) {
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
          <div class="p-8 text-center text-sm text-advent-muted">Carregando mensagens de contato…</div>
        } @else if (filteredContatos().length === 0) {
          <div
            class="rounded-2xl border border-dashed border-advent-border p-12 text-center text-advent-muted"
          >
            Nenhuma mensagem encontrada para o filtro selecionado.
          </div>
        } @else {
          <div class="grid gap-4">
            @for (item of filteredContatos(); track item.id || item.email) {
              <article
                class="rounded-2xl border border-advent-border bg-white p-5 shadow-xs transition-colors hover:border-advent-blue/40"
              >
                <div
                  class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100"
                >
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-bold text-advent-text">{{ item.nome }}</span>
                    @if (item.respondido) {
                      <span
                        class="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-800"
                      >
                        Respondido
                      </span>
                    } @else if (item.lido) {
                      <span
                        class="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700"
                      >
                        Lido
                      </span>
                    } @else {
                      <span
                        class="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800"
                      >
                        Novo / Não Lido
                      </span>
                    }
                  </div>

                  <div class="flex items-center gap-3 text-xs text-advent-muted">
                    <span>{{ item.email }}</span>
                    @if (item.telefone) {
                      <span>• {{ item.telefone }}</span>
                    }
                  </div>
                </div>

                <div class="mt-3">
                  @if (item.assunto) {
                    <p class="text-xs font-semibold text-advent-blue mb-1">
                      Assunto: {{ item.assunto }}
                    </p>
                  }
                  <p class="text-sm text-advent-text leading-relaxed whitespace-pre-line">
                    {{ item.mensagem }}
                  </p>
                </div>

                <!-- Ações e Controles de Status -->
                <div
                  class="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs"
                >
                  <div class="flex flex-wrap items-center gap-2">
                    @if (!item.lido) {
                      <button
                        type="button"
                        (click)="marcarLido(item, true)"
                        class="rounded-lg border border-advent-border bg-slate-50 px-2.5 py-1 font-medium text-advent-text hover:bg-slate-100 cursor-pointer"
                      >
                        Marcar como lido
                      </button>
                    } @else {
                      <button
                        type="button"
                        (click)="marcarLido(item, false)"
                        class="rounded-lg border border-advent-border bg-slate-50 px-2.5 py-1 font-medium text-advent-muted hover:bg-slate-100 cursor-pointer"
                      >
                        Marcar como não lido
                      </button>
                    }

                    @if (!item.respondido) {
                      <button
                        type="button"
                        (click)="marcarRespondido(item, true)"
                        class="rounded-lg bg-green-50 px-2.5 py-1 font-medium text-green-700 hover:bg-green-100 cursor-pointer"
                      >
                        ✓ Marcar como respondido
                      </button>
                    } @else {
                      <button
                        type="button"
                        (click)="marcarRespondido(item, false)"
                        class="rounded-lg bg-slate-50 px-2.5 py-1 font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        Desmarcar respondido
                      </button>
                    }
                  </div>

                  <div class="flex items-center gap-2">
                    @if (item.telefone) {
                      <a
                        [href]="getWhatsAppUrl(item.telefone, item.nome)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="rounded-lg bg-green-700 px-3 py-1 font-semibold text-white hover:bg-green-800 cursor-pointer inline-flex items-center gap-1"
                      >
                        WhatsApp
                      </a>
                    }

                    <a
                      [href]="'mailto:' + item.email + '?subject=' + encodeUri('Resposta IASD Mangueiras')"
                      class="rounded-lg border border-advent-blue bg-blue-50/60 px-3 py-1 font-semibold text-advent-blue hover:bg-advent-blue hover:text-white cursor-pointer inline-flex items-center gap-1"
                    >
                      E-mail
                    </a>

                    @if (item.id) {
                      <button
                        type="button"
                        (click)="excluir(item.id)"
                        class="rounded-lg px-2.5 py-1 font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                        title="Excluir mensagem"
                      >
                        Excluir
                      </button>
                    }
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
export class AdminContatosPage implements OnInit {
  private readonly adminCms = inject(AdminCmsService);
  private readonly toast = inject(ToastService);

  readonly contatos = signal<MensagemContatoAdmin[]>([]);
  readonly isLoading = signal(true);
  readonly selectedFilter = signal('Todos');

  readonly filteredContatos = computed(() => {
    const list = this.contatos();
    const filter = this.selectedFilter();

    if (filter === 'Não Lidos') return list.filter((m) => !m.lido);
    if (filter === 'Lidos') return list.filter((m) => m.lido && !m.respondido);
    if (filter === 'Respondidos') return list.filter((m) => m.respondido);
    return list;
  });

  async ngOnInit(): Promise<void> {
    await this.carregar();
  }

  async carregar(): Promise<void> {
    this.isLoading.set(true);
    try {
      const data = await this.adminCms.getMensagensContato();
      this.contatos.set(data);
    } catch {
      this.toast.error('Erro ao carregar mensagens de contato.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async marcarLido(item: MensagemContatoAdmin, lido: boolean): Promise<void> {
    if (!item.id) return;
    try {
      await this.adminCms.updateMensagemContatoStatus(item.id, { lido });
      this.contatos.update((list) =>
        list.map((m) => (m.id === item.id ? { ...m, lido } : m)),
      );
      this.toast.success(
        lido ? 'Mensagem marcada como lida.' : 'Mensagem marcada como não lida.',
      );
    } catch {
      this.toast.error('Erro ao atualizar status da mensagem.');
    }
  }

  async marcarRespondido(item: MensagemContatoAdmin, respondido: boolean): Promise<void> {
    if (!item.id) return;
    try {
      await this.adminCms.updateMensagemContatoStatus(item.id, {
        respondido,
        lido: respondido ? true : item.lido,
      });
      this.contatos.update((list) =>
        list.map((m) =>
          m.id === item.id
            ? { ...m, respondido, lido: respondido ? true : m.lido }
            : m,
        ),
      );
      this.toast.success(
        respondido
          ? 'Mensagem marcada como respondida.'
          : 'Status de resposta removido.',
      );
    } catch {
      this.toast.error('Erro ao atualizar status da mensagem.');
    }
  }

  async excluir(id: string): Promise<void> {
    if (!confirm('Deseja realmente excluir esta mensagem permanentemente?')) return;
    try {
      await this.adminCms.deleteMensagemContato(id);
      this.contatos.update((list) => list.filter((m) => m.id !== id));
      this.toast.success('Mensagem excluída com sucesso.');
    } catch {
      this.toast.error('Erro ao excluir mensagem.');
    }
  }

  getWhatsAppUrl(telefone: string, nome: string): string {
    const digits = telefone.replace(/\D/g, '');
    const phone = digits.startsWith('55') ? digits : `55${digits}`;
    const text = `Olá, ${nome}! Entramos em contato a respeito da sua mensagem enviada no site da IASD Mangueiras.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }

  encodeUri(text: string): string {
    return encodeURIComponent(text);
  }
}
