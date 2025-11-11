import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  LocalStorageKeys,
  SessionStorageKeys,
} from '../../constants/storage.constants';
import { Auth } from '../../../models/shared.model';

@Injectable({
  providedIn: 'root',
})
export class BrowserStorageService {
  private setLocalStorageData(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private getLocalStorageData<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined') return null;
    return JSON.parse(item) as T;
  }

  private setSessionStorageData(key: string, value: any) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  private getSessionStorageData<T>(key: string): T | null {
    const item = sessionStorage.getItem(key);
    if (!item || item === 'undefined') return null;
    return JSON.parse(item) as T;
  }

  removeLocalStorageData(key: string) {
    localStorage.removeItem(key);
  }

  removeSessionStorageData(key: string) {
    sessionStorage.removeItem(key);
  }

  clearStorageData() {
    localStorage.clear();
    sessionStorage.clear();
  }

  get auth(): Auth | null {
    return this.getLocalStorageData<Auth>(LocalStorageKeys.AUTH);
  }

  set auth(value: Auth | null) {
    if (value === null) {
      this.removeLocalStorageData(LocalStorageKeys.AUTH);
    } else {
      this.setLocalStorageData(LocalStorageKeys.AUTH, value);
    }
  }

  get redirectUrl(): string | null {
    return this.getSessionStorageData<string>(
      SessionStorageKeys.REDIRECT_AFTER_LOGIN
    );
  }

  set redirectUrl(url: string | null) {
    if (url === null) {
      this.removeSessionStorageData(SessionStorageKeys.REDIRECT_AFTER_LOGIN);
    } else {
      this.setSessionStorageData(SessionStorageKeys.REDIRECT_AFTER_LOGIN, url);
    }
  }
}
