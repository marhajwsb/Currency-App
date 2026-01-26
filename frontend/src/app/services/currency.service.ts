import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CurrencyRate } from '../models/currency.model';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private apiUrl = 'http://localhost:8000/currencies';

  constructor(private http: HttpClient) {}

  getRatesByDate(date: string): Observable<CurrencyRate[]> {
    return this.http.get<CurrencyRate[]>(`${this.apiUrl}/${date}`);
  }

  fetchFromNBP(date: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/fetch?target_date=${date}`, {});
  }

  getAllRates(): Observable<CurrencyRate[]> {
    return this.http.get<CurrencyRate[]>(`${this.apiUrl}/`);
  }
}