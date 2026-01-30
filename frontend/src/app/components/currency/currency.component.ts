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
  
  startDate: string = '';
  endDate: string = '';

  filterYear: string = '';
  filterQuarter: string = '';
  filterMonth: string = '';
  filterDay: string = '';

  loading: boolean = false;
  isSearching: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  protected readonly Math = Math;
  protected readonly parseInt = parseInt;

  constructor(private currencyService: CurrencyService) {}

  ngOnInit(): void {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    this.startDate = d.toISOString().split('T')[0];
    
    this.endDate = new Date().toISOString().split('T')[0];
    
    this.refreshLocalData();
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getMaxEndDate(): string {
    if (!this.startDate) return this.getTodayDate();
    
    const start = new Date(this.startDate);
    const maxEnd = new Date(start);
    maxEnd.setDate(maxEnd.getDate() + 93);
    
    const today = new Date();
    
    return maxEnd > today 
      ? this.getTodayDate() 
      : maxEnd.toISOString().split('T')[0];
  }

  onStartDateChange(): void {
    const maxEnd = this.getMaxEndDate();
    if (this.endDate > maxEnd) {
      this.endDate = maxEnd;
    }
    if (this.endDate < this.startDate) {
      this.endDate = this.startDate;
    }
  }


  calculateDateRange(): number {
    if (!this.startDate || !this.endDate) return 0;
    
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays + 1;
  }

  onFetchRange(): void {
    if (!this.startDate) {
      this.errorMessage = 'Wybierz datę początkową';
      return;
    }
    
    const start = new Date(this.startDate);
    const end = this.endDate ? new Date(this.endDate) : start;
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 93) {
      this.errorMessage = `Zakres dat jest zbyt duży (${diffDays + 1} dni). Maksymalnie 93 dni.`;
      return;
    }
    
    if (diffDays < 0) {
      this.errorMessage = 'Data końcowa nie może być wcześniejsza niż data początkowa.';
      return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start > today) {
      this.errorMessage = 'Data początkowa nie może być w przyszłości.';
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const endDateToSend = this.endDate || this.startDate;
    
    this.currencyService.fetchFromNBP(this.startDate, endDateToSend)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          console.log('Pobrano dane:', response);
          
          this.successMessage = `Sukces! Pobrano ${response.total_records} rekordów z ${response.days_processed} dni (${this.startDate} - ${endDateToSend})`;
          
          setTimeout(() => this.refreshLocalData(), 600);
        },
        error: (err) => {
          console.error('Błąd:', err);
          this.errorMessage = err.error?.detail || 'Błąd podczas pobierania danych z NBP. Sprawdź czy NBP ma dane dla wybranego zakresu.';
        }
      });
  }

  get filteredRates(): CurrencyRate[] {
    if (!this.rates || this.rates.length === 0) return [];

    return this.rates.filter(r => {
      const normalizedDate = r.date.replace(/[\.\/]/g, '-');
      const parts = normalizedDate.split('-');
      
      if (parts.length !== 3) return true;

      // Wykryj format daty
      let year, month, day;
      if (parts[0].length === 4) {
        // Format: YYYY-MM-DD
        year = parts[0];
        month = parts[1].padStart(2, '0');
        day = parts[2].padStart(2, '0');
      } else {
        // Format: DD-MM-YYYY
        day = parts[0].padStart(2, '0');
        month = parts[1].padStart(2, '0');
        year = parts[2];
      }

      const monthNum = parseInt(month, 10);
      const quarter = Math.ceil(monthNum / 3).toString();

      const matchesYear = !this.filterYear || year === this.filterYear;
      const matchesQuarter = !this.filterQuarter || quarter === this.filterQuarter;
      const matchesMonth = !this.filterMonth || month === this.filterMonth;
      const matchesDay = !this.filterDay || day === this.filterDay;

      return matchesYear && matchesQuarter && matchesMonth && matchesDay;
    });
  }

  get availableYears(): string[] {
    const years = new Set<string>();
    this.rates.forEach(r => {
      const normalizedDate = r.date.replace(/[\.\/]/g, '-');
      const parts = normalizedDate.split('-');
      if (parts.length === 3) {
        const year = parts[0].length === 4 ? parts[0] : parts[2];
        years.add(year);
      }
    });
    return Array.from(years).sort().reverse();
  }

  get availableMonths(): string[] {
    if (!this.filterYear) return [];
    
    const months = new Set<string>();
    this.rates.forEach(r => {
      const normalizedDate = r.date.replace(/[\.\/]/g, '-');
      const parts = normalizedDate.split('-');
      if (parts.length === 3) {
        const year = parts[0].length === 4 ? parts[0] : parts[2];
        const month = parts[0].length === 4 ? parts[1] : parts[1];
        
        if (year === this.filterYear) {
          months.add(month.padStart(2, '0'));
        }
      }
    });
    return Array.from(months).sort();
  }

  get availableDays(): string[] {
    if (!this.filterYear || !this.filterMonth) return [];
    
    const days = new Set<string>();
    this.rates.forEach(r => {
      const normalizedDate = r.date.replace(/[\.\/]/g, '-');
      const parts = normalizedDate.split('-');
      if (parts.length === 3) {
        let year, month, day;
        if (parts[0].length === 4) {
          year = parts[0];
          month = parts[1].padStart(2, '0');
          day = parts[2].padStart(2, '0');
        } else {
          year = parts[2];
          month = parts[1].padStart(2, '0');
          day = parts[0].padStart(2, '0');
        }
        
        if (year === this.filterYear && month === this.filterMonth) {
          days.add(day);
        }
      }
    });
    return Array.from(days).sort();
  }

  refreshLocalData(): void {
    this.isSearching = true;
    this.currencyService.getAllRates()
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

  resetFilters(): void {
    this.filterYear = '';
    this.filterQuarter = '';
    this.filterMonth = '';
    this.filterDay = '';
  }

  onYearChange(): void {
    this.filterMonth = '';
    this.filterDay = '';
  }

  onMonthChange(): void {
    this.filterDay = '';
  }

  getDateParts(date: string): { year: string, month: string, day: string, quarter: string } {
    const normalizedDate = date.replace(/[\.\/]/g, '-');
    const parts = normalizedDate.split('-');
    
    let year, month, day;
    if (parts[0].length === 4) {
      year = parts[0];
      month = parts[1].padStart(2, '0');
      day = parts[2].padStart(2, '0');
    } else {
      year = parts[2];
      month = parts[1].padStart(2, '0');
      day = parts[0].padStart(2, '0');
    }
    
    const monthNum = parseInt(month, 10);
    const quarter = Math.ceil(monthNum / 3).toString();
    
    return { year, month, day, quarter };
  }

  getMonthName(monthNum: string): string {
    const months = [
      'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
      'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ];
    return months[parseInt(monthNum, 10) - 1] || monthNum;
  }
}