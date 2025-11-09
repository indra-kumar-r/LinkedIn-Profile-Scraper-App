import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-search-query',
  imports: [CommonModule, SidebarComponent],
  templateUrl: './search-query.component.html',
  styleUrl: './search-query.component.scss',
})
export class SearchQueryComponent {}
