import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { HttpService } from '../http/http.service';
import { Observable } from 'rxjs';
import { StorageApis } from '../../constants/api-routes-constants';
import {
  SearchResultsResponse,
  UserSearchResultsParams,
  UserSearchResultsResponse,
} from '../../../models/storage.model';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly apiUrl = environment.api.storage;

  constructor(private http: HttpService) {}

  getSearchResults(searchId: string): Observable<SearchResultsResponse> {
    const url = `${StorageApis.SEARCH_RESULTS}/${encodeURIComponent(searchId)}`;
    return this.http.get<SearchResultsResponse>(url, this.apiUrl);
  }

  getUserSearchResults(
    params: UserSearchResultsParams
  ): Observable<UserSearchResultsResponse> {
    const url = `${StorageApis.USER_SEARCH_RESULTS}/${encodeURIComponent(
      params.userId
    )}?page=${params.page}&page_size=${params.pageSize}`;
    return this.http.get<UserSearchResultsResponse>(url, this.apiUrl);
  }
}
