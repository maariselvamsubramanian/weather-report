import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HttpOptions {
  options: {
    headers?: HttpHeaders | { [header: string]: string | string[]; },
    observe: "response" | "events" | "body",
    context?: HttpContext,
    params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] },
    reportProgress?: boolean,
    responseType: 'arraybuffer' | 'blob' | 'json' | 'text',
    withCredentials?: boolean
  }
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  get(url: string, requestOptions?: HttpOptions): Observable<any> {
    return this.http.get<any>(url)
  }

  post(url: string, requestOptions: HttpOptions): Observable<any> {
    return this.http.post<any>(url, requestOptions)
  }

  put(url: string, requestOptions: HttpOptions): Observable<any> {
    return this.http.put<any>(url, requestOptions)
  }

  delete(url: string, requestOptions: HttpOptions): Observable<any> {
    return this.http.delete<any>(url)
  }
}
