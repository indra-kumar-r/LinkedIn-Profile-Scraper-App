import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { UserService } from '../../core/services/backend';
import { ToasterService } from '../../core/services/toaster/toaster.service';
import { catchError, finalize, of, Subject, takeUntil, tap } from 'rxjs';
import { Auth } from '../../models/shared.model';
import {
  User,
  UserCreationParams,
  UserResponse,
  Users,
} from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../shared/input/input.component';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  userForm!: FormGroup;

  users: User[] = [];
  selectedUser!: string;

  loadingUsers = false;
  creatingUser = false;
  errorMessage!: string;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.fetchUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.userForm = this.formBuilder.group({
      name: [null, Validators.required],
      email: [null, Validators.required],
      serpapiKey: [null, Validators.required],
    });
  }

  getControl(controlName: string): FormControl {
    return this.userForm.get(controlName) as FormControl;
  }

  login(): void {
    const user: Auth = {
      userId: this.selectedUser,
    };
    this.authService.login(user);
    this.router.navigate(['/search']);
  }

  fetchUsers(): void {
    this.loadingUsers = true;

    this.userService
      .getUsers()
      .pipe(
        tap((res: Users) => {
          this.users = res?.users ?? [];
        }),
        catchError((err) => {
          console.error('Error: ', err);
          this.users = [];
          this.toasterService.toast('Error fetching users');
          return of([]);
        }),
        finalize(() => {
          this.loadingUsers = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  selectUser(userId: string): void {
    this.selectedUser = userId;
    this.login();
  }

  createUser(): void {
    if (this.userForm.invalid) return;

    this.creatingUser = true;

    const payload: UserCreationParams = {
      name: this.userForm.value.name,
      email: this.userForm.value.email,
      serpapi_key: this.userForm.value.serpapiKey,
    };

    this.userService
      .create(payload)
      .pipe(
        tap((response: UserResponse) => {
          const user = response?.user;

          if (user && user.uuid) {
            this.selectedUser = user.uuid;
            this.login();
          }

          this.toasterService.toast('User created successfully');

          this.userForm.reset();
        }),
        catchError((error) => {
          this.errorMessage = error?.error?.error;
          console.error('Error creating user: ', error);
          this.toasterService.toast('Failed to create user');
          return of(null);
        }),
        finalize(() => {
          this.creatingUser = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  navigateToRegister(): void {
    window.open('https://serpapi.com/manage-api-key', '_blank');
  }
}
