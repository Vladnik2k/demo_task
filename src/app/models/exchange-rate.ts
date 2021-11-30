export interface ExchangeRate {
  rate_close: number;
  rate_high: number;
  rate_low: number;
  rate_open: number;

  time_close: Date;
  time_open: Date;
  time_period_end: Date;
  time_period_start: Date;
}
