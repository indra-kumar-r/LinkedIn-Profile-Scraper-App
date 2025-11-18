import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { OrganicResult } from '../../models/search.model';

export function exportToExcel(
  searchResults: OrganicResult[],
  filename?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const raw = searchResults || [];

      const rows = raw.map((r: any) => ({
        title: (r.title || '').toString(),
        link: (r.link || '').toString(),
      }));

      if (rows.length === 0) {
        return reject(new Error('No results to export'));
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

      saveAs(
        new Blob([wbout], { type: 'application/octet-stream' }),
        filename ?? 'scrapy.xlsx'
      );

      resolve();
    } catch (err) {
      console.error('Export failed', err);
      reject(err);
    }
  });
}
