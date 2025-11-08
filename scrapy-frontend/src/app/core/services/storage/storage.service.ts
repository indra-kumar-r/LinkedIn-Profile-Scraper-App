import { isPlatformBrowser } from '@angular/common';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { SessionStorageKeys } from '../../constants/storage.constants';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Local Storage
  private setLocalStorageData(key: string, value: unknown) {
    if (this.isBrowser()) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  private getLocalStorageData<T>(key: string): T {
    if (this.isBrowser()) {
      const item = localStorage.getItem(key);
      if (item === null || item === 'undefined') {
        return '' as string as T;
      }
      return JSON.parse(item as string) as T;
    }
    return '' as string as T;
  }

  // Session Storage
  private setSessionStorageData(key: string, value: unknown) {
    if (this.isBrowser()) {
      sessionStorage.setItem(key, JSON.stringify(value));
    }
  }

  private getSessionStorageData<T>(key: string): T {
    if (this.isBrowser()) {
      const item = sessionStorage.getItem(key);
      if (item === null || item === 'undefined') {
        return '' as string as T;
      }
      return JSON.parse(item as string) as T;
    }
    return '' as string as T;
  }

  // Common storage methods
  removeLocalStorageData(key: string) {
    if (this.isBrowser()) {
      localStorage.removeItem(key);
    }
  }

  removeSessionStorageData(key: string) {
    if (this.isBrowser()) {
      sessionStorage.removeItem(key);
    }
  }

  // Auth
  setAuth(value: string) {
    this.setSessionStorageData(SessionStorageKeys.AUTH, value);
  }

  getAuth(): string {
    return this.getSessionStorageData(SessionStorageKeys.AUTH);
  }
}
