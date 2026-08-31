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
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';

@Component({
  selector: 'app-admin-contatos-page',
  standalone: true,
  imports: [ConfirmDialogComponent, SkeletonComponent],
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
          <div class="grid gap-4" aria-busy="true" aria-label="Carregando mensagens de contato">
            @for (i of [1, 2, 3]; track i) {
              <div class="rounded-2xl border border-advent-border bg-white p-5 shadow-xs space-y-3">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <app-ui-skeleton width="130px" height="1.25rem" rounded="sm" />
                    <app-ui-skeleton width="80px" height="1.25rem" rounded="full" />
                  </div>
                  <app-ui-skeleton width="180px" height="1rem" rounded="sm" />
                </div>
                <app-ui-skeleton width="200px" height="1rem" rounded="sm" />
                <app-ui-skeleton width="100%" height="3rem" rounded="md" />
                <div class="flex items-center justify-between pt-2">
                  <div class="flex gap-2">
                    <app-ui-skeleton width="120px" height="2rem" rounded="md" />
                    <app-ui-skeleton width="140px" height="2rem" rounded="md" />
                  </div>
                  <div class="flex gap-2">
                    <app-ui-skeleton width="80px" height="2rem" rounded="md" />
                    <app-ui-skeleton width="60px" height="2rem" rounded="md" />
                  </div>
                </div>
              </div>
            }
          </div>
        } @else if (filteredContatos().length === 0) {
          <div
            class="rounded-2xl border border-dashed border-advent-border bg-white p-12 text-center text-advent-muted"
          >
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-advent-muted mb-3">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-advent-text">Nenhuma mensagem encontrada</p>
            <p class="text-xs text-advent-muted mt-1">
              @if (selectedFilter() !== 'Todos') {
                Nenhuma mensagem corresponde ao filtro "{{ selectedFilter() }}".
              } @else {
                Nenhuma mensagem de contato foi recebida até o momento.
              }
            </p>
            @if (selectedFilter() !== 'Todos') {
              <button
                type="button"
                (click)="selectedFilter.set('Todos')"
                class="mt-4 inline-flex items-center gap-1.5 rounded-card border border-advent-border bg-slate-50 px-4 py-2 text-xs font-semibold text-advent-text hover:bg-slate-100 transition-colors cursor-pointer min-h-[38px]"
              >
                Ver todas as mensagens
              </button>
            }
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
                        class="inline-flex items-center gap-1 rounded-full bg-green-100 border border-green-200 px-2.5 py-0.5 text-[10px] font-bold uppercase text-green-800"
                      >
                        <svg class="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Respondido
                      </span>
                    } @else if (item.lido) {
                      <span
                        class="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-700"
                      >
                        Lido
                      </span>
                    } @else {
                      <span
                        class="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-800"
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
                  <p class="text-sm text-advent-text leading-relaxed whitespace-pre-line bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
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
                        class="rounded-lg border border-advent-border bg-slate-50 px-3 py-1.5 font-medium text-advent-text hover:bg-slate-100 cursor-pointer min-h-[36px]"
                      >
                        Marcar como lido
                      </button>
                    } @else {
                      <button
                        type="button"
                        (click)="marcarLido(item, false)"
                        class="rounded-lg border border-advent-border bg-slate-50 px-3 py-1.5 font-medium text-advent-muted hover:bg-slate-100 cursor-pointer min-h-[36px]"
                      >
                        Marcar como não lido
                      </button>
                    }

                    @if (!item.respondido) {
                      <button
                        type="button"
                        (click)="marcarRespondido(item, true)"
                        class="rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 font-medium text-green-700 hover:bg-green-100 cursor-pointer min-h-[36px] inline-flex items-center gap-1"
                      >
                        <svg class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Marcar como respondido
                      </button>
                    } @else {
                      <button
                        type="button"
                        (click)="marcarRespondido(item, false)"
                        class="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 cursor-pointer min-h-[36px]"
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
                        class="rounded-lg bg-green-700 px-3.5 py-1.5 font-semibold text-white hover:bg-green-800 cursor-pointer inline-flex items-center gap-1.5 min-h-[36px] transition-colors"
                        [attr.aria-label]="'Conversar no WhatsApp com ' + item.nome"
                      >
                        <svg class="h-3.5 w-3.5 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                        WhatsApp
                      </a>
                    }

                    <a
                      [href]="'mailto:' + item.email + '?subject=' + encodeUri('Resposta IASD Mangueiras')"
                      class="rounded-lg border border-advent-blue bg-blue-50/60 px-3.5 py-1.5 font-semibold text-advent-blue hover:bg-advent-blue hover:text-white cursor-pointer inline-flex items-center gap-1.5 min-h-[36px] transition-colors"
                      [attr.aria-label]="'Enviar e-mail para ' + item.nome"
                    >
                      <svg class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      E-mail
                    </a>

                    <button
                      type="button"
                      (click)="openDeleteDialog(item)"
                      class="rounded-lg px-3 py-1.5 font-medium text-red-600 hover:bg-red-50 cursor-pointer min-h-[36px] flex items-center"
                      [attr.aria-label]="'Excluir mensagem de ' + item.nome"
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

      <!-- Diálogo de Confirmação de Exclusão -->
      <app-ui-confirm-dialog
        [isOpen]="isDeleteDialogOpen()"
        [title]="'Excluir Mensagem de Contato'"
        [message]="'Tem certeza que deseja excluir a mensagem de ' + (contatoToDelete()?.nome || '') + '? Esta ação não poderá ser desfeita.'"
        [confirmText]="'Excluir'"
        [cancelText]="'Cancelar'"
        [variant]="'danger'"
        [isLoading]="isDeleting()"
        (confirmed)="confirmDelete()"
        (cancelled)="cancelDelete()"
      />
    </div>
  `,
})
export class AdminContatosPage implements OnInit {
  private readonly adminCms = inject(AdminCmsService);
  private readonly toast = inject(ToastService);

  readonly contatos = signal<MensagemContatoAdmin[]>([]);
  readonly isLoading = signal(true);
  readonly selectedFilter = signal('Todos');
  readonly isDeleteDialogOpen = signal(false);
  readonly contatoToDelete = signal<MensagemContatoAdmin | null>(null);
  readonly isDeleting = signal(false);

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

  openDeleteDialog(item: MensagemContatoAdmin): void {
    this.contatoToDelete.set(item);
    this.isDeleteDialogOpen.set(true);
  }

  cancelDelete(): void {
    this.isDeleteDialogOpen.set(false);
    this.contatoToDelete.set(null);
  }

  // ponytail: backward compatible alias
  excluir(id: string): void {
    const item = this.contatos().find((c) => c.id === id);
    if (item) {
      this.openDeleteDialog(item);
    }
  }

  async confirmDelete(): Promise<void> {
    const item = this.contatoToDelete();
    if (!item) return;

    this.isDeleting.set(true);
    try {
      if (item.id) {
        await this.adminCms.deleteMensagemContato(item.id);
      }
      this.contatos.update((list) => list.filter((m) => m.id !== item.id && m !== item));
      this.toast.success('Mensagem excluída com sucesso.');
    } catch {
      this.toast.error('Erro ao excluir mensagem.');
    } finally {
      this.isDeleting.set(false);
      this.cancelDelete();
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
