import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyService } from '../../services/currency.service';
import { CurrencyRate } from '../../models/currency.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-currency',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss']
})
export class CurrencyComponent implements OnInit {
  rates: CurrencyRate[] = [];
  selectedDate: string = new Date().toISOString().split('T')[0];
  
  loading: boolean = false;
  isSearching: boolean = false;
  errorMessage: string = '';

  constructor(private currencyService: CurrencyService) {}

  ngOnInit(): void {
    this.refreshLocalData();
  }

  onDateChange(): void {
    this.errorMessage = '';
    this.refreshLocalData();
  }

  onFetchFromNBP(): void {
    if (!this.selectedDate) return;

    this.loading = true;
    this.errorMessage = '';
    this.rates = [];

    this.currencyService.fetchFromNBP(this.selectedDate)
      .subscribe({
        next: () => {
          console.log('Dane zapisane w bazie. Odświeżam widok...');
          setTimeout(() => {
            this.refreshLocalData();
            this.loading = false;
          }, 600);
        },
        error: (err) => {
          console.error('Błąd NBP:', err);
          this.errorMessage = 'Nie znaleziono danych w NBP dla wybranej daty.';
          this.loading = false;
        }
      });
  }

  refreshLocalData(): void {
    this.isSearching = true;
    this.currencyService.getRatesByDate(this.selectedDate)
      .pipe(finalize(() => this.isSearching = false))
      .subscribe({
        next: (data) => {
          this.rates = data;
        },
        error: () => {
          this.rates = [];
        }
      });
  }

  getYear(d: any): string { return d ? new Date(d).getFullYear().toString() : '-'; }
  getMonth(d: any): string { return d ? (new Date(d).getMonth() + 1).toString() : '-'; }
  getQuarter(d: any): string {
    if (!d) return '-';
    return Math.ceil((new Date(d).getMonth() + 1) / 3).toString();
  }
}