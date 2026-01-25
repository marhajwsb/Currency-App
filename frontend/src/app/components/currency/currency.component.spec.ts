import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrencyComponent } from './currency.component'; // <-- poprawione

describe('CurrencyComponent', () => {
  let component: CurrencyComponent;
  let fixture: ComponentFixture<CurrencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrencyComponent] // <-- tu komponent, nie typ
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrencyComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
