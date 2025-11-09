import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { StorageService } from '../storage/storage.service';
import { Auth } from '../../../models/shared.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userInfoSubject = new BehaviorSubject<Auth | null>(null);
  userInfo$ = this.userInfoSubject.asObservable();

  constructor(private router: Router, private storageService: StorageService) {
    const auth = this.storageService.auth;
    if (auth) {
      this.userInfoSubject.next(auth);
    }
  }

  login(auth: Auth): void {
    this.storageService.auth = auth;
    this.userInfoSubject.next(auth);
  }

  logout() {
    this.storageService.clearStorageData();
    this.userInfoSubject.next(null);
    this.router.navigate(['/login']);
  }

  restoreUserInfo() {
    const userInfo = this.storageService.auth;
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
    const auth = this.storageService.auth;
    return !!auth && !!auth.userId;
  }
}
