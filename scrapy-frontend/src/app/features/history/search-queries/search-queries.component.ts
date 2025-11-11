import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { catchError, finalize, of, Subject, takeUntil, tap } from 'rxjs';
import { User } from '../../../models/user.model';
import { StorageService } from '../../../core/services/backend';
import { ToasterService } from '../../../core/services/toaster/toaster.service';
import { BrowserStorageService } from '../../../core/services/browser-storage/browser-storage.service';
import {
  GroupedSearchResults,
  UserSearchResultsParams,
  UserSearchResultsResponse,
} from '../../../models/storage.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-queries',
  imports: [CommonModule, SidebarComponent],
  templateUrl: './search-queries.component.html',
  styleUrl: './search-queries.component.scss',
})
export class SearchQueriesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  userId!: string;

  loadingSearchQueries = false;
  page = 1;
  pageSize = 10;

  searchResults: GroupedSearchResults[] = [];

  constructor(
    private storageService: StorageService,
    private browserStorageService: BrowserStorageService,
    private router: Router,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.userId = this.browserStorageService?.auth?.userId!;
    this.fetchUserSearchQueries();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchUserSearchQueries(): void {
    this.loadingSearchQueries = true;

    const params: UserSearchResultsParams = {
      userId: this.userId,
      page: this.page,
      pageSize: this.pageSize,
    };

    this.storageService
      .getUserSearchResults(params)
      .pipe(
        tap((res: UserSearchResultsResponse) => {
          this.searchResults = res?.results ?? [];
        }),
        catchError((err) => {
          console.error('Error: ', err);
          this.searchResults = [];
          this.toasterService.toast('Error fetching user search queries');
          return of([]);
        }),
        finalize(() => {
          this.loadingSearchQueries = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  viewSearchResults(searchId: string): void {
    this.router.navigate(['/history/search-queries', searchId]);
  }

  copySearchQuery(searchQuery: string): void {
    navigator.clipboard.writeText(searchQuery);
    this.toasterService.toast('Search query copied to clipboard');
  }

  navigateToSearch(): void {
    this.router.navigate(['/search']);
  }
}
