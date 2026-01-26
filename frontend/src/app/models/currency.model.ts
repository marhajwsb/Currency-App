export interface CurrencyRate {
  code: string;
  rate: number;
  date: string;
}

export interface GroupedRates {
  year: number;
  quarter: number;
  month: number;
  rates: CurrencyRate[];
}