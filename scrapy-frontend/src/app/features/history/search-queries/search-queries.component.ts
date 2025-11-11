import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  of,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { StorageService } from '../../../core/services/backend';
import { ToasterService } from '../../../core/services/toaster/toaster.service';
import { BrowserStorageService } from '../../../core/services/browser-storage/browser-storage.service';
import {
  GroupedSearchResults,
  UserSearchResultsParams,
  UserSearchResultsResponse,
} from '../../../models/storage.model';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-queries',
  imports: [CommonModule, SidebarComponent, ReactiveFormsModule],
  templateUrl: './search-queries.component.html',
  styleUrl: './search-queries.component.scss',
})
export class SearchQueriesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  userId!: string;

  loadingSearchQueries = false;
  page = 1;
  pageSize = 10;

  totalPages!: number;
  totalResults!: number;

  searchResults: GroupedSearchResults[] = [];

  pageControl = new FormControl(this.page);

  constructor(
    private storageService: StorageService,
    private browserStorageService: BrowserStorageService,
    private router: Router,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.userId = this.browserStorageService?.auth?.userId!;
    this.setupPaginationControl();
    this.fetchUserSearchQueries();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupPaginationControl(): void {
    this.pageControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) => {
        const requested = Number(value);
        if (!Number.isFinite(requested) || requested < 1) {
          this.pageControl.setValue(this.page, { emitEvent: false });
          return;
        }

        if (this.totalPages) {
          if (requested > this.totalPages) {
            this.pageControl.setValue(this.totalPages, { emitEvent: false });
            this.goToPage(this.totalPages);
            return;
          }
        }

        if (requested !== this.page) {
          this.goToPage(requested);
        }
      });
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
          this.totalPages = res.pagination.totalPages;
          this.totalResults = res.pagination.totalResults;

          this.pageControl.setValue(this.page, { emitEvent: false });
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

  prevPage(): void {
    if (this.page <= 1) return;

    this.page = Math.max(1, this.page - 1);
    this.fetchUserSearchQueries();
  }

  nextPage(): void {
    if (this.totalPages && this.page >= this.totalPages) return;

    this.page = this.page + 1;
    this.fetchUserSearchQueries();
  }

  goToPage(pageNumber: number): void {
    const requested = Math.floor(Number(pageNumber));
    if (!Number.isFinite(requested) || requested < 1) return;
    if (this.totalPages && requested > this.totalPages) {
      this.page = this.totalPages;
    } else {
      this.page = requested;
    }

    this.pageControl.setValue(this.page, { emitEvent: false });
    this.fetchUserSearchQueries();
  }
}
