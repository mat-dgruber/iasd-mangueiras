import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SeoService } from '../../core/seo/seo.service';
import { ContentService } from '../../core/services/content.service';
import { SITE_CONFIG } from '../../core/site/site.config';
import { PequenoGrupo } from '../../core/models/content.models';


interface DailyVerse {
  texto: string;
  referencia: string;
  tema: string;
}

@Component({
  selector: 'app-estudos-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="conteudo" class="py-10 md:py-14">
      <div class="mx-auto max-w-site px-4">
        <!-- Breadcrumb -->
        <nav class="mb-4 text-sm text-advent-muted" aria-label="Navegação estrutural">
          <a class="hover:text-advent-blue hover:underline" href="/">Início</a>
          <span class="mx-2">/</span>
          <span class="font-medium text-advent-text" aria-current="page">Estudos Bíblicos & PGs</span>
        </nav>

        <header class="max-w-3xl">
          <span class="inline-block rounded bg-advent-neutral px-3 py-1 text-xs font-bold uppercase tracking-wider text-advent-blue">
            Crescimento Espiritual & Comunhão
          </span>
          <h1 class="mt-3 text-4xl font-bold tracking-tight text-advent-text md:text-5xl">
            Estudos Bíblicos & Pequenos Grupos
          </h1>
          <p class="mt-4 text-lg text-advent-muted leading-relaxed">
            Fortaleça sua fé através do estudo diário da Bíblia, participe de um Pequeno Grupo próximo a você em Tatuí e compartilhe mensagens de esperança.
          </p>
        </header>

        <!-- Alternador de Abas Principais -->
        <div class="mt-10 flex flex-wrap border-b border-advent-border gap-2" role="tablist">
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="activeTab() === 'pgs'"
            class="pb-3.5 px-4 text-sm font-bold transition-colors relative cursor-pointer"
            [class.text-advent-blue]="activeTab() === 'pgs'"
            [class.text-advent-muted]="activeTab() !== 'pgs'"
            (click)="setTab('pgs')"
          >
            🏠 Pequenos Grupos (PGs)
            @if (activeTab() === 'pgs') {
              <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-advent-blue"></span>
            }
          </button>
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="activeTab() === 'licao'"
            class="pb-3.5 px-4 text-sm font-bold transition-colors relative cursor-pointer"
            [class.text-advent-blue]="activeTab() === 'licao'"
            [class.text-advent-muted]="activeTab() !== 'licao'"
            (click)="setTab('licao')"
          >
            📖 Lição da Escola Sabatina & Vídeos
            @if (activeTab() === 'licao') {
              <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-advent-blue"></span>
            }
          </button>
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="activeTab() === 'versiculo'"
            class="pb-3.5 px-4 text-sm font-bold transition-colors relative cursor-pointer"
            [class.text-advent-blue]="activeTab() === 'versiculo'"
            [class.text-advent-muted]="activeTab() !== 'versiculo'"
            (click)="setTab('versiculo')"
          >
            ✨ Versículo do Dia & Stories
            @if (activeTab() === 'versiculo') {
              <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-advent-blue"></span>
            }
          </button>
        </div>

        <!-- ============================================================ -->
        <!-- ABA 1: PEQUENOS GRUPOS (PGs) -->
        <!-- ============================================================ -->
        @if (activeTab() === 'pgs') {
          <section class="mt-8 animate-fadeIn" aria-label="Lista de Pequenos Grupos">
            <div class="rounded-2xl border border-advent-border bg-white p-6 shadow-sm">
              <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 class="text-xl font-bold text-advent-text">Encontre um Pequeno Grupo em Tatuí</h2>
                  <p class="text-xs text-advent-muted mt-0.5">
                    Reuniões semanais nos lares para oração, estudo bíblico prático e amizade cristã.
                  </p>
                </div>

                <!-- Filtro por Bairro -->
                <div class="flex items-center gap-2">
                  <label for="bairro-filter" class="text-xs font-semibold text-advent-muted">Bairro:</label>
                  <select
                    id="bairro-filter"
                    [value]="selectedBairro()"
                    (change)="onBairroChange($event)"
                    class="rounded-card border border-advent-border bg-white px-3 py-1.5 text-xs font-medium text-advent-text focus:border-advent-blue focus:outline-none"
                  >
                    <option value="Todos">Todos os Bairros</option>
                    @for (b of availableBairros(); track b) {
                      <option [value]="b">{{ b }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Filtros de Perfil / Público -->
              <div class="mt-6 flex flex-wrap gap-2 pt-4 border-t border-advent-border">
                <span class="text-xs font-semibold text-advent-muted self-center mr-1">Perfil:</span>
                @for (perfil of perfis; track perfil) {
                  <button
                    type="button"
                    (click)="selectedPerfil.set(perfil)"
                    class="rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer"
                    [class.bg-advent-blue]="selectedPerfil() === perfil"
                    [class.text-white]="selectedPerfil() === perfil"
                    [class.shadow-xs]="selectedPerfil() === perfil"
                    [class.bg-slate-100]="selectedPerfil() !== perfil"
                    [class.text-advent-text]="selectedPerfil() !== perfil"
                    [class.hover:bg-slate-200]="selectedPerfil() !== perfil"
                  >
                    {{ perfil }}
                  </button>
                }
              </div>
            </div>

            <!-- Cards dos PGs -->
            <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              @for (pg of filteredPgs(); track (pg.id || pg.nome)) {
                <article class="flex flex-col justify-between rounded-2xl border border-advent-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-advent-blue hover:shadow-md">
                  <div>
                    <div class="flex items-center justify-between gap-2">
                      <span class="rounded-full bg-advent-blue/10 px-2.5 py-0.5 text-xs font-bold text-advent-blue">
                        {{ pg.perfil }}
                      </span>
                      <span class="text-xs font-semibold text-advent-muted">
                        📍 {{ pg.bairro }}
                      </span>
                    </div>

                    <h3 class="mt-4 text-xl font-bold text-advent-text">{{ pg.nome }}</h3>
                    <p class="mt-1 text-xs font-semibold text-advent-blue">
                      ⏰ {{ pg.dia }} às {{ pg.horario }}
                    </p>

                    <p class="mt-3 text-xs text-advent-muted leading-relaxed">
                      {{ pg.descricao }}
                    </p>

                    <div class="mt-4 pt-3 border-t border-slate-100 text-xs text-advent-text">
                      <p><strong>Líderes:</strong> {{ pg.lider }}</p>
                      @if (pg.anfitriao) {
                        <p class="text-advent-muted mt-0.5"><strong>Anfitrião:</strong> {{ pg.anfitriao }}</p>
                      }
                    </div>
                  </div>

                  <div class="mt-6 pt-4 border-t border-advent-border">
                    <a
                      [href]="getWhatsAppLink(pg)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex w-full items-center justify-center gap-2 rounded-card bg-green-700 px-4 py-2.5 text-xs font-semibold text-white shadow transition-all hover:bg-green-800 active:scale-[0.98] active:shadow-inner"
                    >
                      <span>💬</span> Falar com o Líder no WhatsApp
                    </a>
                  </div>
                </article>
              } @empty {
                <div class="col-span-full rounded-2xl border border-dashed border-advent-border bg-white p-12 text-center text-advent-muted">
                  Nenhum Pequeno Grupo encontrado com os filtros selecionados. Tente selecionar outro perfil ou bairro.
                </div>
              }
            </div>
          </section>
        }

        <!-- ============================================================ -->
        <!-- ABA 2: LIÇÃO DA ESCOLA SABATINA & VÍDEOS -->
        <!-- ============================================================ -->
        @if (activeTab() === 'licao') {
          <section class="mt-8 space-y-12 animate-fadeIn" aria-label="Lição da Escola Sabatina">
            <!-- Portais Oficiais da CPB -->
            <div>
              <div class="max-w-2xl">
                <span class="text-xs font-bold uppercase tracking-wider text-advent-blue">Guia de Estudo Diário</span>
                <h2 class="mt-1 text-2xl font-bold text-advent-text">Lição da Escola Sabatina Online</h2>
                <p class="mt-1 text-sm text-advent-muted">
                  Acesse gratuitamente o conteúdo oficial diário das Lições da Bíblia publicado pela Casa Publicadora Brasileira (CPB).
                </p>
              </div>

              <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <!-- Adultos -->
                <a
                  href="https://licoesbiblicas.cpb.com.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="rounded-2xl border border-advent-border bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-advent-blue hover:shadow-md block"
                >
                  <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-advent-blue font-bold">
                    📖
                  </div>
                  <h3 class="mt-3 text-base font-bold text-advent-text">Lição dos Adultos</h3>
                  <p class="mt-1 text-xs text-advent-muted leading-relaxed">
                    Guia temático semanal para reflexão e estudo diário com versículos comentados.
                  </p>
                  <span class="mt-4 inline-block text-xs font-semibold text-advent-blue">Ler na CPB ↗</span>
                </a>

                <!-- Jovens -->
                <a
                  href="https://licoesbiblicas.cpb.com.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="rounded-2xl border border-advent-border bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-advent-blue hover:shadow-md block"
                >
                  <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 font-bold">
                    ⚡
                  </div>
                  <h3 class="mt-3 text-base font-bold text-advent-text">Lição dos Jovens</h3>
                  <p class="mt-1 text-xs text-advent-muted leading-relaxed">
                    Textos práticos e contemporâneos focados na juventude, fé e desafios do cotidiano.
                  </p>
                  <span class="mt-4 inline-block text-xs font-semibold text-advent-blue">Ler na CPB ↗</span>
                </a>

                <!-- Universitários -->
                <a
                  href="https://licoesbiblicas.cpb.com.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="rounded-2xl border border-advent-border bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-advent-blue hover:shadow-md block"
                >
                  <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
                    🎓
                  </div>
                  <h3 class="mt-3 text-base font-bold text-advent-text">Universitários</h3>
                  <p class="mt-1 text-xs text-advent-muted leading-relaxed">
                    Diálogos de fé e razão para estudantes acadêmicos e jovens profissionais.
                  </p>
                  <span class="mt-4 inline-block text-xs font-semibold text-advent-blue">Ler na CPB ↗</span>
                </a>

                <!-- Crianças -->
                <a
                  href="https://licoesbiblicas.cpb.com.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="rounded-2xl border border-advent-border bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-advent-blue hover:shadow-md block"
                >
                  <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 font-bold">
                    🎨
                  </div>
                  <h3 class="mt-3 text-base font-bold text-advent-text">Crianças & Teens</h3>
                  <p class="mt-1 text-xs text-advent-muted leading-relaxed">
                    Histórias ilustradas e atividades para Rol do Berço, Jardim, Primários e Juvenis.
                  </p>
                  <span class="mt-4 inline-block text-xs font-semibold text-advent-blue">Ler na CPB ↗</span>
                </a>
              </div>
            </div>

            <!-- Vídeos e Comentários da Semana -->
            <div class="border-t border-advent-border pt-10">
              <div class="max-w-2xl">
                <span class="text-xs font-bold uppercase tracking-wider text-advent-blue">Vídeos & Comentários</span>
                <h2 class="mt-1 text-2xl font-bold text-advent-text">Comentários da Lição em Vídeo</h2>
                <p class="mt-1 text-sm text-advent-muted">
                  Aprofunde o estudo da semana com vídeos comentados produzidos por professores e membros da nossa congregação.
                </p>
              </div>

              <div class="mt-6 grid gap-6 md:grid-cols-2">
                @for (vid of licaoVideos; track vid.id) {
                  <article class="overflow-hidden rounded-2xl border border-advent-border bg-white shadow-sm transition-all hover:shadow-md">
                    <div class="relative aspect-video bg-slate-900">
                      <iframe
                        [src]="getEmbedUrl(vid.id)"
                        class="h-full w-full border-0"
                        title="{{ vid.titulo }}"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                      ></iframe>
                    </div>
                    <div class="p-5">
                      <span class="rounded bg-advent-blue/10 px-2 py-0.5 text-[10px] font-bold uppercase text-advent-blue">
                        {{ vid.canal }}
                      </span>
                      <h3 class="mt-2 text-base font-bold text-advent-text">{{ vid.titulo }}</h3>
                      <p class="mt-1 text-xs text-advent-muted">Apresentado por: {{ vid.autor }}</p>
                    </div>
                  </article>
                }
              </div>
            </div>
          </section>
        }

        <!-- ============================================================ -->
        <!-- ABA 3: VERSÍCULO DO DIA & GERADOR DE STORIES -->
        <!-- ============================================================ -->
        @if (activeTab() === 'versiculo') {
          <section class="mt-8 animate-fadeIn" aria-label="Versículo do Dia">
            <div class="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <!-- Painel de Controle e Texto -->
              <div class="space-y-6">
                <div>
                  <span class="text-xs font-bold uppercase tracking-wider text-advent-blue">Inspiração Diária</span>
                  <h2 class="mt-1 text-2xl font-bold text-advent-text">Versículo para o seu Dia</h2>
                  <p class="mt-1 text-sm text-advent-muted">
                    Medite nesta promessa bíblica e compartilhe esperança com seus amigos nas redes sociais.
                  </p>
                </div>

                <!-- Card de Seleção de Versículo -->
                <div class="rounded-2xl border border-advent-border bg-white p-6 shadow-sm">
                  <div class="flex items-center justify-between gap-2 pb-3 border-b border-advent-border">
                    <span class="rounded-full bg-advent-blue/10 px-3 py-1 text-xs font-bold text-advent-blue">
                      Tema: {{ currentVerse().tema }}
                    </span>
                    <button
                      type="button"
                      (click)="nextVerse()"
                      class="text-xs font-semibold text-advent-blue hover:underline cursor-pointer"
                    >
                      Outro Versículo ↻
                    </button>
                  </div>

                  <blockquote class="mt-4 text-base md:text-lg font-medium text-advent-text leading-relaxed italic">
                    “{{ currentVerse().texto }}”
                  </blockquote>
                  <p class="mt-3 text-sm font-bold text-advent-blue text-right">
                    — {{ currentVerse().referencia }}
                  </p>

                  <div class="mt-6 flex flex-wrap gap-3 pt-4 border-t border-advent-border">
                    <button
                      type="button"
                      (click)="copyVerseText()"
                      class="rounded-card border border-advent-border px-4 py-2.5 text-xs font-semibold text-advent-text hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      📋 {{ copyFeedback() || 'Copiar Texto' }}
                    </button>

                    <a
                      [href]="getWhatsAppShareLink()"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1.5 rounded-card bg-green-700 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-green-800 transition-colors"
                    >
                      <span>💬</span> Compartilhar no WhatsApp
                    </a>
                  </div>
                </div>

                <!-- Botão de Download do Story -->
                <div class="rounded-2xl border border-blue-100 bg-blue-50/60 p-6">
                  <h3 class="text-sm font-bold text-advent-blue">📱 Postar no Instagram Stories / WhatsApp Status</h3>
                  <p class="mt-1 text-xs text-advent-muted leading-relaxed">
                    Clique no botão abaixo para gerar instantaneamente a imagem vertical (1080x1920) com o design oficial da igreja pronta para publicação.
                  </p>

                  <button
                    type="button"
                    (click)="generateAndDownloadStory()"
                    class="mt-4 inline-flex items-center gap-2 rounded-card bg-advent-blue px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow transition-all hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner cursor-pointer"
                  >
                    <span>📥</span> Baixar Imagem para Stories (.PNG)
                  </button>
                </div>
              </div>

              <!-- Preview Visual do Story -->
              <div class="flex flex-col items-center">
                <span class="text-xs font-bold uppercase tracking-wider text-advent-muted mb-2">
                  Pré-visualização do Story (9:16)
                </span>
                
                <!-- Mockup de Tela de Celular com Canvas Oculto -->
                <div class="relative w-full max-w-[280px] aspect-[9/16] rounded-3xl overflow-hidden border-4 border-slate-800 bg-gradient-to-br from-[#062c4a] via-advent-blue to-[#0b3b60] p-6 text-white shadow-2xl flex flex-col justify-between">
                  <div class="text-center">
                    <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-advent-gold">
                      IASD Mangueiras • Tatuí
                    </span>
                  </div>

                  <div class="text-center my-auto">
                    <p class="text-sm font-medium leading-relaxed italic">
                      “{{ currentVerse().texto }}”
                    </p>
                    <p class="mt-3 text-xs font-bold text-advent-gold">
                      {{ currentVerse().referencia }}
                    </p>
                  </div>

                  <div class="text-center text-[9px] text-white/70">
                    iasdmangueiras.org.br
                  </div>
                </div>

                <!-- Canvas Oculto para Renderização em Alta Resolução -->
                <canvas #storyCanvas class="hidden" width="1080" height="1920"></canvas>
              </div>
            </div>
          </section>
        }
      </div>
    </main>
  `,
})
export class EstudosPage {
  private readonly seo = inject(SeoService);
  private readonly contentService = inject(ContentService);
  private readonly sanitizer = inject(DomSanitizer);

  @ViewChild('storyCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;


  readonly activeTab = signal<'pgs' | 'licao' | 'versiculo'>('pgs');
  readonly selectedPerfil = signal<string>('Todos');
  readonly selectedBairro = signal<string>('Todos');
  readonly copyFeedback = signal<string | null>(null);

  readonly perfis = [
    'Todos',
    'Jovens (JA)',
    'Famílias',
    'Casais',
    'Universitários',
    'Melhor Idade',
  ] as const;

  protected readonly pgs = () => this.contentService.pgs();

  readonly availableBairros = computed(() => {
    const list = this.pgs();
    return Array.from(new Set(list.map((p) => p.bairro))).sort();
  });

  readonly filteredPgs = computed(() => {
    const list = this.pgs();
    const perfil = this.selectedPerfil();
    const bairro = this.selectedBairro();

    return list.filter((p) => {
      const matchPerfil = perfil === 'Todos' || p.perfil === perfil;
      const matchBairro = bairro === 'Todos' || p.bairro === bairro;
      return matchPerfil && matchBairro;
    });
  });

  readonly verses: DailyVerse[] = [
    {
      texto:
        'O Senhor é o meu pastor; nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.',
      referencia: 'Salmos 23:1-2',
      tema: 'Confiança & Paz',
    },
    {
      texto:
        'Porque sou eu que conheço os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.',
      referencia: 'Jeremias 29:11',
      tema: 'Esperança & Futuro',
    },
    {
      texto:
        'Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus.',
      referencia: 'Filipenses 4:6',
      tema: 'Oração & Serenidade',
    },
    {
      texto:
        'Venham a mim, todos os que estão cansados e sobrecarregados, e eu darei descanso a vocês.',
      referencia: 'Mateus 11:28',
      tema: 'Descanso em Jesus',
    },
  ];

  readonly verseIndex = signal<number>(0);
  readonly currentVerse = computed(() => this.verses[this.verseIndex()]);

  readonly licaoVideos = [
    {
      id: 'Lp7C2-79Z-M',
      titulo: 'Comentário da Lição da Escola Sabatina — Visão Geral',
      canal: 'IASD Mangueiras',
      autor: 'Equipe de Professores da Escola Sabatina',
    },
    {
      id: 'k6_wG959d28',
      titulo: 'Lição dos Jovens & Universitários — Temas Bíblicos',
      canal: 'Ministério Jovem Mangueiras',
      autor: 'Liderança JA Tatuí',
    },
  ];

  constructor() {
    this.seo.apply({
      title: 'Estudos Bíblicos, Pequenos Grupos & Lição — IASD Mangueiras',
      description:
        'Encontre um Pequeno Grupo próximo a você em Tatuí, estude a Lição da Escola Sabatina e compartilhe versículos inspiradores com a IASD Mangueiras.',
      path: '/estudos',
    });
  }

  setTab(tab: 'pgs' | 'licao' | 'versiculo'): void {
    this.activeTab.set(tab);
  }

  onBairroChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedBairro.set(val);
  }

  getWhatsAppLink(pg: PequenoGrupo): string {
    const cleanPhone = pg.telefone.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Olá ${pg.lider}! Vi o Pequeno Grupo "${pg.nome}" no site da IASD Mangueiras e gostaria de participar dos encontros!`,
    );
    return `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${msg}`;
  }

  getEmbedUrl(id: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${id}`,
    );
  }


  nextVerse(): void {
    this.verseIndex.update((i) => (i + 1) % this.verses.length);
  }

  copyVerseText(): void {
    const v = this.currentVerse();
    const text = `“${v.texto}” — ${v.referencia}\n\nIASD Mangueiras • Tatuí: https://iasdmangueiras.org.br`;
    navigator.clipboard?.writeText(text);
    this.copyFeedback.set('Copiado com sucesso!');
    setTimeout(() => this.copyFeedback.set(null), 3000);
  }

  getWhatsAppShareLink(): string {
    const v = this.currentVerse();
    const text = encodeURIComponent(
      `*Versículo do Dia:*\n“${v.texto}”\n— _${v.referencia}_\n\nIgreja Adventista do Sétimo Dia das Mangueiras (Tatuí-SP)\nhttps://iasdmangueiras.org.br`,
    );
    return `https://api.whatsapp.com/send?text=${text}`;
  }

  generateAndDownloadStory(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1920;

    // 1. Fundo com Gradiente Nobre
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#062c4a');
    gradient.addColorStop(0.5, '#0c4a6e');
    gradient.addColorStop(1, '#072e4c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Detalhes Decorativos
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, width - 120, height - 120);

    // 3. Cabeçalho
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '4px';
    ctx.fillText('IASD MANGUEIRAS • TATUÍ', width / 2, 220);

    ctx.fillStyle = '#ffffff';
    ctx.font = '28px sans-serif';
    ctx.fillText('VERSÍCULO DO DIA', width / 2, 280);

    // 4. Texto do Versículo com quebra de linha
    const verse = this.currentVerse();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 52px serif';
    this.wrapText(ctx, `“${verse.texto}”`, width / 2, height / 2 - 100, 860, 80);

    // 5. Referência Bíblica
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText(`— ${verse.referencia}`, width / 2, height / 2 + 300);

    // 6. Rodapé Institucional
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '30px sans-serif';
    ctx.fillText('iasdmangueiras.org.br', width / 2, height - 160);

    // Download do arquivo PNG
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `versiculo-${verse.referencia.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = dataUrl;
    link.click();
  }

  private wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
  ): void {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }
}
