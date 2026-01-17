import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchSessionService {
  private newSearch$ = new Subject<void>();

  startNewSearch() {
    this.newSearch$.next();
  }

  onNewSearch(): Observable<void> {
    return this.newSearch$.asObservable();
  }
}
