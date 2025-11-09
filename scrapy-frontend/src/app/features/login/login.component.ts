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
import { User, UserRegisterResponse, Users } from '../../models/user.model';
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
      verification: [null, Validators.required],
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
    this.router.navigate(['/home']);
  }

  fetchUsers(): void {
    this.loadingUsers = true;

    this.userService
      .getUsers()
      .pipe(
        tap((res: Users) => {
          this.users = res?.users;
          console.log('Users: ', this.users);
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

  createUser(): void {
    if (this.userForm.invalid) return;

    this.creatingUser = true;

    this.userService
      .create(this.userForm.value)
      .pipe(
        tap((response: UserRegisterResponse) => {
          const user = response?.user;

          if (user && user.uuid) {
            this.selectedUser = user.uuid;
            this.login();
          }

          this.toasterService.toast('User created successfully, logging in...');

          this.userForm.reset();
        }),
        catchError((err) => {
          console.error('Error creating user: ', err);
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
}
