import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyTable } from './currency-table';

describe('CurrencyTable', () => {
  let component: CurrencyTable;
  let fixture: ComponentFixture<CurrencyTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrencyTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrencyTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
