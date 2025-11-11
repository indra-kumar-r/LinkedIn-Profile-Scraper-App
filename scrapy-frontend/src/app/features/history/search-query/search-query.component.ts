import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { catchError, finalize, of, Subject, take, takeUntil, tap } from 'rxjs';
import { StorageService } from '../../../core/services/backend';
import { BrowserStorageService } from '../../../core/services/browser-storage/browser-storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToasterService } from '../../../core/services/toaster/toaster.service';
import {
  SearchResults,
  SearchResultsResponse,
} from '../../../models/storage.model';

@Component({
  selector: 'app-search-query',
  imports: [CommonModule, SidebarComponent],
  templateUrl: './search-query.component.html',
  styleUrl: './search-query.component.scss',
})
export class SearchQueryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  userId!: string;
  searchId!: string;

  searchQuery!: SearchResults;

  loadingSearchQuery = false;

  constructor(
    private storageService: StorageService,
    private browserStorageService: BrowserStorageService,
    private toasterService: ToasterService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userId = this.browserStorageService?.auth?.userId!;

    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ searchId }) => {
        this.searchId = searchId;
        this.fetchSearchQuery();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchSearchQuery(): void {
    this.loadingSearchQuery = true;

    this.storageService
      .getSearchResults(this.searchId)
      .pipe(
        tap((res: SearchResultsResponse) => {
          this.searchQuery = res?.results ?? {};
        }),
        catchError((err) => {
          console.error('Error: ', err);
          this.router.navigate(['/history']);
          this.toasterService.toast('Error fetching user search queries');
          return of([]);
        }),
        finalize(() => {
          this.loadingSearchQuery = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  copySearchQuery(): void {
    navigator.clipboard.writeText(this.searchQuery?.query);
    this.toasterService.toast('Search query copied to clipboard');
  }

  copyLinkedinUrl(url: string): void {
    navigator.clipboard.writeText(url);
    this.toasterService.toast('Linkedin url copied to clipboard');
  }

  viewLinkedinProfile(url: string): void {
    window.open(url, '_blank');
  }

  navigateBack(): void {
    this.router.navigate(['/history']);
  }
}
