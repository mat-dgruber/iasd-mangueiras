import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-ui-datetime-picker',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full space-y-1" #containerRef>
      @if (label()) {
        <label class="block text-xs font-semibold uppercase text-advent-muted mb-1 select-none">
          {{ label() }}
        </label>
      }

      <!-- Trigger Input Box -->
      <div
        class="group relative flex w-full items-center rounded-card border bg-white transition-all shadow-2xs"
        [class.border-advent-border]="!isOpen()"
        [class.border-advent-blue]="isOpen()"
        [class.ring-2]="isOpen()"
        [class.ring-advent-blue/20]="isOpen()"
        [class.opacity-60]="isDisabled()"
        [class.bg-slate-50]="isDisabled()"
      >
        <button
          type="button"
          (click)="toggleOpen()"
          [disabled]="isDisabled()"
          class="flex flex-1 items-center gap-2.5 px-3.5 py-2 text-left text-sm cursor-pointer disabled:cursor-not-allowed min-h-[42px] focus:outline-none"
          [attr.aria-expanded]="isOpen()"
          aria-haspopup="dialog"
        >
          <svg
            class="h-4 w-4 shrink-0 text-advent-muted group-hover:text-advent-blue transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.75"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5"
            />
          </svg>

          <span
            class="truncate block"
            [class.text-advent-text]="displayValue()"
            [class.text-slate-400]="!displayValue()"
          >
            {{ displayValue() || placeholder() }}
          </span>
        </button>

        @if (displayValue() && !isDisabled()) {
          <button
            type="button"
            (click)="clearValue($event)"
            class="mr-2 p-1 rounded-md text-advent-muted hover:text-red-500 hover:bg-slate-100 transition-colors cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center"
            title="Limpar data"
            aria-label="Limpar data"
          >
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        }
      </div>

      <!-- Dropdown Popover Dialog -->
      @if (isOpen()) {
        <div
          class="absolute left-0 top-[calc(100%+6px)] z-50 w-72 sm:w-80 rounded-2xl border border-advent-border bg-white p-4 shadow-xl animate-fadeIn"
          role="dialog"
          aria-modal="false"
        >
          <!-- Popover Header: Month/Year navigation -->
          @if (viewMode() === 'days') {
            <div class="flex items-center justify-between pb-3 border-b border-advent-border">
              <button
                type="button"
                (click)="previousMonth()"
                class="rounded-lg p-1.5 text-advent-muted hover:bg-slate-100 hover:text-advent-text cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Mês anterior"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              <button
                type="button"
                (click)="viewMode.set('months')"
                class="rounded-lg px-2.5 py-1 text-xs font-bold text-advent-text hover:bg-blue-50 hover:text-advent-blue transition-colors cursor-pointer"
              >
                {{ monthNames[currentViewMonth()] }} {{ currentViewYear() }}
              </button>

              <button
                type="button"
                (click)="nextMonth()"
                class="rounded-lg p-1.5 text-advent-muted hover:bg-slate-100 hover:text-advent-text cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Próximo mês"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>

            <!-- Days Grid -->
            <div class="mt-3">
              <!-- Weekday Headers -->
              <div class="grid grid-cols-7 gap-1 text-center mb-1">
                @for (w of weekDays; track w) {
                  <span class="text-[10px] font-bold text-advent-muted uppercase">
                    {{ w }}
                  </span>
                }
              </div>

              <!-- Calendar Day Cells -->
              <div class="grid grid-cols-7 gap-1 text-center">
                @for (day of calendarDays(); track $index) {
                  @if (day.empty) {
                    <span class="h-8 w-8"></span>
                  } @else {
                    <button
                      type="button"
                      (click)="selectDay(day.day)"
                      class="relative h-8 w-8 rounded-lg text-xs font-medium transition-all flex items-center justify-center cursor-pointer mx-auto"
                      [class.bg-advent-blue]="isSelectedDay(day.day)"
                      [class.text-white]="isSelectedDay(day.day)"
                      [class.font-bold]="isSelectedDay(day.day)"
                      [class.hover:bg-blue-50]="!isSelectedDay(day.day)"
                      [class.text-advent-text]="!isSelectedDay(day.day)"
                      [class.border]="isToday(day.day) && !isSelectedDay(day.day)"
                      [class.border-advent-blue]="isToday(day.day) && !isSelectedDay(day.day)"
                    >
                      {{ day.day }}
                      @if (isToday(day.day) && !isSelectedDay(day.day)) {
                        <span class="absolute bottom-1 h-1 w-1 rounded-full bg-advent-blue"></span>
                      }
                    </button>
                  }
                }
              </div>
            </div>
          } @else if (viewMode() === 'months') {
            <!-- Months Picker Grid -->
            <div class="pb-2 border-b border-advent-border flex justify-between items-center">
              <span class="text-xs font-bold text-advent-text">Selecione o Mês</span>
              <button
                type="button"
                (click)="viewMode.set('years')"
                class="text-xs font-semibold text-advent-blue hover:underline cursor-pointer"
              >
                {{ currentViewYear() }} (Mudar Ano)
              </button>
            </div>
            <div class="grid grid-cols-3 gap-2 mt-3">
              @for (m of monthNamesShort; track $index) {
                <button
                  type="button"
                  (click)="selectMonth($index)"
                  class="rounded-xl py-2 text-xs font-semibold hover:bg-blue-50 hover:text-advent-blue transition-colors cursor-pointer border border-advent-border"
                  [class.bg-advent-blue]="currentViewMonth() === $index"
                  [class.text-white]="currentViewMonth() === $index"
                >
                  {{ m }}
                </button>
              }
            </div>
          } @else if (viewMode() === 'years') {
            <!-- Decade / Years Grid -->
            <div class="flex items-center justify-between pb-2 border-b border-advent-border">
              <button
                type="button"
                (click)="previousDecade()"
                class="p-1 text-advent-muted hover:text-advent-text cursor-pointer"
              >
                ‹
              </button>
              <span class="text-xs font-bold text-advent-text">
                {{ baseDecadeYear() }} - {{ baseDecadeYear() + 11 }}
              </span>
              <button
                type="button"
                (click)="nextDecade()"
                class="p-1 text-advent-muted hover:text-advent-text cursor-pointer"
              >
                ›
              </button>
            </div>
            <div class="grid grid-cols-3 gap-2 mt-3">
              @for (year of decadeYears(); track year) {
                <button
                  type="button"
                  (click)="selectYear(year)"
                  class="rounded-xl py-2 text-xs font-semibold hover:bg-blue-50 hover:text-advent-blue transition-colors cursor-pointer border border-advent-border"
                  [class.bg-advent-blue]="currentViewYear() === year"
                  [class.text-white]="currentViewYear() === year"
                >
                  {{ year }}
                </button>
              }
            </div>
          }

          <!-- Time Picker Section (when comHorario is true) -->
          @if (comHorario()) {
            <div class="mt-4 pt-3 border-t border-advent-border">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold uppercase tracking-wider text-advent-muted flex items-center gap-1">
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Horário
                </span>
                <button
                  type="button"
                  (click)="setCurrentTime()"
                  class="text-[10px] font-semibold text-advent-blue hover:underline cursor-pointer"
                >
                  Agora
                </button>
              </div>

              <div class="flex items-center justify-center gap-2 mt-2">
                <!-- Horas -->
                <div class="flex items-center gap-1 rounded-lg border border-advent-border bg-slate-50 px-2 py-1">
                  <input
                    type="number"
                    min="0"
                    max="23"
                    [value]="padZero(selectedHour())"
                    (change)="onHourChange($event)"
                    class="w-8 bg-transparent text-center text-xs font-bold text-advent-text focus:outline-none"
                    aria-label="Hora"
                  />
                  <div class="flex flex-col">
                    <button
                      type="button"
                      (click)="stepHour(1)"
                      class="text-[9px] text-advent-muted hover:text-advent-blue cursor-pointer"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      (click)="stepHour(-1)"
                      class="text-[9px] text-advent-muted hover:text-advent-blue cursor-pointer"
                    >
                      ▼
                    </button>
                  </div>
                </div>

                <span class="font-bold text-advent-muted">:</span>

                <!-- Minutos -->
                <div class="flex items-center gap-1 rounded-lg border border-advent-border bg-slate-50 px-2 py-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    step="5"
                    [value]="padZero(selectedMinute())"
                    (change)="onMinuteChange($event)"
                    class="w-8 bg-transparent text-center text-xs font-bold text-advent-text focus:outline-none"
                    aria-label="Minuto"
                  />
                  <div class="flex flex-col">
                    <button
                      type="button"
                      (click)="stepMinute(5)"
                      class="text-[9px] text-advent-muted hover:text-advent-blue cursor-pointer"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      (click)="stepMinute(-5)"
                      class="text-[9px] text-advent-muted hover:text-advent-blue cursor-pointer"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Footer Actions -->
          <div class="mt-4 pt-3 border-t border-advent-border flex items-center justify-between gap-2">
            <button
              type="button"
              (click)="goToToday()"
              class="rounded-lg px-2.5 py-1 text-xs font-semibold text-advent-muted hover:text-advent-text hover:bg-slate-100 transition-colors cursor-pointer min-h-[36px]"
            >
              Hoje
            </button>
            <button
              type="button"
              (click)="applyAndClose()"
              class="rounded-lg bg-advent-blue px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-advent-blue-dark active:scale-95 transition-all cursor-pointer min-h-[36px]"
            >
              Concluir
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class DateTimePickerComponent implements ControlValueAccessor {
  private readonly elementRef = inject(ElementRef);

  readonly label = input<string>('');
  readonly placeholder = input<string>('Selecione a data...');
  readonly comHorario = input<boolean>(true);
  readonly disabledInput = input<boolean>(false, { alias: 'disabled' });

  readonly value = model<string>('');

  readonly isOpen = signal<boolean>(false);
  readonly selectedDayState = signal<number | null>(null);
  readonly currentViewMonth = signal<number>(new Date().getMonth());
  readonly currentViewYear = signal<number>(new Date().getFullYear());
  readonly selectedHour = signal<number>(0);
  readonly selectedMinute = signal<number>(0);
  readonly viewMode = signal<'days' | 'months' | 'years'>('days');
  readonly baseDecadeYear = signal<number>(Math.floor(new Date().getFullYear() / 12) * 12);
  readonly isControlDisabled = signal<boolean>(false);

  readonly weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  readonly monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  readonly monthNamesShort = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ];

  readonly isDisabled = computed(() => this.disabledInput() || this.isControlDisabled());

  readonly calendarDays = computed(() => {
    const year = this.currentViewYear();
    const month = this.currentViewMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: { empty: boolean; day: number }[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ empty: true, day: 0 });
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push({ empty: false, day: d });
    }
    return days;
  });

  readonly decadeYears = computed(() => {
    const start = this.baseDecadeYear();
    const years: number[] = [];
    for (let i = 0; i < 12; i++) {
      years.push(start + i);
    }
    return years;
  });

  readonly displayValue = computed(() => {
    const v = this.value();
    if (!v) return '';

    // Legacy date string preservation
    if (v.includes('/') || (v.includes('às') && !v.includes('T'))) {
      return v;
    }

    const isoMatch = v.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
    if (isoMatch) {
      const [, y, m, d, hh, mm] = isoMatch;
      if (this.comHorario() && hh !== undefined && mm !== undefined) {
        return `${d}/${m}/${y} às ${hh}:${mm}`;
      }
      return `${d}/${m}/${y}`;
    }

    try {
      const d = new Date(v);
      if (isNaN(d.getTime())) return v;

      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();

      if (this.comHorario() && v.includes('T')) {
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} às ${hours}:${minutes}`;
      }
      return `${day}/${month}/${year}`;
    } catch {
      return v;
    }
  });

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.applyAndClose();
    }
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.onTouched();
    }
  }

  writeValue(val: string | null): void {
    const safeVal = val || '';
    this.value.set(safeVal);

    if (safeVal) {
      const isoMatch = safeVal.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
      if (isoMatch) {
        const [, y, m, d, hh, mm] = isoMatch;
        this.currentViewYear.set(parseInt(y, 10));
        this.currentViewMonth.set(parseInt(m, 10) - 1);
        this.selectedDayState.set(parseInt(d, 10));
        this.selectedHour.set(hh !== undefined ? parseInt(hh, 10) : 0);
        this.selectedMinute.set(mm !== undefined ? parseInt(mm, 10) : 0);
      } else {
        const d = new Date(safeVal);
        if (!isNaN(d.getTime())) {
          this.selectedDayState.set(d.getDate());
          this.currentViewMonth.set(d.getMonth());
          this.currentViewYear.set(d.getFullYear());
          this.selectedHour.set(d.getHours());
          this.selectedMinute.set(d.getMinutes());
        }
      }
    } else {
      this.selectedDayState.set(null);
    }
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isControlDisabled.set(isDisabled);
  }

  toggleOpen(): void {
    if (this.isDisabled()) return;
    this.isOpen.update((v) => !v);
    this.viewMode.set('days');
    if (!this.isOpen()) {
      this.onTouched();
    }
  }

  selectDay(day: number): void {
    this.selectedDayState.set(day);
    if (!this.comHorario()) {
      this.applyAndClose();
    }
  }

  selectMonth(month: number): void {
    this.currentViewMonth.set(month);
    this.viewMode.set('days');
    this.clampSelectedDay();
  }

  selectYear(year: number): void {
    this.currentViewYear.set(year);
    this.viewMode.set('months');
    this.clampSelectedDay();
  }

  previousMonth(): void {
    if (this.currentViewMonth() === 0) {
      this.currentViewMonth.set(11);
      this.currentViewYear.update((y) => y - 1);
    } else {
      this.currentViewMonth.update((m) => m - 1);
    }
    this.clampSelectedDay();
  }

  nextMonth(): void {
    if (this.currentViewMonth() === 11) {
      this.currentViewMonth.set(0);
      this.currentViewYear.update((y) => y + 1);
    } else {
      this.currentViewMonth.update((m) => m + 1);
    }
    this.clampSelectedDay();
  }

  previousDecade(): void {
    this.baseDecadeYear.update((y) => y - 12);
  }

  nextDecade(): void {
    this.baseDecadeYear.update((y) => y + 12);
  }

  isSelectedDay(day: number): boolean {
    return this.selectedDayState() === day;
  }

  isToday(day: number): boolean {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === this.currentViewMonth() &&
      today.getFullYear() === this.currentViewYear()
    );
  }

  goToToday(): void {
    const today = new Date();
    this.currentViewMonth.set(today.getMonth());
    this.currentViewYear.set(today.getFullYear());
    this.selectedDayState.set(today.getDate());
    this.viewMode.set('days');
  }

  setCurrentTime(): void {
    const now = new Date();
    this.selectedHour.set(now.getHours());
    this.selectedMinute.set(now.getMinutes());
  }

  stepHour(delta: number): void {
    let next = this.selectedHour() + delta;
    if (next < 0) next = 23;
    if (next > 23) next = 0;
    this.selectedHour.set(next);
  }

  stepMinute(delta: number): void {
    let next = this.selectedMinute() + delta;
    if (next < 0) next = 55;
    if (next > 59) next = 0;
    this.selectedMinute.set(next);
  }

  setHour(h: number): void {
    this.selectedHour.set(Math.max(0, Math.min(23, h)));
  }

  setMinute(m: number): void {
    this.selectedMinute.set(Math.max(0, Math.min(59, m)));
  }

  onHourChange(event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(val)) this.setHour(val);
  }

  onMinuteChange(event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(val)) this.setMinute(val);
  }

  applyAndClose(): void {
    const day = this.selectedDayState();
    if (day !== null) {
      const year = this.currentViewYear();
      const month = String(this.currentViewMonth() + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');

      let iso = `${year}-${month}-${dStr}`;
      if (this.comHorario()) {
        const hStr = String(this.selectedHour()).padStart(2, '0');
        const mStr = String(this.selectedMinute()).padStart(2, '0');
        iso += `T${hStr}:${mStr}:00`;
      }

      this.value.set(iso);
      this.onChange(iso);
    }
    this.isOpen.set(false);
    this.onTouched();
  }

  clearValue(event: MouseEvent): void {
    event.stopPropagation();
    this.value.set('');
    this.selectedDayState.set(null);
    this.onChange('');
    this.onTouched();
  }

  padZero(num: number): string {
    return String(num).padStart(2, '0');
  }

  private clampSelectedDay(): void {
    const current = this.selectedDayState();
    if (current === null) return;
    const maxDays = new Date(this.currentViewYear(), this.currentViewMonth() + 1, 0).getDate();
    if (current > maxDays) {
      this.selectedDayState.set(maxDays);
    }
  }
}
