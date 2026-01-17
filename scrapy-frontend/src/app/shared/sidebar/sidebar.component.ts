import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { tabs } from '../../core/constants/shared.constants';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SearchSessionService } from '../../core/services/search-session/search-session.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  tabs = tabs;

  constructor(
    private router: Router,
    private authService: AuthService,
    private searchSession: SearchSessionService,
  ) {}

  selectTab(path: string): void {
    if (path === '/search') {
      this.navigateToSearch();
      return;
    }

    this.router.navigate([path]);
  }

  navigateToSearch() {
    this.searchSession.startNewSearch();
    this.router.navigate(['search']);
  }

  logout(): void {
    this.authService.logout();
  }
}
