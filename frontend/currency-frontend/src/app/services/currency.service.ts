import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  fetchCurrencies() {
    return this.http.post(`${this.apiUrl}/currencies/fetch`, {});
  }

  getCurrenciesByDate(date: string) {
    return this.http.get(`${this.apiUrl}/currencies/${date}`);
  }
}
