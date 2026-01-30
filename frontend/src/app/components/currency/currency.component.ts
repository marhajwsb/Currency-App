import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyService } from '../../services/currency.service';
import { CurrencyRate } from '../../models/currency.model';
import { finalize } from 'rxjs/operators';

interface ParsedDate {
  year: string;
  month: string;
  day: string;
  quarter: string;
}

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

  /**
   * KLUCZOWA FUNKCJA - niezawodne parsowanie różnych formatów dat
   */
  private parseDate(dateString: string): ParsedDate | null {
    if (!dateString) return null;

    // Normalizuj separatory
    const normalized = dateString.replace(/[\.\/]/g, '-');
    const parts = normalized.split('-');
    
    if (parts.length !== 3) return null;

    let year: string, month: string, day: string;

    // Sprawdź długość pierwszej części, żeby określić format
    if (parts[0].length === 4) {
      // Format: YYYY-MM-DD lub YYYY-M-D
      year = parts[0];
      month = parts[1].padStart(2, '0');
      day = parts[2].padStart(2, '0');
    } else {
      // Format: DD-MM-YYYY lub D-M-YYYY
      day = parts[0].padStart(2, '0');
      month = parts[1].padStart(2, '0');
      year = parts[2];
    }

    // Walidacja
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);
    const yearNum = parseInt(year, 10);

    if (monthNum < 1 || monthNum > 12) return null;
    if (dayNum < 1 || dayNum > 31) return null;
    if (yearNum < 1900 || yearNum > 2100) return null;

    const quarter = Math.ceil(monthNum / 3).toString();

    return { year, month, day, quarter };
  }

  get filteredRates(): CurrencyRate[] {
    if (!this.rates || this.rates.length === 0) return [];

    return this.rates.filter(r => {
      const parsed = this.parseDate(r.date);
      if (!parsed) return false;

      const matchesYear = !this.filterYear || parsed.year === this.filterYear;
      const matchesQuarter = !this.filterQuarter || parsed.quarter === this.filterQuarter;
      const matchesMonth = !this.filterMonth || parsed.month === this.filterMonth;
      const matchesDay = !this.filterDay || parsed.day === this.filterDay;

      return matchesYear && matchesQuarter && matchesMonth && matchesDay;
    });
  }

  /**
   * POPRAWIONE - zbiera wszystkie unikalne lata
   */
  get availableYears(): string[] {
    const years = new Set<string>();
    
    this.rates.forEach(r => {
      const parsed = this.parseDate(r.date);
      if (parsed) {
        years.add(parsed.year);
      }
    });
    
    return Array.from(years).sort().reverse();
  }

  /**
   * POPRAWIONE - zbiera wszystkie miesiące dla wybranego roku
   */
  get availableMonths(): string[] {
    if (!this.filterYear) return [];
    
    const months = new Set<string>();
    
    this.rates.forEach(r => {
      const parsed = this.parseDate(r.date);
      if (parsed && parsed.year === this.filterYear) {
        months.add(parsed.month);
      }
    });
    
    const sorted = Array.from(months).sort();
    console.log('Available months for year', this.filterYear, ':', sorted);
    return sorted;
  }

  /**
   * POPRAWIONE - zbiera wszystkie dni dla wybranego roku i miesiąca
   */
  get availableDays(): string[] {
    if (!this.filterYear || !this.filterMonth) return [];
    
    const days = new Set<string>();
    
    this.rates.forEach(r => {
      const parsed = this.parseDate(r.date);
      if (parsed && 
          parsed.year === this.filterYear && 
          parsed.month === this.filterMonth) {
        days.add(parsed.day);
      }
    });
    
    const sorted = Array.from(days).sort();
    console.log('Available days for', this.filterYear, this.filterMonth, ':', sorted);
    return sorted;
  }

  refreshLocalData(): void {
    this.isSearching = true;
    this.currencyService.getAllRates()
      .pipe(finalize(() => this.isSearching = false))
      .subscribe({
        next: (data) => {
          this.rates = data;
          console.log('Loaded rates:', data.length);
          
          // Debug: wyświetl pierwsze kilka dat
          if (data.length > 0) {
            console.log('Sample dates:', data.slice(0, 5).map(r => r.date));
          }
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
    console.log('Year changed to:', this.filterYear);
  }

  onQuarterChange(): void {
    this.filterMonth = '';
    this.filterDay = '';
  }

  onMonthChange(): void {
    this.filterDay = '';
    console.log('Month changed to:', this.filterMonth);
  }

  getDateParts(date: string): ParsedDate {
    const parsed = this.parseDate(date);
    return parsed || { year: '?', month: '?', day: '?', quarter: '?' };
  }

  getMonthName(monthNum: string): string {
    const months = [
      'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
      'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ];
    const index = parseInt(monthNum, 10) - 1;
    return months[index] || monthNum;
  }
}