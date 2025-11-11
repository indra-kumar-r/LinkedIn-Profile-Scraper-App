import { Component, OnDestroy, OnInit } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/backend';
import { catchError, finalize, of, Subject, takeUntil, tap } from 'rxjs';
import { User, UserResponse } from '../../models/user.model';
import { ToasterService } from '../../core/services/toaster/toaster.service';
import { BrowserStorageService } from '../../core/services/browser-storage/browser-storage.service';

@Component({
  selector: 'app-user',
  imports: [CommonModule, SidebarComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  userId!: string;
  user!: User;
  loadingUser = false;

  constructor(
    private userService: UserService,
    private toasterService: ToasterService,
    private browserStorageService: BrowserStorageService
  ) {}

  ngOnInit(): void {
    this.userId = this.browserStorageService?.auth?.userId!;
    this.fetchUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchUser(): void {
    this.loadingUser = true;

    this.userService
      .get(this.userId)
      .pipe(
        tap((res: UserResponse) => {
          this.user = res?.user;
        }),
        catchError((err) => {
          console.error('Error: ', err);
          this.user = {} as User;
          this.toasterService.toast('Error fetching user');
          return of([]);
        }),
        finalize(() => {
          this.loadingUser = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  refreshUser(): void {
    this.loadingUser = true;

    const user: Partial<User> = {
      name: this.user.name,
    };

    this.userService
      .update(this.userId, user)
      .pipe(
        tap((res: UserResponse) => {
          this.user = res?.user;
        }),
        catchError((err) => {
          console.error('Error: ', err);
          this.toasterService.toast('Error refreshing user');
          return of([]);
        }),
        finalize(() => {
          this.loadingUser = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }
}
