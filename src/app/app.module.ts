import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {FormsModule} from '@angular/forms';
import {SpinnerComponent} from './spinner/spinner.component';
import {RateService} from './rate.service';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    SpinnerComponent,
  ],
    imports: [
      BrowserModule,
      FormsModule,
      HttpClientModule,
    ],
  providers: [RateService],
  bootstrap: [AppComponent]
})
export class AppModule { }
