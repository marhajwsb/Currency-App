import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CurrencyRate } from '../models/currency.model';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private apiUrl = 'http://localhost:8000/currencies';

  constructor(private http: HttpClient) {}

  /**
   * Pobiera kursy walut dla konkretnej daty z bazy danych
   */
  getRatesByDate(date: string): Observable<CurrencyRate[]> {
    return this.http.get<CurrencyRate[]>(`${this.apiUrl}/${date}`);
  }

  /**
   * Pobiera dane z API NBP dla zakresu dat i zapisuje do bazy
   * @param startDate - Data początkowa (YYYY-MM-DD)
   * @param endDate - Data końcowa (YYYY-MM-DD) - opcjonalna, domyślnie = startDate
   */
  fetchFromNBP(startDate: string, endDate?: string): Observable<any> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate || startDate);
    
    return this.http.post(`${this.apiUrl}/fetch`, {}, { params });
  }

  /**
   * Pobiera wszystkie kursy walut z bazy danych
   */
  getAllRates(): Observable<CurrencyRate[]> {
    return this.http.get<CurrencyRate[]>(`${this.apiUrl}/`);
  }

  /**
   * Usuwa wszystkie dane z bazy (opcjonalne - do testowania)
   */
  clearAllRates(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear`);
  }
}