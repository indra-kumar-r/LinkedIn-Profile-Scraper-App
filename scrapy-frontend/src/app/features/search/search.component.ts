import { Component, OnDestroy, OnInit } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService, StorageService } from '../../core/services/backend';
import { ToasterService } from '../../core/services/toaster/toaster.service';
import { BrowserStorageService } from '../../core/services/browser-storage/browser-storage.service';
import { catchError, finalize, of, Subject, takeUntil, tap } from 'rxjs';
import {
  OrganicResult,
  SearchRequest,
  SearchResponse,
} from '../../models/search.model';
import { SearchResultsResponse } from '../../models/storage.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { exportToExcel } from '../../core/utils/excel.util';
import { SearchSessionService } from '../../core/services/search-session/search-session.service';

@Component({
  selector: 'app-search',
  imports: [CommonModule, SidebarComponent, ReactiveFormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchReset$ = new Subject<void>();

  searchForm!: FormGroup;

  userId!: string;
  searchId!: string | null;

  page = 0;
  loading = false;

  searchResults: OrganicResult[] = [];

  constructor(
    private searchService: SearchService,
    private storageService: StorageService,
    private toasterService: ToasterService,
    private browserStorageService: BrowserStorageService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private formBuilder: FormBuilder,
    private searchSession: SearchSessionService,
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.userId = this.browserStorageService?.auth?.userId!;
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ searchId }) => {
        this.searchId = searchId ?? null;

        if (this.searchId && this.searchId !== 'new-search') {
          this.fetchSearchResults();
        } else {
          this.resetState();
        }
      });

    this.searchSession
      .onNewSearch()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.resetState();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchReset$.next();
    this.searchReset$.complete();
  }

  initForm(): void {
    this.searchForm = this.formBuilder.group({
      query: [null, [Validators.required, Validators.minLength(1)]],
    });
  }

  onSubmit(): void {
    const query = (this.searchForm.get('query')?.value || '').toString().trim();
    if (!query) return;

    this.page = 0;
    this.searchResults = [];
    this.searchId = 'new-search';

    this.location.replaceState(`/search/${this.searchId}`);

    this.search();
  }

  search(): void {
    const query = (this.searchForm.get('query')?.value || '').toString().trim();
    if (!query) return;

    this.loading = true;

    const payload: SearchRequest = {
      user_id: this.userId,
      query,
      page: this.page + 1,
    };

    if (this.searchId && this.searchId !== 'new-search') {
      payload.search_id = this.searchId;
    }

    this.searchService
      .search(payload)
      .pipe(
        tap((res: SearchResponse) => {
          this.searchResults = [
            ...this.searchResults,
            ...(res?.results?.organicResults ?? []),
          ];

          if (this.searchResults.length === 0) {
            this.toasterService.toast('No results found for the search.');
            this.searchSession.startNewSearch();
            this.router.navigate(['search']);
            return;
          }

          this.page += 1;

          this.searchId = res.searchId;
          this.location.replaceState(`/search/${res.searchId}`);
        }),
        catchError((err) => {
          console.error('Error: ', err);
          this.searchResults = [];
          this.toasterService.toast('Error fetching search results');
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        }),
        takeUntil(this.searchReset$),
      )
      .subscribe();
  }

  fetchSearchResults(): void {
    if (!this.searchId) return;

    this.loading = true;

    this.storageService
      .getSearchResults(this.searchId)
      .pipe(
        tap((res: SearchResultsResponse) => {
          this.searchForm.patchValue({ query: res?.results.query ?? '' });

          if (!res.results.query) {
            this.toasterService.toast('No results found for the search.');
            this.searchSession.startNewSearch();
            this.router.navigate(['search']);
            return;
          }

          this.searchResults = res?.results?.organicResults ?? [];

          const resultsCount =
            res?.results?.organicResultsCount ?? this.searchResults.length;

          this.page = resultsCount > 0 ? Math.ceil(resultsCount / 10) : 0;
        }),
        catchError((err) => {
          console.error('Error: ', err);
          this.router.navigate(['/search']);
          this.toasterService.toast('Error fetching user search queries');
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        }),
        takeUntil(this.searchReset$),
      )
      .subscribe();
  }

  copySearchQuery(): void {
    const query = (this.searchForm.get('query')?.value || '').toString();
    navigator.clipboard.writeText(query);
    this.toasterService.toast('Copied search query');
  }

  viewDetails(url: string): void {
    window.open(url, '_blank');
  }

  copyUrl(url: string): void {
    navigator.clipboard.writeText(url);
    this.toasterService.toast('Copied Linkedin url');
  }

  linkedinHelper(): void {
    window.open(
      'https://www.linkedin.com/help/linkedin/answer/a524335',
      '_blank',
    );
  }

  private resetState(): void {
    this.searchReset$.next();

    this.loading = false;
    this.page = 0;
    this.searchId = null;
    this.searchResults = [];

    this.searchForm.reset();
  }

  export(): void {
    exportToExcel(this.searchResults, 'scrapy.xlsx')
      .then(() => {
        this.toasterService.toast('Exported results to Excel');
      })
      .catch((err) => {
        this.toasterService.toast(err?.message ?? 'Failed to export Excel');
      });
  }
}
