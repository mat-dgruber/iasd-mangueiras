import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Horario, AvisoHorarioEspecial } from '../../../core/models/content.models';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import defaultHorarios from '../../../../content/horarios.json';

@Component({
  selector: 'app-admin-horarios-page',
  standalone: true,
  imports: [ReactiveFormsModule, ConfirmDialogComponent, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-10">
      <!-- Header Geral -->
      <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-advent-text md:text-3xl">
            Horários & Avisos Especiais
          </h1>
          <p class="text-sm text-advent-muted mt-1">
            Gerencie a grade regular de cultos e publique avisos ou alterações em datas comemorativas.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            (click)="openRegularModal()"
            class="rounded-card border border-advent-blue bg-blue-50/60 px-4 py-2.5 text-xs font-semibold text-advent-blue shadow-xs transition-all hover:bg-advent-blue hover:text-white active:scale-[0.98] cursor-pointer min-h-[40px] flex items-center justify-center gap-1.5"
          >
            <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Novo Culto Regular</span>
          </button>

          <button
            type="button"
            (click)="openAvisoModal()"
            class="rounded-card bg-advent-blue px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-advent-blue-dark active:scale-[0.98] cursor-pointer min-h-[40px] flex items-center justify-center gap-1.5"
          >
            <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Novo Aviso Especial</span>
          </button>
        </div>
      </header>

      <!-- SEÇÃO 1: Grade Regular de Cultos -->
      <section aria-labelledby="section-grade-regular">
        <div class="flex items-center justify-between gap-4 mb-4 pb-2 border-b border-advent-border">
          <div>
            <h2 id="section-grade-regular" class="text-base font-bold text-advent-text">
              Grade Regular de Cultos
            </h2>
            <p class="text-xs text-advent-muted">
              Cultos semanais exibidos aos visitantes na página de horários.
            </p>
          </div>
          <button
            type="button"
            (click)="openRegularModal()"
            class="text-xs font-semibold text-advent-blue hover:text-advent-blue-dark hover:underline cursor-pointer"
          >
            + Adicionar Culto
          </button>
        </div>

        @if (isLoading()) {
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Carregando cultos regulares">
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="rounded-2xl border border-advent-border bg-white p-4 shadow-xs space-y-3">
                <div class="flex items-center justify-between">
                  <app-ui-skeleton width="100px" height="1.25rem" rounded="sm" />
                  <app-ui-skeleton width="50px" height="1.25rem" rounded="full" />
                </div>
                <app-ui-skeleton width="140px" height="1.25rem" rounded="sm" />
                <app-ui-skeleton width="100%" height="3rem" rounded="md" />
                <div class="flex justify-end gap-1.5 pt-3 border-t border-slate-100">
                  <app-ui-skeleton width="50px" height="2rem" rounded="md" />
                  <app-ui-skeleton width="50px" height="2rem" rounded="md" />
                  <app-ui-skeleton width="50px" height="2rem" rounded="md" />
                </div>
              </div>
            }
          </div>
        } @else if (regularHorarios().length === 0) {
          <div class="rounded-2xl border border-dashed border-advent-border bg-white p-10 text-center text-advent-muted">
            <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-advent-muted mb-2">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-advent-text">Nenhum culto regular cadastrado</p>
            <p class="text-xs text-advent-muted mt-0.5">Cadastre os horários das reuniões e cultos semanais da igreja.</p>
            <button
              type="button"
              (click)="openRegularModal()"
              class="mt-3 inline-flex items-center gap-1 rounded-card bg-advent-blue px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-advent-blue-dark cursor-pointer min-h-[36px]"
            >
              + Adicionar Culto Regular
            </button>
          </div>
        } @else {
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            @for (h of regularHorarios(); track (h.id || h.titulo)) {
              <article
                class="flex flex-col justify-between rounded-2xl border bg-white p-4 shadow-xs transition-colors"
                [class.border-advent-border]="h.ativo !== false"
                [class.border-slate-200]="h.ativo === false"
                [class.opacity-75]="h.ativo === false"
              >
                <div>
                  <div class="flex items-center justify-between gap-2">
                    <span class="rounded bg-advent-blue/10 px-2 py-0.5 text-[10px] font-bold uppercase text-advent-blue">
                      {{ h.dia }} • {{ h.horario }}
                    </span>

                    @if (h.ativo !== false) {
                      <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700">
                        <span class="h-2 w-2 rounded-full bg-green-500"></span> Ativo
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                        <span class="h-2 w-2 rounded-full bg-slate-300"></span> Pausado
                      </span>
                    }
                  </div>

                  <h3 class="mt-2 text-sm font-bold text-advent-text">{{ h.titulo }}</h3>
                  <p class="mt-1 text-xs text-advent-muted leading-relaxed line-clamp-3">{{ h.descricao }}</p>
                </div>

                <div class="mt-4 flex items-center justify-end gap-1.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    (click)="editRegularHorario(h)"
                    class="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-advent-blue bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer min-h-[32px]"
                    [attr.aria-label]="'Editar culto ' + h.titulo"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    (click)="toggleRegularStatus(h)"
                    class="rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer min-h-[32px]"
                    [class.bg-green-50]="h.ativo !== false"
                    [class.text-green-800]="h.ativo !== false"
                    [class.hover:bg-green-100]="h.ativo !== false"
                    [class.bg-slate-100]="h.ativo === false"
                    [class.text-slate-600]="h.ativo === false"
                    [class.hover:bg-slate-200]="h.ativo === false"
                    [attr.aria-label]="(h.ativo !== false ? 'Pausar culto ' : 'Ativar culto ') + h.titulo"
                  >
                    {{ h.ativo !== false ? 'Pausar' : 'Ativar' }}
                  </button>

                  <button
                    type="button"
                    (click)="openDeleteRegularDialog(h)"
                    class="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer min-h-[32px]"
                    [attr.aria-label]="'Excluir culto ' + h.titulo"
                  >
                    Excluir
                  </button>
                </div>
              </article>
            }
          </div>
        }
      </section>

      <!-- SEÇÃO 2: Avisos de Alteração / Horários Especiais -->
      <section aria-labelledby="section-avisos-especiais">
        <div class="flex items-center justify-between gap-4 mb-4 pb-2 border-b border-advent-border">
          <div>
            <h2 id="section-avisos-especiais" class="text-base font-bold text-advent-text">
              Avisos de Alteração / Horários Especiais
            </h2>
            <p class="text-xs text-advent-muted">
              Alertas temporários para feriados, eventos solenes e datas comemorativas.
            </p>
          </div>
          <button
            type="button"
            (click)="openAvisoModal()"
            class="text-xs font-semibold text-advent-blue hover:text-advent-blue-dark hover:underline cursor-pointer"
          >
            + Novo Aviso
          </button>
        </div>

        @if (isLoading()) {
          <div class="grid gap-3" aria-busy="true" aria-label="Carregando avisos de horários">
            @for (i of [1, 2]; track i) {
              <div class="rounded-xl border border-advent-border bg-white p-4 shadow-xs space-y-2">
                <div class="flex gap-2">
                  <app-ui-skeleton width="120px" height="1.25rem" rounded="sm" />
                  <app-ui-skeleton width="60px" height="1.25rem" rounded="full" />
                </div>
                <app-ui-skeleton width="200px" height="1.25rem" rounded="sm" />
                <app-ui-skeleton width="100%" height="2rem" rounded="md" />
              </div>
            }
          </div>
        } @else if (avisos().length === 0) {
          <div class="rounded-2xl border border-dashed border-advent-border bg-white p-8 text-center text-advent-muted">
            <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-advent-muted mb-2">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-advent-text">Nenhuma alteração temporária ativa</p>
            <p class="text-xs text-advent-muted mt-0.5">Os cultos estão seguindo normalmente a grade padrão da semana.</p>
            <button
              type="button"
              (click)="openAvisoModal()"
              class="mt-3 inline-flex items-center gap-1 rounded-card bg-advent-blue px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-advent-blue-dark cursor-pointer min-h-[36px]"
            >
              + Novo Aviso Especial
            </button>
          </div>
        } @else {
          <div class="grid gap-3">
            @for (aviso of avisos(); track (aviso.id || aviso.titulo)) {
              <article
                class="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border p-4 shadow-xs transition-colors"
                [class.border-amber-200]="aviso.ativo !== false"
                [class.bg-amber-50/60]="aviso.ativo !== false"
                [class.border-slate-200]="aviso.ativo === false"
                [class.bg-slate-50]="aviso.ativo === false"
                [class.opacity-75]="aviso.ativo === false"
              >
                <div class="space-y-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span
                      class="rounded px-2 py-0.5 text-[10px] font-bold uppercase"
                      [class.bg-amber-200]="aviso.ativo !== false"
                      [class.text-amber-900]="aviso.ativo !== false"
                      [class.bg-slate-200]="aviso.ativo === false"
                      [class.text-slate-700]="aviso.ativo === false"
                    >
                      {{ aviso.data_evento || 'Horário Especial' }}
                    </span>

                    @if (aviso.ativo !== false) {
                      <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700">
                        <span class="h-2 w-2 rounded-full bg-green-500"></span> Ativo
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                        <span class="h-2 w-2 rounded-full bg-slate-300"></span> Pausado
                      </span>
                    }

                    @if (aviso.expira_em) {
                      <span class="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        Expira em: {{ aviso.expira_em }}
                      </span>
                    }
                  </div>

                  <h3
                    class="text-sm font-bold"
                    [class.text-amber-950]="aviso.ativo !== false"
                    [class.text-slate-800]="aviso.ativo === false"
                  >
                    {{ aviso.titulo }}
                  </h3>
                  <p
                    class="text-xs leading-relaxed max-w-3xl"
                    [class.text-amber-900]="aviso.ativo !== false"
                    [class.text-slate-600]="aviso.ativo === false"
                  >
                    {{ aviso.mensagem }}
                  </p>
                </div>

                <div class="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    (click)="editAviso(aviso)"
                    class="rounded-lg px-3 py-1.5 text-xs font-semibold text-advent-blue bg-white border border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer min-h-[36px] flex items-center"
                    [attr.aria-label]="'Editar aviso ' + aviso.titulo"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    (click)="toggleAvisoStatus(aviso)"
                    class="rounded-lg px-3 py-1.5 text-xs font-semibold bg-white border transition-colors cursor-pointer min-h-[36px] flex items-center"
                    [class.border-amber-300]="aviso.ativo !== false"
                    [class.text-amber-800]="aviso.ativo !== false"
                    [class.hover:bg-amber-100]="aviso.ativo !== false"
                    [class.border-slate-300]="aviso.ativo === false"
                    [class.text-slate-600]="aviso.ativo === false"
                    [class.hover:bg-slate-100]="aviso.ativo === false"
                    [attr.aria-label]="(aviso.ativo !== false ? 'Pausar aviso ' : 'Ativar aviso ') + aviso.titulo"
                  >
                    {{ aviso.ativo !== false ? 'Pausar' : 'Ativar' }}
                  </button>

                  <button
                    type="button"
                    (click)="openDeleteAvisoDialog(aviso)"
                    class="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 bg-white border border-red-200 hover:bg-red-50 transition-colors cursor-pointer min-h-[36px] flex items-center"
                    [attr.aria-label]="'Remover aviso ' + aviso.titulo"
                  >
                    Remover
                  </button>
                </div>
              </article>
            }
          </div>
        }
      </section>

      <!-- MODAL: Culto Regular -->
      @if (isRegularModalOpen()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-regular-title"
        >
          <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div class="flex items-center justify-between pb-4 border-b border-advent-border">
              <h2 id="modal-regular-title" class="text-lg font-bold text-advent-text">
                {{ editingRegularId() ? 'Editar Culto Regular' : 'Novo Culto Regular' }}
              </h2>
              <button
                type="button"
                (click)="closeRegularModal()"
                class="text-advent-muted hover:text-advent-text cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
                aria-label="Fechar modal de culto regular"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form [formGroup]="regularForm" (ngSubmit)="saveRegularHorario()" class="mt-5 space-y-4">
              <div>
                <label for="regular-titulo" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                  Título do Culto / Reunião *
                </label>
                <input
                  id="regular-titulo"
                  type="text"
                  formControlName="titulo"
                  class="w-full rounded-card border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                  [class.border-red-500]="regularForm.get('titulo')?.invalid && regularForm.get('titulo')?.touched"
                  [class.border-advent-border]="!regularForm.get('titulo')?.invalid || !regularForm.get('titulo')?.touched"
                  placeholder="Ex: Culto Jovem, Escola Sabatina"
                />
                @if (regularForm.get('titulo')?.invalid && regularForm.get('titulo')?.touched) {
                  <span class="text-xs text-red-600 mt-1 block">Título do culto é obrigatório (mínimo 3 caracteres).</span>
                }
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="regular-dia" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                    Dia da Semana *
                  </label>
                  <select
                    id="regular-dia"
                    formControlName="dia"
                    class="w-full rounded-card border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none bg-white"
                    [class.border-red-500]="regularForm.get('dia')?.invalid && regularForm.get('dia')?.touched"
                    [class.border-advent-border]="!regularForm.get('dia')?.invalid || !regularForm.get('dia')?.touched"
                  >
                    <option value="">Selecione...</option>
                    <option value="Sábado">Sábado</option>
                    <option value="Domingo">Domingo</option>
                    <option value="Quarta-feira">Quarta-feira</option>
                    <option value="Sexta-feira">Sexta-feira</option>
                    <option value="Segunda a Sexta">Segunda a Sexta</option>
                  </select>
                  @if (regularForm.get('dia')?.invalid && regularForm.get('dia')?.touched) {
                    <span class="text-xs text-red-600 mt-1 block">Selecione o dia.</span>
                  }
                </div>

                <div>
                  <label for="regular-horario" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                    Horário *
                  </label>
                  <input
                    id="regular-horario"
                    type="text"
                    formControlName="horario"
                    class="w-full rounded-card border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                    [class.border-red-500]="regularForm.get('horario')?.invalid && regularForm.get('horario')?.touched"
                    [class.border-advent-border]="!regularForm.get('horario')?.invalid || !regularForm.get('horario')?.touched"
                    placeholder="Ex: 09:00 ou 19:30"
                  />
                  @if (regularForm.get('horario')?.invalid && regularForm.get('horario')?.touched) {
                    <span class="text-xs text-red-600 mt-1 block">Horário é obrigatório.</span>
                  }
                </div>
              </div>

              <div>
                <label for="regular-descricao" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                  Descrição do Culto *
                </label>
                <textarea
                  id="regular-descricao"
                  rows="3"
                  formControlName="descricao"
                  class="w-full rounded-card border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                  [class.border-red-500]="regularForm.get('descricao')?.invalid && regularForm.get('descricao')?.touched"
                  [class.border-advent-border]="!regularForm.get('descricao')?.invalid || !regularForm.get('descricao')?.touched"
                  placeholder="Ex: Momento solene de louvor, oração e proclamação da mensagem bíblica."
                ></textarea>
                @if (regularForm.get('descricao')?.invalid && regularForm.get('descricao')?.touched) {
                  <span class="text-xs text-red-600 mt-1 block">Descrição é obrigatória (mínimo 5 caracteres).</span>
                }
              </div>

              <div class="flex items-center gap-2 pt-1">
                <input
                  id="regular-ativo"
                  type="checkbox"
                  formControlName="ativo"
                  class="h-4 w-4 rounded border-advent-border text-advent-blue focus:ring-advent-blue"
                />
                <label for="regular-ativo" class="text-xs font-medium text-advent-text">
                  Culto ativo (visível na programação pública)
                </label>
              </div>

              <div class="mt-6 flex justify-end gap-2 pt-3 border-t border-advent-border">
                <button
                  type="button"
                  (click)="closeRegularModal()"
                  class="rounded-card border border-advent-border px-4 py-2 text-xs font-semibold text-advent-text hover:bg-slate-50 cursor-pointer min-h-[38px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="regularForm.invalid || isSaving()"
                  class="rounded-card bg-advent-blue px-6 py-2 text-xs font-semibold text-white shadow hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner disabled:opacity-50 cursor-pointer min-h-[38px]"
                >
                  {{ isSaving() ? 'Salvando...' : (editingRegularId() ? 'Salvar Alterações' : 'Cadastrar Culto') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL: Aviso de Horário Especial -->
      @if (isAvisoModalOpen()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-aviso-title"
        >
          <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div class="flex items-center justify-between pb-4 border-b border-advent-border">
              <h2 id="modal-aviso-title" class="text-lg font-bold text-advent-text">
                {{ editingAvisoId() ? 'Editar Aviso de Horário Especial' : 'Novo Aviso de Horário Especial' }}
              </h2>
              <button
                type="button"
                (click)="closeAvisoModal()"
                class="text-advent-muted hover:text-advent-text cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
                aria-label="Fechar modal de aviso especial"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form [formGroup]="avisoForm" (ngSubmit)="saveAviso()" class="mt-5 space-y-4">
              <div>
                <label for="aviso-titulo" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                  Título do Aviso *
                </label>
                <input
                  id="aviso-titulo"
                  type="text"
                  formControlName="titulo"
                  class="w-full rounded-card border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                  [class.border-red-500]="avisoForm.get('titulo')?.invalid && avisoForm.get('titulo')?.touched"
                  [class.border-advent-border]="!avisoForm.get('titulo')?.invalid || !avisoForm.get('titulo')?.touched"
                  placeholder="Ex: Culto de Ano Novo em Horário Especial"
                />
                @if (avisoForm.get('titulo')?.invalid && avisoForm.get('titulo')?.touched) {
                  <span class="text-xs text-red-600 mt-1 block">Título do aviso é obrigatório (mínimo 3 caracteres).</span>
                }
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="aviso-data" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                    Data / Ocasional
                  </label>
                  <input
                    id="aviso-data"
                    type="text"
                    formControlName="data_evento"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                    placeholder="Ex: 31/12 às 20h"
                  />
                </div>

                <div>
                  <label for="aviso-expira" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                    Expira em (Data)
                  </label>
                  <input
                    id="aviso-expira"
                    type="date"
                    formControlName="expira_em"
                    class="w-full rounded-card border border-advent-border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label for="aviso-mensagem" class="block text-xs font-semibold uppercase text-advent-muted mb-1">
                  Mensagem Informativa *
                </label>
                <textarea
                  id="aviso-mensagem"
                  rows="3"
                  formControlName="mensagem"
                  class="w-full rounded-card border px-3.5 py-2 text-sm text-advent-text focus:border-advent-blue focus:outline-none"
                  [class.border-red-500]="avisoForm.get('mensagem')?.invalid && avisoForm.get('mensagem')?.touched"
                  [class.border-advent-border]="!avisoForm.get('mensagem')?.invalid || !avisoForm.get('mensagem')?.touched"
                  placeholder="Ex: Informamos que neste feriado teremos uma única celebração no período da manhã."
                ></textarea>
                @if (avisoForm.get('mensagem')?.invalid && avisoForm.get('mensagem')?.touched) {
                  <span class="text-xs text-red-600 mt-1 block">Mensagem é obrigatória (mínimo 5 caracteres).</span>
                }
              </div>

              <div class="flex items-center gap-2 pt-1">
                <input
                  id="aviso-ativo"
                  type="checkbox"
                  formControlName="ativo"
                  class="h-4 w-4 rounded border-advent-border text-advent-blue focus:ring-advent-blue"
                />
                <label for="aviso-ativo" class="text-xs font-medium text-advent-text">
                  Aviso ativo (destaque no banner e página de horários)
                </label>
              </div>

              <div class="mt-6 flex justify-end gap-2 pt-3 border-t border-advent-border">
                <button
                  type="button"
                  (click)="closeAvisoModal()"
                  class="rounded-card border border-advent-border px-4 py-2 text-xs font-semibold text-advent-text hover:bg-slate-50 cursor-pointer min-h-[38px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="avisoForm.invalid || isSaving()"
                  class="rounded-card bg-advent-blue px-6 py-2 text-xs font-semibold text-white shadow hover:bg-advent-blue-dark active:scale-[0.98] active:shadow-inner disabled:opacity-50 cursor-pointer min-h-[38px]"
                >
                  {{ isSaving() ? 'Salvando...' : (editingAvisoId() ? 'Salvar Alterações' : 'Publicar Aviso') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Diálogo de Confirmação de Exclusão -->
      <app-ui-confirm-dialog
        [isOpen]="isDeleteDialogOpen()"
        [title]="deleteTarget()?.type === 'regular' ? 'Excluir Culto Regular' : 'Excluir Aviso de Horário'"
        [message]="'Tem certeza que deseja excluir ' + (deleteTarget()?.item?.titulo || 'este item') + '? Esta ação não poderá ser desfeita.'"
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
export class AdminHorariosPage implements OnInit {
  private readonly cmsService = inject(AdminCmsService);
  private readonly toastService = inject(ToastService);

  readonly regularHorarios = signal<Horario[]>([]);
  readonly avisos = signal<AvisoHorarioEspecial[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isRegularModalOpen = signal<boolean>(false);
  readonly isAvisoModalOpen = signal<boolean>(false);
  readonly editingRegularId = signal<string | null>(null);
  readonly editingAvisoId = signal<string | null>(null);
  readonly isSaving = signal<boolean>(false);
  readonly isDeleteDialogOpen = signal<boolean>(false);
  readonly deleteTarget = signal<{ type: 'regular' | 'aviso'; item: Horario | AvisoHorarioEspecial } | null>(null);
  readonly isDeleting = signal<boolean>(false);

  readonly regularForm = new FormGroup({
    titulo: new FormControl('', [Validators.required, Validators.minLength(3)]),
    dia: new FormControl('', [Validators.required]),
    horario: new FormControl('', [Validators.required]),
    descricao: new FormControl('', [Validators.required, Validators.minLength(5)]),
    ativo: new FormControl(true),
  });

  readonly avisoForm = new FormGroup({
    titulo: new FormControl('', [Validators.required, Validators.minLength(3)]),
    data_evento: new FormControl(''),
    mensagem: new FormControl('', [Validators.required, Validators.minLength(5)]),
    expira_em: new FormControl(''),
    ativo: new FormControl(true),
  });

  async ngOnInit(): Promise<void> {
    this.isLoading.set(true);
    try {
      await Promise.all([this.loadRegularHorarios(), this.loadAvisos()]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadRegularHorarios(): Promise<void> {
    const list = await this.cmsService.getHorariosRegulares();
    if (list && list.length > 0) {
      this.regularHorarios.set(list);
    } else {
      this.regularHorarios.set([...defaultHorarios]);
    }
  }

  async loadAvisos(): Promise<void> {
    const list = await this.cmsService.getAvisosHorarios();
    this.avisos.set(list);
  }

  // --- Cultos Regulares ---
  openRegularModal(): void {
    this.editingRegularId.set(null);
    this.regularForm.reset({
      titulo: '',
      dia: '',
      horario: '',
      descricao: '',
      ativo: true,
    });
    this.isRegularModalOpen.set(true);
  }

  editRegularHorario(horario: Horario): void {
    this.editingRegularId.set(horario.id || null);
    this.regularForm.patchValue({
      titulo: horario.titulo,
      dia: horario.dia,
      horario: horario.horario,
      descricao: horario.descricao,
      ativo: horario.ativo !== false,
    });
    this.isRegularModalOpen.set(true);
  }

  closeRegularModal(): void {
    this.isRegularModalOpen.set(false);
    this.editingRegularId.set(null);
  }

  async saveRegularHorario(): Promise<void> {
    if (this.regularForm.invalid) return;
    this.isSaving.set(true);
    const formVal = this.regularForm.value;
    const editingId = this.editingRegularId();

    const itemData: Partial<Horario> = {
      titulo: formVal.titulo!,
      dia: formVal.dia!,
      horario: formVal.horario!,
      descricao: formVal.descricao!,
      ativo: formVal.ativo ?? true,
    };

    try {
      if (editingId) {
        await this.cmsService.saveHorarioRegular(itemData, editingId);
        this.regularHorarios.update((prev) =>
          prev.map((h) => (h.id === editingId ? { ...h, ...itemData, id: editingId } : h)),
        );
        this.toastService.success('Culto regular atualizado com sucesso!');
      } else {
        const newId = await this.cmsService.saveHorarioRegular(itemData);
        this.regularHorarios.update((prev) => [...prev, { ...itemData, id: newId } as Horario]);
        this.toastService.success('Culto regular cadastrado com sucesso!');
      }
      this.closeRegularModal();
    } catch {
      // Fallback local se Firestore não estiver configurado
      if (editingId) {
        this.regularHorarios.update((prev) =>
          prev.map((h) => (h.id === editingId ? { ...h, ...itemData, id: editingId } : h)),
        );
      } else {
        this.regularHorarios.update((prev) => [...prev, itemData as Horario]);
      }
      this.toastService.success('Culto salvo localmente.');
      this.closeRegularModal();
    } finally {
      this.isSaving.set(false);
    }
  }

  async toggleRegularStatus(horario: Horario): Promise<void> {
    const newStatus = !(horario.ativo !== false);
    try {
      if (horario.id) {
        await this.cmsService.toggleHorarioAtivo(horario.id, newStatus);
      }
      this.regularHorarios.update((prev) =>
        prev.map((h) => (h === horario || h.id === horario.id ? { ...h, ativo: newStatus } : h)),
      );
      this.toastService.success(
        newStatus ? 'Culto ativado com sucesso.' : 'Culto pausado com sucesso.',
      );
    } catch {
      this.regularHorarios.update((prev) =>
        prev.map((h) => (h === horario || h.id === horario.id ? { ...h, ativo: newStatus } : h)),
      );
    }
  }

  openDeleteRegularDialog(horario: Horario): void {
    this.deleteTarget.set({ type: 'regular', item: horario });
    this.isDeleteDialogOpen.set(true);
  }

  // ponytail: backward compatible alias
  deleteRegularHorario(horario: Horario): void {
    this.openDeleteRegularDialog(horario);
  }

  // --- Avisos de Horários Especiais ---
  openAvisoModal(): void {
    this.editingAvisoId.set(null);
    this.avisoForm.reset({
      titulo: '',
      data_evento: '',
      mensagem: '',
      expira_em: '',
      ativo: true,
    });
    this.isAvisoModalOpen.set(true);
  }

  editAviso(aviso: AvisoHorarioEspecial): void {
    this.editingAvisoId.set(aviso.id || null);
    this.avisoForm.patchValue({
      titulo: aviso.titulo,
      data_evento: aviso.data_evento || '',
      mensagem: aviso.mensagem,
      expira_em: aviso.expira_em || '',
      ativo: aviso.ativo !== false,
    });
    this.isAvisoModalOpen.set(true);
  }

  closeAvisoModal(): void {
    this.isAvisoModalOpen.set(false);
    this.editingAvisoId.set(null);
  }

  // Aliases retrocompatíveis
  openModal(): void {
    this.openAvisoModal();
  }

  closeModal(): void {
    this.closeAvisoModal();
  }

  isModalOpen(): boolean {
    return this.isAvisoModalOpen();
  }

  async saveAviso(): Promise<void> {
    if (this.avisoForm.invalid) return;
    this.isSaving.set(true);
    const formVal = this.avisoForm.value;
    const editingId = this.editingAvisoId();

    const newAviso: Partial<AvisoHorarioEspecial> = {
      titulo: formVal.titulo!,
      data_evento: formVal.data_evento || 'Horário Especial',
      mensagem: formVal.mensagem!,
      expira_em: formVal.expira_em || undefined,
      ativo: formVal.ativo ?? true,
    };

    try {
      if (editingId) {
        await this.cmsService.saveAvisoHorario(newAviso, editingId);
        this.toastService.success('Aviso de horário atualizado com sucesso!');
      } else {
        await this.cmsService.saveAvisoHorario(newAviso);
        this.toastService.success('Aviso de horário publicado com sucesso!');
      }
      this.closeAvisoModal();
      await this.loadAvisos();
    } catch {
      this.avisos.update((prev) => [newAviso as AvisoHorarioEspecial, ...prev]);
      this.toastService.success('Aviso adicionado na visualização local!');
      this.closeAvisoModal();
    } finally {
      this.isSaving.set(false);
    }
  }

  async toggleAvisoStatus(aviso: AvisoHorarioEspecial): Promise<void> {
    const newStatus = !(aviso.ativo !== false);
    try {
      if (aviso.id) {
        await this.cmsService.saveAvisoHorario({ ...aviso, ativo: newStatus }, aviso.id);
      }
      this.avisos.update((prev) =>
        prev.map((a) => (a === aviso || a.id === aviso.id ? { ...a, ativo: newStatus } : a)),
      );
      this.toastService.success(
        newStatus ? 'Aviso ativado com sucesso.' : 'Aviso pausado com sucesso.',
      );
    } catch {
      this.avisos.update((prev) =>
        prev.map((a) => (a === aviso || a.id === aviso.id ? { ...a, ativo: newStatus } : a)),
      );
    }
  }

  openDeleteAvisoDialog(aviso: AvisoHorarioEspecial): void {
    this.deleteTarget.set({ type: 'aviso', item: aviso });
    this.isDeleteDialogOpen.set(true);
  }

  // ponytail: backward compatible alias
  deleteAviso(aviso: AvisoHorarioEspecial): void {
    this.openDeleteAvisoDialog(aviso);
  }

  cancelDelete(): void {
    this.isDeleteDialogOpen.set(false);
    this.deleteTarget.set(null);
  }

  async confirmDelete(): Promise<void> {
    const target = this.deleteTarget();
    if (!target) return;

    this.isDeleting.set(true);
    try {
      if (target.type === 'regular') {
        const item = target.item as Horario;
        if (item.id) {
          await this.cmsService.deleteHorarioRegular(item.id);
        }
        this.regularHorarios.update((prev) => prev.filter((h) => h !== item && h.id !== item.id));
        this.toastService.success('Culto regular excluído com sucesso.');
      } else {
        const item = target.item as AvisoHorarioEspecial;
        if (item.id) {
          await this.cmsService.deleteAvisoHorario(item.id);
        }
        this.avisos.update((prev) => prev.filter((a) => a !== item && a.id !== item.id));
        this.toastService.success('Aviso especial excluído com sucesso.');
      }
    } catch {
      if (target.type === 'regular') {
        this.regularHorarios.update((prev) => prev.filter((h) => h !== target.item && h.id !== target.item.id));
        this.toastService.success('Culto regular removido.');
      } else {
        this.avisos.update((prev) => prev.filter((a) => a !== target.item && a.id !== target.item.id));
        this.toastService.success('Aviso especial removido.');
      }
    } finally {
      this.isDeleting.set(false);
      this.cancelDelete();
    }
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.isRegularModalOpen()) {
      this.closeRegularModal();
    }
    if (this.isAvisoModalOpen()) {
      this.closeAvisoModal();
    }
  }
}
