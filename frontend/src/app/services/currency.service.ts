import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Currency {
  currency_code: string;
  currency_name: string;
  rate: number;
  date: string;
  year: number;
  quarter: number;
  month: number;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  fetchCurrencies(): Observable<{ message: string, date: string, saved_records: number }> {
    return this.http.post<{ message: string, date: string, saved_records: number }>(
      `${this.baseUrl}/currencies/fetch`, {}
    );
  }

  getCurrenciesByDate(date: string): Observable<Currency[]> {
    return this.http.get<Currency[]>(`${this.baseUrl}/currencies/${date}`);
  }
}
