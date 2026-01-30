import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CurrencyService } from './currency.service';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CurrencyService]
    });
    service = TestBed.inject(CurrencyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Upewnia się, że nie ma oczekujących zapytań
  });

  it('powinien zostać utworzony', () => {
    expect(service).toBeTruthy();
  });

  it('powinien wysłać żądanie GET po kursy dla konkretnej daty', () => {
    const dummyDate = '2026-01-20';
    
    service.getRatesByDate(dummyDate).subscribe();

    const req = httpMock.expectOne(`http://localhost:8000/currencies/${dummyDate}`);
    expect(req.request.method).toBe('GET');
  });
});