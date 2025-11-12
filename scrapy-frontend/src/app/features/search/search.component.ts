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
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-search',
  imports: [CommonModule, SidebarComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  userId!: string;
  searchId!: string;

  query: string = '';
  page: number = 0;

  searching = false;

  searchResults: OrganicResult[] = [];

  constructor(
    private searchService: SearchService,
    private storageService: StorageService,
    private toasterService: ToasterService,
    private browserStorageService: BrowserStorageService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.userId = this.browserStorageService?.auth?.userId!;
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ searchId }) => {
        this.searchId = searchId;
        if (searchId) this.fetchSearchResults();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  search(): void {
    this.searching = true;

    const payload: SearchRequest = {
      user_id: this.userId,
      query:
        'site:linkedin.com/in ("Software Developer") ("Python" AND "React") ("3 years" OR "4 years" OR "5 years") ("Healthcare" OR "Healthtech" OR "US Healthcare") ("Pune" OR "Bangalore" OR "India")',
      page: this.page + 1,
    };

    if (this.searchId) payload.search_id = this.searchId;

    this.searchService
      .search(payload)
      .pipe(
        tap((res: SearchResponse) => {
          this.searchResults = [
            ...this.searchResults,
            ...(res?.results?.organicResults ?? []),
          ];

          this.page += 1;

          this.location.replaceState(`/search/${res.searchId}`);
        }),
        catchError((err) => {
          console.error('Error: ', err);
          this.searchResults = [];
          this.toasterService.toast('Error fetching search results');
          return of([]);
        }),
        finalize(() => {
          this.searching = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  fetchSearchResults(): void {
    this.searching = true;

    this.storageService
      .getSearchResults(this.searchId)
      .pipe(
        tap((res: SearchResultsResponse) => {
          this.searchResults = res?.results?.organicResults ?? [];
          this.page = res.results.organicResultsCount / 10;
        }),
        catchError((err) => {
          console.error('Error: ', err);
          this.router.navigate(['/history']);
          this.toasterService.toast('Error fetching user search queries');
          return of([]);
        }),
        finalize(() => {
          this.searching = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  copySearchQuery(): void {
    navigator.clipboard.writeText(this.query);
    this.toasterService.toast('Copied search query');
  }

  copyLinkedinUrl(url: string): void {
    navigator.clipboard.writeText(url);
    this.toasterService.toast('Copied Linkedin url');
  }

  viewLinkedinProfile(url: string): void {
    window.open(url, '_blank');
  }

  linkedinHelper(): void {
    window.open(
      'https://www.linkedin.com/help/linkedin/answer/a524335',
      '_blank'
    );
  }

  exportToExcel(filename = 'scrapy.xlsx'): void {
    try {
      const raw = this.searchResults || [];

      const rows = raw.map((r: any) => ({
        title: (r.title || '').toString(),
        link: (r.link || '').toString(),
      }));

      if (rows.length === 0) {
        this.toasterService.toast('No results to export');
        return;
      }

      const aoa: any[][] = [];
      aoa.push(['Title', 'Link']);
      for (const r of rows) {
        aoa.push([r.title || '', r.link || '']);
      }

      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(aoa);

      for (let i = 0; i < rows.length; i++) {
        const excelRow = i + 2;
        const linkCellRef = `B${excelRow}`;
        const titleCellRef = `A${excelRow}`;

        const link = rows[i].link || '';
        const linkCell = ws[linkCellRef] || { t: 's', v: link };
        linkCell.t = 's';
        linkCell.v = link;
        (linkCell as any).l = { Target: link, Tooltip: link };
        ws[linkCellRef] = linkCell;

        if (!ws[titleCellRef]) {
          ws[titleCellRef] = { t: 's', v: rows[i].title || '' };
        }
      }

      const maxTitleLen = Math.max(
        10,
        ...rows.map((r) => (r.title || '').length)
      );
      const maxLinkLen = Math.max(
        20,
        ...rows.map((r) => (r.link || '').length)
      );
      (ws as any)['!cols'] = [
        { wch: Math.min(Math.max(40, Math.ceil(maxTitleLen / 1.2)), 80) },
        { wch: Math.min(Math.max(40, Math.ceil(maxLinkLen / 1.2)), 160) },
      ];

      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Results');

      const wbout: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), filename);

      this.toasterService.toast('Exported results to Excel');
    } catch (err) {
      console.error('Export failed', err);
      this.toasterService.toast('Failed to export Excel');
    }
  }
}
