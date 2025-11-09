import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-search-queries',
  imports: [CommonModule, SidebarComponent],
  templateUrl: './search-queries.component.html',
  styleUrl: './search-queries.component.scss',
})
export class SearchQueriesComponent {}
