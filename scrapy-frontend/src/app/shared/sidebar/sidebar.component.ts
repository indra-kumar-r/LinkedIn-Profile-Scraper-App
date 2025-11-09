import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { tabs } from '../../core/constants/shared.constants';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  tabs = tabs;

  constructor(private router: Router, private authService: AuthService) {}

  selectTab(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout();
  }
}
