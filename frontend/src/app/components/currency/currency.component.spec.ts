import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CurrencyComponent } from './currency.component';
import { CurrencyService } from '../../services/currency.service';
import { of } from 'rxjs';

describe('CurrencyComponent', () => {
  let component: CurrencyComponent;
  let fixture: ComponentFixture<CurrencyComponent>;
  let service: CurrencyService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CurrencyComponent ],
      imports: [ HttpClientTestingModule ],
      providers: [ CurrencyService ]
    }).compileComponents();

    fixture = TestBed.createComponent(CurrencyComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(CurrencyService);
  });

  it('powinien wywołać fetchFromNBP po kliknięciu przycisku', () => {
    const spy = spyOn(service, 'fetchFromNBP').and.returnValue(of({}));
    component.selectedDate = '2024-01-22';
    
    component.onFetchFromNBP();
    
    expect(spy).toHaveBeenCalledWith('2024-01-22');
  });
});