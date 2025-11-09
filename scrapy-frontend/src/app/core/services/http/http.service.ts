import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private httpClient: HttpClient) {}

  private options = {
    withCredentials: true,
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  get<T>(url: string, api: string): Observable<T> {
    return this.httpClient.get<T>(api + url, this.options);
  }

  post<T>(url: string, body: any, api: string): Observable<T> {
    return this.httpClient.post<T>(api + url, body, this.options);
  }

  put<T>(url: string, body: any, api: string): Observable<T> {
    return this.httpClient.put<T>(api + url, body, this.options);
  }

  delete<T>(url: string, api: string): Observable<T> {
    return this.httpClient.delete<T>(api + url, this.options);
  }

  patch<T>(url: string, body: any, api: string): Observable<T> {
    return this.httpClient.patch<T>(api + url, body, this.options);
  }
}
