import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-estudos-licao-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mt-8 space-y-12 animate-fadeIn" aria-label="Lição da Escola Sabatina">
      <!-- Destaque: Plataforma Open-Source Sabbath School (Adventech) -->
      <div
        class="overflow-hidden rounded-3xl border border-blue-200 bg-linear-to-br from-advent-blue/5 via-white to-blue-50/20 p-6 md:p-8 shadow-xs"
      >
        <div class="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div class="space-y-3 max-w-2xl">
            <div class="flex items-center gap-2">
              <span
                class="rounded-full bg-advent-blue px-3 py-1 text-xs font-extrabold uppercase text-white shadow-xs"
              >
                🔥 Open-Source & Leitor Web
              </span>
              <span
                class="rounded-full bg-white border border-blue-200 px-2.5 py-0.5 text-xs font-semibold text-advent-blue"
              >
                Sabbath School (Adventech)
              </span>
            </div>

            <h2 class="text-2xl md:text-3xl font-extrabold text-advent-text leading-tight">
              Estudo Diário da Lição no Navegador
            </h2>

            <p class="text-sm text-advent-muted leading-relaxed">
              Acesse o leitor interativo aberto da Escola Sabatina com textos bíblicos embutidos,
              versículos de memória, comentários e suporte offline em múltiplos idiomas.
            </p>

            <div class="pt-2 flex flex-wrap gap-3">
              <a
                href="https://sabbath-school.adventech.io/pt"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-xl bg-advent-blue px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-advent-blue-dark active:scale-[0.98] transition-all"
              >
                Abrir Leitor Interativo Adventech ↗
              </a>
              <a
                href="https://www.adventistas.org/pt/escolasabatina/"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-xl border border-advent-border bg-white px-5 py-2.5 text-xs font-bold text-advent-text hover:bg-gray-50 transition-all shadow-xs"
              >
                Portal Oficial Adventistas ↗
              </a>
            </div>
          </div>

          <div
            class="w-full lg:w-80 shrink-0 bg-white p-5 rounded-2xl border border-advent-border shadow-sm space-y-2"
          >
            <span class="text-xs font-bold uppercase tracking-wider text-advent-blue block"
              >Recursos Inclusos:</span
            >
            <ul class="space-y-1.5 text-xs text-advent-text">
              <li class="flex items-center gap-2">
                ✓ <strong>Leitura Diária:</strong> Domingo a Sábado
              </li>
              <li class="flex items-center gap-2">
                ✓ <strong>Textos Bíblicos:</strong> Clique e leia o verso
              </li>
              <li class="flex items-center gap-2">
                ✓ <strong>Guia do Professor:</strong> Esboços didáticos
              </li>
              <li class="flex items-center gap-2">
                ✓ <strong>Multilíngue:</strong> PT, EN, ES, FR
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Canais Parceiros em Destaque (Lamed, Presente 7, TV Novo Tempo e CPB) -->
      <div>
        <div class="max-w-2xl mb-6">
          <span class="text-xs font-bold uppercase tracking-wider text-advent-blue"
            >Canais Recomendados</span
          >
          <h2 class="mt-1 text-2xl font-bold text-advent-text">
            Aprofunde seu Estudo com Especialistas
          </h2>
          <p class="mt-1 text-sm text-advent-muted">
            Canais dedicados à transmissão e estudo aprofundado da Lição da Escola Sabatina.
          </p>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full min-w-0">
          <!-- 1. Canal Lamed (Laranja) -->
          <div
            class="group relative overflow-hidden flex flex-col justify-between rounded-3xl border border-orange-200/90 bg-gradient-to-b from-orange-50/90 via-orange-50/30 to-white p-6 md:p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-orange-400"
          >
            <div
              class="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-orange-400/15 blur-2xl pointer-events-none"
            ></div>

            <div class="relative z-10">
              <div class="flex items-center justify-between gap-2 mb-4">
                <span
                  class="inline-flex items-center rounded-full bg-orange-100/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-orange-900 border border-orange-200/80"
                >
                  Juventude & Reflexão
                </span>
                <span
                  class="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-700"
                >
                  <span class="h-2 w-2 rounded-full bg-orange-500"></span>
                  YouTube
                </span>
              </div>

              <div class="flex items-center gap-3.5">
                <div
                  class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white border-2 border-orange-200 shadow-md shadow-orange-500/10 p-1 transition-transform duration-300 group-hover:scale-105 overflow-hidden"
                >
                  <img
                    src="/logos/lamed-logo.png"
                    alt="Logo Canal Lamed"
                    class="h-full w-full object-contain scale-120 drop-shadow-xs"
                    loading="lazy"
                    width="64"
                    height="64"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <h3
                    class="text-xl font-black text-advent-text tracking-tight truncate leading-tight"
                  >
                    Canal Lamed
                  </h3>
                  <p
                    class="mt-0.5 text-xs font-bold text-orange-700 flex items-center gap-0.5"
                  >
                    <span class="opacity-75">@</span>Lamed148
                  </p>
                </div>
              </div>

              <p class="mt-3.5 text-xs text-advent-muted leading-relaxed min-h-[58px]">
                Estudos semanais das Sagradas Escrituras voltados para adolescentes e jovens,
                articulando princípios bíblicos atemporais com reflexões contemporâneas e práticas
                para o cotidiano.
              </p>

              <div class="mt-4 flex flex-wrap gap-1.5">
                <span
                  class="rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-800 border border-orange-200/70"
                >
                  Jovens & Adolescentes
                </span>
                <span
                  class="rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-800 border border-orange-200/70"
                >
                  Reflexão Contemporânea
                </span>
              </div>
            </div>

            <div class="relative z-10 mt-6 pt-4 border-t border-orange-100/80">
              <a
                href="https://www.youtube.com/@Lamed148"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-orange-700 active:scale-[0.98] transition-all"
                aria-label="Acessar Canal Lamed no YouTube"
              >
                <svg
                  class="h-4 w-4 fill-current shrink-0"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                  />
                </svg>
                Assistir no YouTube ↗
              </a>
            </div>
          </div>

          <!-- 2. Michelson Borges (Emerald) -->
          <div
            class="group relative overflow-hidden flex flex-col justify-between rounded-3xl border border-emerald-200/90 bg-gradient-to-b from-emerald-50/90 via-emerald-50/30 to-white p-6 md:p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-400"
          >
            <div
              class="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/15 blur-2xl pointer-events-none"
            ></div>

            <div class="relative z-10">
              <div class="flex items-center justify-between gap-2 mb-4">
                <span
                  class="inline-flex items-center rounded-full bg-emerald-100/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 border border-emerald-200/80"
                >
                  Comentários & Dicas
                </span>
                <span
                  class="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700"
                >
                  <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Semanal
                </span>
              </div>

              <div class="flex items-center gap-3.5">
                <div
                  class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-700 via-teal-800 to-emerald-950 border-2 border-emerald-500/40 text-white shadow-md shadow-emerald-950/20 p-2 transition-transform duration-300 group-hover:scale-105 overflow-hidden"
                >
                  <span
                    class="font-sans text-2xl font-black tracking-tight text-white drop-shadow-xs"
                    >MB</span
                  >
                </div>
                <div class="min-w-0 flex-1">
                  <h3
                    class="text-xl font-black text-advent-text tracking-tight truncate leading-tight"
                  >
                    Michelson Borges
                  </h3>
                  <p
                    class="mt-0.5 text-xs font-bold text-emerald-700 flex items-center gap-0.5"
                  >
                    <span class="opacity-75">@</span>MichelsonBorges
                  </p>
                </div>
              </div>

              <p class="mt-3.5 text-xs text-advent-muted leading-relaxed min-h-[58px]">
                Comentários dinâmicos da Lição da Escola Sabatina, fidelidade ao texto bíblico e
                orientações pedagógicas para professores e estudantes da Bíblia.
              </p>

              <div class="mt-4 flex flex-wrap gap-1.5">
                <span
                  class="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/70"
                >
                  Professores de ES
                </span>
                <span
                  class="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/70"
                >
                  Didática Bíblica
                </span>
              </div>
            </div>

            <div class="relative z-10 mt-6 pt-4 border-t border-emerald-100/80">
              <a
                href="https://www.youtube.com/@MichelsonBorges"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 active:scale-[0.98] transition-all"
                aria-label="Acessar Canal do Pr. Michelson Borges no YouTube"
              >
                <svg
                  class="h-4 w-4 fill-current shrink-0"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                  />
                </svg>
                Assistir no YouTube ↗
              </a>
            </div>
          </div>

          <!-- 3. Presente 7 (Rose Escuro) -->
          <div
            class="group relative overflow-hidden flex flex-col justify-between rounded-3xl border border-rose-200/90 bg-gradient-to-b from-rose-50/90 via-rose-50/30 to-white p-6 md:p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-rose-400"
          >
            <div
              class="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-rose-400/15 blur-2xl pointer-events-none"
            ></div>

            <div class="relative z-10">
              <div class="flex items-center justify-between gap-2 mb-4">
                <span
                  class="inline-flex items-center rounded-full bg-rose-100/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-rose-900 border border-rose-200/80"
                >
                  IASD Mangueiras
                </span>
                <span
                  class="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-800"
                >
                  <span class="h-2 w-2 rounded-full bg-rose-600"></span>
                  Canal Local
                </span>
              </div>

              <div class="flex items-center gap-3.5">
                <div
                  class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-800 via-rose-900 to-pink-950 border-2 border-rose-600/40 text-white shadow-md shadow-rose-950/25 p-2 transition-transform duration-300 group-hover:scale-105 overflow-hidden"
                >
                  <span
                    class="font-sans text-3xl font-black tracking-tight text-white drop-shadow-sm"
                    >7</span
                  >
                </div>
                <div class="min-w-0 flex-1">
                  <h3
                    class="text-xl font-black text-advent-text tracking-tight truncate leading-tight"
                  >
                    Presente 7
                  </h3>
                  <p class="mt-0.5 text-xs font-bold text-rose-800 flex items-center gap-0.5">
                    <span class="opacity-75">@</span>IASDMangueiras
                  </p>
                </div>
              </div>

              <p class="mt-3.5 text-xs text-advent-muted leading-relaxed min-h-[58px]">
                Série semanal da nossa igreja no YouTube com comentários dos pastores e professores
                da Escola Sabatina das Mangueiras.
              </p>

              <div class="mt-4 flex flex-wrap gap-1.5">
                <span
                  class="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-900 border border-rose-200/70"
                >
                  Projeto Maná
                </span>
                <span
                  class="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-900 border border-rose-200/70"
                >
                  IASD Mangueiras
                </span>
              </div>
            </div>

            <div class="relative z-10 mt-6 pt-4 border-t border-rose-100/80">
              <a
                href="https://youtube.com/playlist?list=PLNgTlCgGyS2GLFNcIWz1_CuCYJOhWOe28"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-800 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-rose-900 active:scale-[0.98] transition-all"
                aria-label="Acessar Playlist da Série Presente 7 no YouTube"
              >
                <svg
                  class="h-4 w-4 fill-current shrink-0"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                  />
                </svg>
                Assistir no YouTube ↗
              </a>
            </div>
          </div>

          <!-- 4. CPB / Lições da Bíblia (Advent Blue) -->
          <div
            class="group relative overflow-hidden flex flex-col justify-between rounded-3xl border border-blue-200/90 bg-gradient-to-b from-blue-50/90 via-blue-50/30 to-white p-6 md:p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-400"
          >
            <div
              class="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-blue-400/15 blur-2xl pointer-events-none"
            ></div>

            <div class="relative z-10">
              <div class="flex items-center justify-between gap-2 mb-4">
                <span
                  class="inline-flex items-center rounded-full bg-blue-100/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-advent-blue border border-blue-200/80"
                >
                  Oficial CPB
                </span>
                <span
                  class="inline-flex items-center gap-1.5 text-[11px] font-bold text-advent-blue"
                >
                  <span class="h-2 w-2 rounded-full bg-advent-blue"></span>
                  Lições
                </span>
              </div>

              <div class="flex items-center gap-3.5">
                <div
                  class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white border-2 border-blue-200 shadow-md shadow-blue-500/10 p-2 transition-transform duration-300 group-hover:scale-105 overflow-hidden"
                >
                  <img
                    src="/logos/licoes-logo.png"
                    alt="Logo Lições da Bíblia CPB"
                    class="h-full w-full object-contain drop-shadow-xs"
                    loading="lazy"
                    width="64"
                    height="64"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <h3
                    class="text-xl font-black text-advent-text tracking-tight truncate leading-tight"
                  >
                    Lições da Bíblia
                  </h3>
                  <p
                    class="mt-0.5 text-xs font-bold text-advent-blue flex items-center gap-0.5"
                  >
                    <span class="opacity-75">@</span>LicoesdaBiblia
                  </p>
                </div>
              </div>

              <p class="mt-3.5 text-xs text-advent-muted leading-relaxed min-h-[58px]">
                Programa oficial da Casa Publicadora Brasileira e TV Novo Tempo com o Pr. Vinícius
                Mendes e teólogos convidados debatendo os temas do trimestre.
              </p>

              <div class="mt-4 flex flex-wrap gap-1.5">
                <span
                  class="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-advent-blue border border-blue-200/70"
                >
                  Pr. Vinícius Mendes
                </span>
                <span
                  class="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-advent-blue border border-blue-200/70"
                >
                  TV Novo Tempo
                </span>
              </div>
            </div>

            <div class="relative z-10 mt-6 pt-4 border-t border-blue-100/80">
              <a
                href="https://www.youtube.com/@LicoesdaBiblia"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full flex items-center justify-center gap-2 rounded-xl bg-advent-blue px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-advent-blue-dark active:scale-[0.98] transition-all"
                aria-label="Acessar Lições da Bíblia no YouTube"
              >
                <svg
                  class="h-4 w-4 fill-current shrink-0"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                  />
                </svg>
                Assistir no YouTube ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Portais das Lições por Faixa Etária e Materiais -->
      <div class="border-t border-advent-border pt-10">
        <div class="max-w-2xl">
          <span class="text-xs font-bold uppercase tracking-wider text-advent-blue"
            >Recursos & Materiais</span
          >
          <h2 class="mt-1 text-2xl font-bold text-advent-text">
            Lições e Materiais por Faixa Etária
          </h2>
          <p class="mt-1 text-sm text-advent-muted">
            Acesse os portais oficiais com materiais didáticos, guias de estudo e recursos
            complementares.
          </p>
        </div>

        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <!-- Adultos -->
          <a
            href="https://sabbath-school.adventech.io/pt"
            target="_blank"
            rel="noopener noreferrer"
            class="group rounded-3xl border border-advent-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-advent-blue hover:shadow-md block"
          >
            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-advent-blue font-bold shadow-xs transition-transform group-hover:scale-110"
            >
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <h3
              class="mt-4 text-lg font-bold text-advent-text group-hover:text-advent-blue transition-colors"
            >
              Lição dos Adultos
            </h3>
            <p class="mt-1 text-xs text-advent-muted leading-relaxed">
              Guia temático semanal no Leitor Adventech com versículos comentados e estudo diário.
            </p>
            <span class="mt-4 inline-flex items-center gap-1 text-xs font-bold text-advent-blue"
              >Ler Online ↗</span
            >
          </a>

          <!-- Jovens -->
          <a
            href="https://www.adventistas.org/pt/jovens/"
            target="_blank"
            rel="noopener noreferrer"
            class="group rounded-3xl border border-advent-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-500 hover:shadow-md block"
          >
            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 font-bold shadow-xs transition-transform group-hover:scale-110"
            >
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                />
              </svg>
            </div>
            <h3
              class="mt-4 text-lg font-bold text-advent-text group-hover:text-amber-600 transition-colors"
            >
              Ministério Jovem
            </h3>
            <p class="mt-1 text-xs text-advent-muted leading-relaxed">
              Textos práticos e temas focados na juventude, fé e desafios do cotidiano.
            </p>
            <span class="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-600"
              >Acessar Portal ↗</span
            >
          </a>

          <!-- Universitários -->
          <a
            href="https://dialogue.adventist.org/pt"
            target="_blank"
            rel="noopener noreferrer"
            class="group rounded-3xl border border-advent-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-600 hover:shadow-md block"
          >
            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 font-bold shadow-xs transition-transform group-hover:scale-110"
            >
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                />
              </svg>
            </div>
            <h3
              class="mt-4 text-lg font-bold text-advent-text group-hover:text-emerald-600 transition-colors"
            >
              Diálogo Universitário
            </h3>
            <p class="mt-1 text-xs text-advent-muted leading-relaxed">
              Revista internacional oficial de fé, ciência e razão para universitários e
              profissionais.
            </p>
            <span class="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-600"
              >Ler Artigos ↗</span
            >
          </a>

          <!-- Crianças -->
          <a
            href="https://www.adventistas.org/pt/criancas/"
            target="_blank"
            rel="noopener noreferrer"
            class="group rounded-3xl border border-advent-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-600 hover:shadow-md block"
          >
            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 font-bold shadow-xs transition-transform group-hover:scale-110"
            >
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                />
              </svg>
            </div>
            <h3
              class="mt-4 text-lg font-bold text-advent-text group-hover:text-purple-600 transition-colors"
            >
              Ministério da Criança
            </h3>
            <p class="mt-1 text-xs text-advent-muted leading-relaxed">
              Histórias ilustradas e materiais para Rol do Berço, Jardim, Primários e Juvenis.
            </p>
            <span class="mt-4 inline-flex items-center gap-1 text-xs font-bold text-purple-600"
              >Acessar Portal ↗</span
            >
          </a>
        </div>

        <!-- Links Complementares de Estudo e Livros -->
        <div class="mt-6 grid gap-4 sm:grid-cols-3">
          <a
            href="https://escolasabatina.net/"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-2xl border border-advent-border bg-slate-50/70 p-4 hover:bg-white hover:border-advent-blue hover:shadow-xs transition-all flex items-center justify-between group"
          >
            <div>
              <strong
                class="text-xs text-advent-text block group-hover:text-advent-blue transition-colors"
                >EscolaSabatina.net</strong
              >
              <span class="text-[11px] text-advent-muted"
                >Slides e Esboços para Professores</span
              >
            </div>
            <span class="text-xs font-bold text-advent-blue">↗</span>
          </a>

          <a
            href="https://mais.cpb.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-2xl border border-advent-border bg-slate-50/70 p-4 hover:bg-white hover:border-advent-blue hover:shadow-xs transition-all flex items-center justify-between group"
          >
            <div>
              <strong
                class="text-xs text-advent-text block group-hover:text-advent-blue transition-colors"
                >CPB Mais</strong
              >
              <span class="text-[11px] text-advent-muted">Livros e Materiais Oficiais</span>
            </div>
            <span class="text-xs font-bold text-advent-blue">↗</span>
          </a>

          <a
            href="https://m.egwwritings.org/pt"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-2xl border border-advent-border bg-slate-50/70 p-4 hover:bg-white hover:border-advent-blue hover:shadow-xs transition-all flex items-center justify-between group"
          >
            <div>
              <strong
                class="text-xs text-advent-text block group-hover:text-advent-blue transition-colors"
                >Ellen G. White Writings</strong
              >
              <span class="text-[11px] text-advent-muted">Espírito de Profecia Online</span>
            </div>
            <span class="text-xs font-bold text-advent-blue">↗</span>
          </a>
        </div>
      </div>
    </section>
  `,
})
export class EstudosLicaoTabComponent {}
