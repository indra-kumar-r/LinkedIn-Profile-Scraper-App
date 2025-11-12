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
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
        this.fetchSearchResults();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchSearchResults(): void {
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
    this.toasterService.toast('Copied search query');
  }

  copyLinkedinUrl(url: string): void {
    navigator.clipboard.writeText(url);
    this.toasterService.toast('Copied Linkedin url');
  }

  viewLinkedinProfile(url: string): void {
    window.open(url, '_blank');
  }

  navigateBack(): void {
    this.router.navigate(['/history']);
  }

  exportToExcel(filename = 'scrapy.xlsx'): void {
    try {
      const raw = this.searchQuery?.organicResults || [];

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
