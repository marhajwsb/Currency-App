import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { CurrencyComponent } from './currency.component';
import { CurrencyService } from '../../services/currency.service';
import { of, throwError } from 'rxjs';
import { CurrencyRate } from '../../models/currency.model';
import { vi } from 'vitest'; // Vitest tego potrzebuje do vi.spyOn

describe('CurrencyComponent', () => {
  let component: CurrencyComponent;
  let fixture: ComponentFixture<CurrencyComponent>;
  let currencyService: CurrencyService;

  const mockRates: CurrencyRate[] = [
    { code: 'USD', rate: 4.0, date: '2024-01-15' },
    { code: 'EUR', rate: 4.5, date: '2024-05-20' },
    { code: 'CHF', rate: 4.2, date: '2025-11-10' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, CurrencyComponent],
      providers: [CurrencyService]
    }).compileComponents();

    fixture = TestBed.createComponent(CurrencyComponent);
    component = fixture.componentInstance;
    currencyService = TestBed.inject(CurrencyService);
    
    vi.spyOn(currencyService, 'getAllRates').mockReturnValue(of(mockRates));
    
    fixture.detectChanges();
  });

  it('powinien zostać utworzony', () => {
    expect(component).toBeTruthy();
  });

  it('powinien przefiltrować dane po roku', () => {
    component.rates = mockRates;
    component.filterYear = '2024';
    const filtered = component.filteredRates;
    expect(filtered.length).toBe(2);
  });

  it('powinien ustawić błąd jeśli zakres dat jest ujemny', () => {
    component.startDate = '2025-01-10';
    component.endDate = '2025-01-01';
    component.onFetchRange();
    expect(component.errorMessage).toContain('Data końcowa nie może być wcześniejsza');
  });

  it('powinien pobrać dane z NBP i odświeżyć lokalną listę', async () => {
    const fetchSpy = vi.spyOn(currencyService, 'fetchFromNBP').mockReturnValue(of({
      total_records: 100,
      days_processed: 5
    }));
    const refreshSpy = vi.spyOn(component, 'refreshLocalData');

    component.startDate = '2024-01-01';
    component.endDate = '2024-01-05';
    component.onFetchRange();

    expect(fetchSpy).toHaveBeenCalledWith('2024-01-01', '2024-01-05');
    
    await new Promise(resolve => setTimeout(resolve, 700));
    
    expect(refreshSpy).toHaveBeenCalled();
    expect(component.successMessage).toContain('Sukces');
  });

  it('powinien obsłużyć błąd z API NBP', () => {
    vi.spyOn(currencyService, 'fetchFromNBP').mockReturnValue(throwError(() => ({
      error: { detail: 'NBP Error' }
    })));

    const testDate = '2024-01-01';
    component.startDate = testDate;
    component.endDate = testDate; 
    
    component.onFetchRange();

    expect(component.errorMessage).toBe('NBP Error');
  });
});