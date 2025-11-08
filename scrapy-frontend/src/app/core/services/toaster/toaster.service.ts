import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Toast } from '../../../models/shared.model';

@Injectable({
  providedIn: 'root',
})
export class ToasterService {
  private toasts: Toast[] = [];
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  private nextToastId = 0;

  toast(message: string) {
    const toast: Toast = {
      id: ++this.nextToastId,
      message,
    };

    this.toasts.push(toast);
    this.toastsSubject.next([...this.toasts]);

    setTimeout(() => this.dismiss(toast.id), 3000);
  }

  dismiss(id: number) {
    this.toasts = this.toasts?.filter((toast) => toast.id !== id);
    this.toastsSubject.next([...this.toasts]);
  }
}
