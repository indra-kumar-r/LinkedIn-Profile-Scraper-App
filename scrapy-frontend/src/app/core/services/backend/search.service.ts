import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { HttpService } from '../http/http.service';
import { SearchRequest, SearchResponse } from '../../../models/search.model';
import { Observable } from 'rxjs';
import { SearchApis } from '../../constants/api-routes-constants';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private readonly apiUrl = environment.api.search;

  constructor(private http: HttpService) {}

  search(payload: SearchRequest): Observable<SearchResponse> {
    return this.http.post<SearchResponse>(
      SearchApis.SEARCH,
      payload,
      this.apiUrl
    );
  }
}
