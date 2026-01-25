import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyService, Currency } from '../../services/currency.service';

@Component({
  selector: 'app-currency',
  standalone: true,
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class CurrencyComponent {
  currencies: Currency[] = [];
  message: string = '';
  selectedDate: string = new Date().toISOString().split('T')[0];

  constructor(private currencyService: CurrencyService) {}

  fetchCurrencies() {
    this.currencyService.fetchCurrencies().subscribe(res => {
      this.message = `${res.message} (${res.saved_records} records)`;
      this.getCurrencies();
    });
  }

  getCurrencies() {
    this.currencyService.getCurrenciesByDate(this.selectedDate).subscribe(data => {
      this.currencies = data;
    });
  }
}
export type { Currency };

