import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  durationMs?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();
  readonly toasts = this._toasts.asReadonly();

  show(toast: Omit<ToastMessage, 'id'>): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = toast.durationMs ?? 4000;
    const newToast: ToastMessage = { ...toast, id, durationMs: duration };

    this._toasts.update((current) => [...current, newToast]);

    if (duration > 0) {
      this.scheduleDismiss(id, duration);
    }

    return id;
  }

  pause(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  resume(id: string): void {
    const toast = this._toasts().find((t) => t.id === id);
    if (toast && (toast.durationMs ?? 4000) > 0 && !this.timers.has(id)) {
      this.scheduleDismiss(id, toast.durationMs ?? 4000);
    }
  }

  private scheduleDismiss(id: string, duration: number): void {
    const timer = setTimeout(() => {
      this.timers.delete(id);
      this.dismiss(id);
    }, duration);
    this.timers.set(id, timer);
  }

  success(message: string, title?: string, durationMs?: number): string {
    return this.show({ type: 'success', message, title, durationMs });
  }

  error(message: string, title?: string, durationMs?: number): string {
    return this.show({ type: 'error', message, title, durationMs });
  }

  info(message: string, title?: string, durationMs?: number): string {
    return this.show({ type: 'info', message, title, durationMs });
  }

  warning(message: string, title?: string, durationMs?: number): string {
    return this.show({ type: 'warning', message, title, durationMs });
  }

  dismiss(id: string): void {
    this.pause(id);
    this._toasts.update((current) => current.filter((t) => t.id !== id));
  }

  clear(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this._toasts.set([]);
  }
}
