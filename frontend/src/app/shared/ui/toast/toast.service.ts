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
  readonly toasts = this._toasts.asReadonly();

  show(toast: Omit<ToastMessage, 'id'>): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = toast.durationMs ?? 4000;
    const newToast: ToastMessage = { ...toast, id, durationMs: duration };

    this._toasts.update((current) => [...current, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
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
    this._toasts.update((current) => current.filter((t) => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}
