import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/core/services/http.service';
import { environment } from 'src/environments/environment'
import { coordinates, currentWeatherResponse, dataHoursList, fiveDaysEesponse, placeInfo, weatherConditions } from 'src/app/shared/shared/models/weather-models';
import { groupBy, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherReportService {
  constructor(private backend: HttpService) { }

  currentWeather(coord: coordinates): Observable<currentWeatherResponse> {
    const url: string = `${environment.weatherAPI.endPointBaseURL}/weather?lat=${coord.lat}&lon=${coord.lon}&appid=${environment.weatherAPI.apiKey}`;
    return this.backend.get(url);
  }

  /**
   * These API have only in pro version
   * @param coord : Co odinates(latitude and Longitude) of the locations
   * @returns Hour based forecast data
   */
  hourlyForecast(coord: coordinates): Observable<any> {
    const url: string = `${environment.weatherAPI.endPointBaseURL}/forecast/hourly?lat=${coord.lat}&lon=${coord.lon}&appid=${environment.weatherAPI.apiKey}`;
    return this.backend.get(url);
  }

  /**
   * These API have only in pro version
   * @param coord : Co odinates(latitude and Longitude) of the locations
   * @param days : number of days
   * @returns  Daily based forecast data
   */
  dailyForecast(coord: coordinates, days: number): Observable<any> {
    const url: string = `${environment.weatherAPI.endPointBaseURL}/forecast/daily?lat=${coord.lat}&lon=${coord.lon}&lon=${days} &appid=${environment.weatherAPI.apiKey}`;
    return this.backend.get(url);
  }

  /**
     * @param coord : Co odinates(latitude and Longitude) of the locations
     * @param days : number of days
     * @returns  Daily based forecast data
  */
  fiveHourForecast(coord: coordinates): Observable<fiveDaysEesponse> {
    const url: string = `${environment.weatherAPI.endPointBaseURL}/forecast?lat=${coord.lat}&lon=${coord.lon}&appid=${environment.weatherAPI.apiKey}`;
    return this.backend.get(url)
  }

  /**
   * This API is available only pro version
   * @param coord : Co odinates(latitude and Longitude) of the locations
   * @returns Three days forecast data
   */
  thirtyDaysForecast(coord: coordinates): Observable<any> {
    const url: string = `${environment.weatherAPI.endPointBaseURL}/forecast/climate?lat=${coord.lat}&lon=${coord.lon}&appid=${environment.weatherAPI.apiKey}`;
    return this.backend.get(url);
  }




}
