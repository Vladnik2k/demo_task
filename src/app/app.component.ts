import {Component, OnInit} from '@angular/core';
import {RateService} from './rate.service';
import {Chart, registerables} from 'chart.js';
import * as moment from 'moment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  valueBase = '';
  valueQuote = '';

  constructor(
    public rateService: RateService,
  ) {
    this.valueBase = this.rateService.assetIdBase;
    this.valueQuote = this.rateService.assetIdQuote;
  }

  get lastRateTime() {
    return moment(this.rateService.rates[this.rateService.rates.length - 1]?.time).format('MMMM Do, h:mm:ss a');
  }

  ngOnInit(): void {
    this.rateService.fetchHistoryAndTrack();

    Chart.register(...registerables);
  }

  subscribe(): void {
    this.rateService.socket.unsubscribe();
    this.rateService.assetIdBase = this.valueBase;
    this.rateService.assetIdQuote = this.valueQuote;

    this.rateService.fetchHistoryAndTrack();
  }
}
