import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { WeatherRoutingModule } from './weather-routing.module';
import { WeatherReportComponent } from './presentational/weather-report/weather-report.component';
import { DialogComponent } from './presentational/dialog/dialog.component';


@NgModule({
  declarations: [
    WeatherReportComponent,
    WeatherReportComponent,
    DialogComponent
  ],
  imports: [
    CommonModule,
    WeatherRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class WeatherModule { }
