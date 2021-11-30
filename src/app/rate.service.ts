import { Injectable } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';
import {HttpClient} from '@angular/common/http';
import {finalize} from 'rxjs/operators';
import {ExchangeRate} from './models/exchange-rate';
import {Rate} from './models/Rate';
import {Chart} from 'chart.js';
import * as moment from 'moment';

@Injectable()
export class RateService {
  loading = true;
  socket: any;

  socketUrl = 'wss://ws.coinapi.io/v1/';
  endpointUrl = 'https://rest.coinapi.io/v1/exchangerate';
  apikey = '37BFD08A-19CA-4050-BB9F-688970BB5024';
  assetIdBase = 'BTC';
  assetIdQuote = 'USD';
  periodId = '5SEC';
  limit = 100;

  periodOfRefreshing = 5000;

  chart: any;
  rates: Array<Rate> = [];

  constructor(
    private httpClient: HttpClient,
  ) {
  }

  fetchHistoryAndTrack(): void {
    this.loading = true;

    const timeEnd = (new Date()).toISOString();
    const httpUrl = `${this.endpointUrl}/${this.assetIdBase}/${this.assetIdQuote}/history?apikey=${this.apikey}&period_id=${this.periodId}&time_end=${timeEnd}&limit=${this.limit}`;
    this.httpClient.get<Array<ExchangeRate>>(httpUrl)
      .pipe(finalize(() => this.loading = false))
      .subscribe((res: Array<ExchangeRate>) => {
        this.rates = res.map(el => {
          return { rate: el.rate_open, time: el.time_open };
        }).reverse();
        if (!this.chart) {
          this.chart = this.getChartData();
        } else {
          this.updateDataForChart();
        }
        this.createBadSocket();
      });
  }

  getChartData(): any {
    // @ts-ignore
    const ctx = document.getElementById('rate-chart')?.getContext('2d');
    return new Chart(ctx,
      {
        type: 'line',
        data: RateService.getDataForChart(this.getLabels(), this.getDatapoints()),
        options: RateService.getConfig()
      });
  }

  // ToDo Forbidden - Your API key don't have privileges to data type 'exrate'.
  createSocket(): void {
    const socket = webSocket({ url: this.socketUrl });
    socket.next({ type: 'hello', subscribe_data_type: [ 'exrate' ], apikey: this.apikey,
      // subscribe_filter_exchange_id: [ 'BTC' ],
    });
    socket.subscribe((res: any) => {
      console.log(res);
    });
  }

  createBadSocket(): void {
    this.socket = webSocket({ url: this.socketUrl });
    this.socket.next({ type: 'hello', subscribe_data_type: [ 'trade' ], apikey: this.apikey,
      subscribe_filter_asset_id: [ 'BTC' ], 'X-WsRequestsPerIpLimit-Remaining': 10000
    });
    this.socket.subscribe((res: any) => {
      // Get only that transactions we need
      if (moment(res.time_exchange).diff(this.rates[this.rates.length - 1]?.time) >= this.periodOfRefreshing &&
        res.symbol_id.indexOf(`${this.assetIdBase}_${this.assetIdQuote}`) >= 0
        && res.taker_side === 'BUY') {
        // From transaction get new price of asset
        this.rates.shift();
        this.rates.push({ rate: res.price, time: res.time_exchange });
        this.updateDataForChart();
      }
    });
  }

  updateDataForChart(): void {
    this.chart.data.datasets[0].data = this.getDatapoints();
    this.chart.data.labels = this.getLabels();
    this.chart.update();
  }

  private getLabels(): Array<any> {
    const labels: Array<any> = [];
    this.rates.forEach(el => {
      labels.push(moment(el.time).format('hh:mm:ss a'));
    });

    return labels;
  }

  private getDatapoints(): Array<any> {
    const datapoints: Array<any> = [];
    this.rates.forEach(el => {
      datapoints.push(el.rate);
    });

    return datapoints;
  }

  private static getDataForChart(labels: Array<any>, datapoints: Array<any>): any {
    return {
      labels,
      datasets: [
        {
          label: '',
          data: datapoints,
          borderColor: '#1b8',
          fill: false,
          tension: 0.4,
          pointRadius: 0
        }
      ]
    };
  }

  private static getConfig(): any {
    return {
      plugins: {
        legend: false,
      },
      responsive: true,
      interaction: {
        intersect: false,
      },
      scales: {
        x: {
          display: true,
          ticks: {
            maxTicksLimit: 10,
            display: true
          },
          gridLines: {
            display: false,
          },
        },
        y: {
          display: true,
        }
      },
    };
  }

}
