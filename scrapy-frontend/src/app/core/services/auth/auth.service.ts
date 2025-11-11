import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Auth } from '../../../models/shared.model';
import { BrowserStorageService } from '../browser-storage/browser-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userInfoSubject = new BehaviorSubject<Auth | null>(null);
  userInfo$ = this.userInfoSubject.asObservable();

  constructor(
    private router: Router,
    private browserStorageService: BrowserStorageService
  ) {
    const auth = this.browserStorageService.auth;
    if (auth) {
      this.userInfoSubject.next(auth);
    }
  }

  login(auth: Auth): void {
    this.browserStorageService.auth = auth;
    this.userInfoSubject.next(auth);
  }

  logout() {
    this.browserStorageService.clearStorageData();
    this.userInfoSubject.next(null);
    this.router.navigate(['/login']);
  }

  restoreUserInfo() {
    const userInfo = this.browserStorageService.auth;
    if (userInfo) {
      this.userInfoSubject.next(userInfo);
    } else {
      this.removeUserInfo();
    }
  }

  removeUserInfo() {
    this.userInfoSubject.next(null);
  }

  isLoggedIn(): boolean {
    const auth = this.browserStorageService.auth;
    return !!auth && !!auth.userId;
  }
}
