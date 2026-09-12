import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  title?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(toast: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      duration: 4000,
      ...toast,
    };

    this._toasts.update((current) => [...current, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, newToast.duration);
    }
  }

  showSuccess(message: string, title: string = 'Success') {
    this.show({ type: 'success', message, title });
  }

  showError(message: string, title: string = 'Error') {
    this.show({ type: 'error', message, title, duration: 6000 });
  }

  showInfo(message: string, title: string = 'Information') {
    this.show({ type: 'info', message, title });
  }

  showWarning(message: string, title: string = 'Warning') {
    this.show({ type: 'warning', message, title, duration: 5000 });
  }

  remove(id: string) {
    this._toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
