import { Component } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { tabs } from '../../core/constants/shared.constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  imports: [CommonModule, SidebarComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  tabs = tabs;

  constructor(private router: Router) {}

  selectTab(path: string): void {
    this.router.navigate([path]);
  }
}
