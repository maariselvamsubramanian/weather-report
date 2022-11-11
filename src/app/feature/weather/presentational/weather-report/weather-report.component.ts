import { Component, OnInit, ViewChild, Inject, ɵɵsetComponentScope } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Country, State, City } from 'country-state-city';
import { ICountry, IState, ICity } from 'country-state-city'
import { map, Observable, startWith } from 'rxjs';
import { MatRadioChange } from '@angular/material/radio';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AgGridAngular } from 'ag-grid-angular';
import { CellClickedEvent, ColDef, GridReadyEvent } from 'ag-grid-community';
import { countryDetails, locationSelection, weatherSelections, coordinates, currentWeatherResponse, dataHoursList, fiveDaysEesponse, tempature, placeInfo } from 'src/app/shared/shared/models/weather-models';
import { WeatherReportService } from '../../services/weather-report.service';
import { DialogComponent } from '../dialog/dialog.component';


@Component({
  selector: 'app-weather-report',
  templateUrl: './weather-report.component.html',
  styleUrls: ['./weather-report.component.scss']
})
export class WeatherReportComponent implements OnInit {
  countries: ICountry[] = Country.getAllCountries();
  states: IState[] = State.getAllStates();
  cities: ICity[] = [];
  countryControl = new FormControl('');
  statesControl = new FormControl('');
  cityControl = new FormControl('');
  filteredCountries!: Observable<ICountry[]>;
  filteredStates!: Observable<IState[]>;
  filteredCities!: Observable<ICity[]>;
  isStateSelected: boolean = false;
  // Assigning default value to the selected country, state, and City
  selectedValue: countryDetails = {} as countryDetails;
  seasons: weatherSelections[] = [
    {
      name: "Current Weather",
      value: 1,
      disabled: false
    },
    {
      name: "Hourly Forecast",
      value: 2,
      disabled: true
    },
    {
      name: "Daily Forecast",
      value: 3,
      disabled: true
    },
    {
      name: "Five Hour Forecast",
      value: 4,
      disabled: false
    },
    {
      name: "Mmonthly Forecast",
      value: 5,
      disabled: true
    }
  ];
  favoriteSeason: weatherSelections = {} as weatherSelections;
  representationViews: string[] = ['Chart', 'Table'];
  defaultPresentationView: string = 'Chart';
  currentWeatherDetails: currentWeatherResponse = {} as currentWeatherResponse;
  rowData: dataHoursList[] = [];
  chartData: any[] = [];
  isLoader: boolean = true;
  columnDefs: ColDef[] = [
    {
      field: 'date_format',
      headerName: 'Date Format',
      sortable: true
    },
    {
      field: '0 AM',
      headerName: '0 AM',
      cellRenderer: (value: any) => {
        return (value.data && value.data['0 AM']) ? value.data['0 AM'].temp_avg : null
      }
    },
    {
      field: '3 AM',
      headerName: '3 AM',
      cellRenderer: (value: any) => {
        return (value.data && value.data['3 AM']) ? value.data['3 AM'].temp_avg : null
      },

    },
    {
      field: '6 AM',
      headerName: '6 AM',
      cellRenderer: (value: any) => {
        return (value.data && value.data['6 AM']) ? value.data['6 AM'].temp_avg : null
      },

    },
    {
      field: '9 AM',
      headerName: '9 AM',
      cellRenderer: (value: any) => {
        return (value.data && value.data['9 AM']) ? value.data['9 AM'].temp_avg : null
      },
    },
    {
      field: '12 PM',
      headerName: '12 PM',
      cellRenderer: (value: any) => {
        return (value.data && value.data['12 PM']) ? value.data['12 PM'].temp_avg : null
      },

    },
    {
      field: '3 PM',
      headerName: '3 PM',
      cellRenderer: (value: any) => {
        return (value.data && value.data['3 PM']) ? value.data['3 PM'].temp_avg : null
      },
    },
    {
      field: '6 PM',
      headerName: '6 PM',
      cellRenderer: (value: any) => {
        return (value.data && value.data['6 PM']) ? value.data['6 PM'].temp_avg : null
      },
    },
    {
      field: '9 PM',
      headerName: '9 PM',
      cellRenderer: (value: any) => {
        return (value.data && value.data['9 PM']) ? value.data['9 PM'].temp_avg : null
      },
    }

  ];
  // DefaultColDef sets props common to all Columns
  defaultColDef: ColDef = {
    sortable: false,
    filter: true,
  };
  dateList: string[] = [];
  chartOptions: any = {};
  selectedDate: string = '';
  private _rawData: fiveDaysEesponse = {} as fiveDaysEesponse;
  private _chartData: any[] = [];
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;// For accessing the Grid's API

  constructor(private weatherReportService: WeatherReportService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.isStateSelected = false;
    this.selectedValue.lastSelection = -2;
    this.resetSelectedValue('country');
    // Adding the form control to track the changes based on the iput
    this.filteredCountries = this.countryControl.valueChanges.pipe(startWith(''), map(value => this._filterByCountry(value || '')));

    this.filteredStates = this.statesControl.valueChanges.pipe(startWith(''), map(value => this._filterByState(value || '')));

    this.filteredCities = this.cityControl.valueChanges.pipe(startWith(''), map(value => this._filterByCities(value || '')));

    // Reset the selectedValue based on values are modified by the user
    this.countryControl.valueChanges.subscribe((data: any) => {
      this.resetSelectedValue('country');
    })
    this.statesControl.valueChanges.subscribe((data: any) => {
      this.resetSelectedValue('state');
    })

    this.cityControl.valueChanges.subscribe((data: any) => {
      this.resetSelectedValue('city');
    })

  }

  // Get the selected country name
  selectedCountry(name: string): void {
    const selectedCountry = this.getCountries(name); //Get the country details
    if (selectedCountry && selectedCountry.hasOwnProperty('isoCode')) {
      this.states = State.getStatesOfCountry(selectedCountry.isoCode);
      this.statesControl.setValue('');
      this.cityControl.setValue('');
    }
    this.resetSelectedValue('state');
    this.setLocationDetails('country', selectedCountry)
    this.selectedValue.lastSelection = locationSelection.country;
    this.setLastSelectionValue();
    console.log(this.selectedValue.lastSelection);

    // if the basic conditions are satisfied, user chnages the value, automatically update the values
    if (this.selectedValue.lastSelection !== -1 && this.favoriteSeason.value) {
      this.getDataFromAPI(this.favoriteSeason.value);
    }
  }

  // Get the selected state name
  selectedState(event: string): void {
    const state: IState = State.getAllStates().find((_state: IState) => _state.name.toLowerCase() === event.toLocaleLowerCase()) as IState;
    City.getCitiesOfState
    console.log(state);
    this.isStateSelected = true;
    const country: ICountry = Country.getCountryByCode(state.countryCode) as ICountry;
    this.countryControl.setValue(country.name)
    this.cityControl.setValue('');
    this.resetSelectedValue('city');
    this.setLocationDetails('country', country);
    this.setLocationDetails('state', state);
    this.selectedValue.lastSelection = locationSelection.state;
    this.cities = [];
    this.cities = City.getCitiesOfState(state.countryCode, state.isoCode);

    console.log(City.getCitiesOfState(state.countryCode, state.isoCode))
    // if the basic conditions are satisfied, user chnages the value, automatically update the values
    if (this.selectedValue.lastSelection !== -1 && this.favoriteSeason.value) {
      this.getDataFromAPI(this.favoriteSeason.value);
    }
  }

  // Get the selected city name
  selectedCities(event: string): void {
    const city = this.getCities(event);
    this.setValueofCity(city);
    this.selectedValue.lastSelection = locationSelection.city;
    // if the basic conditions are satisfied, user chnages the value, automatically update the values
    if (this.selectedValue.lastSelection !== -1 && this.favoriteSeason.value) {
      this.getDataFromAPI(this.favoriteSeason.value);
    }
  }
  // Event emitted by season selection change
  seasonSelection(event: MatRadioChange): void {
    this.favoriteSeason = event.value;
    this.getDataFromAPI(event.value.value);
  }

  //  data from sever
  onGridReady(params: GridReadyEvent): void {
    // datas load from the server
  }

  // Getting an clicked cell event
  onCellClicked(e: CellClickedEvent | any): void {
    if (e.colDef.field?.toLowerCase() !== 'date_format') {
      const selectedTime = e.colDef.field.toString();
      const date = e.data['date_format'];
      // create an object and assigning values to the modal popup based on the cell click
      const selectedCellValue = {
        temp_max: e.data[selectedTime].temp_max,
        pressure: e.data[selectedTime].pressure,
        temp_min: e.data[selectedTime].temp_min,
        temp: e.data[selectedTime].temp_avg
      };
      this.openDialog(`${date} at ${selectedTime}`, selectedCellValue);
    }
  }

  // set the last selected location details, based on that enable the season details
  setLastSelectionValue(): void {
    const isCountrySelected = this.selectedValue.country === undefined || (this.selectedValue.country && !this.selectedValue.country.name);
    const isStateSelected = this.selectedValue.state === undefined || (this.selectedValue.state && !this.selectedValue.state.name);
    if (isCountrySelected && isStateSelected) {
      this.selectedValue.lastSelection = -1;
    }
  }

  // Changed the values based on the date selection
  dateChanged(event: MatRadioChange): void {
    this.selectedDate = event.value;
    this.formChartData();
  }

  // Fiter the country name based on the key input
  private _filterByCountry(value: string): ICountry[] {
    const filterValue = value.toLowerCase();
    return this.countries.filter((country: ICountry) => country.name.toLowerCase().includes(filterValue));
  }

  // Fiter the state name based on the key input
  private _filterByState(value: string): IState[] {
    const _filterValue = value.toLowerCase();
    return this.states.filter((_state: IState) => _state.name.toLowerCase().includes(_filterValue));
  }

  // Fiter the city name based on the key input
  private _filterByCities(value: string): ICity[] {
    const _filterValue = value.toLowerCase();
    return this.cities.filter((_city: ICity) => _city.name.toLowerCase().includes(_filterValue));
  }

  // Get the country name based on the key input
  private getCountries(name: string): ICountry {
    const country: ICountry = this.countries.find((country: ICountry) => country.name.toLowerCase() === name.toLowerCase()) as ICountry
    this.setLocationDetails('country', country);
    return country;
  }

  // Get the city details based selection
  private getCities(name: string): ICity {
    const city: ICity = this.cities.find((city: ICity) => { return city.name.toLowerCase() === name.toLowerCase(); }) as ICity;
    this.setValueofCity(city);
    return city;
  }
  // Set the selected country and state details to selectedValue
  private setLocationDetails(geo: string, locationDetails: ICountry | IState): void {
    this.selectedValue = {
      state: this.selectedValue.state,
      country: this.selectedValue.country,
      // the geo will be override the exiting property/key values of the selectedValue
      [geo]: {
        name: locationDetails.name,
        isoCode: locationDetails.isoCode,
        coordinates: {
          lon: Number(locationDetails.longitude),
          lat: Number(locationDetails.latitude),
        }
      }
    }
  }

  // Set the city values to the city
  private setValueofCity(city: ICity): void {
    this.selectedValue = {
      country: this.selectedValue.country,
      state: this.selectedValue.state,
      ['city']: {
        name: city.name,
        coordinates: {
          lon: Number(city.longitude),
          lat: Number(city.latitude),
        }
      }
    };
  }

  // return an coordinates based on the geo location selection 
  private getCoordinates(): coordinates {
    const { lastSelection } = this.selectedValue;
    const coordinates = [
      this.selectedValue?.country?.coordinates,
      this.selectedValue?.state?.coordinates,
      this.selectedValue?.city?.coordinates
    ];
    return coordinates[lastSelection as number] as coordinates;
  }

  // connecting to the service for getting an data from server.
  private getDataFromAPI(selectionStatus: number): any {

    const coOdinates: coordinates = this.getCoordinates() as coordinates;
    switch (selectionStatus) {
      case this.seasons[0].value:
        this.weatherReportService.currentWeather(coOdinates).subscribe(data => {
          this.currentWeatherDetails = data;
          this.isLoader = false;
          this.openDialog();
        });
        return
      /* commented due to these api's are available in pro version
            case this.seasons[1].value:
              return this.weatherReportService.hourlyForecast(coOdinates).subscribe(data => {
              });
            case this.seasons[2].value:
              return this.weatherReportService.dailyForecast(coOdinates, 8).subscribe(data => {
              }); */
      case this.seasons[3].value:
        this.weatherReportService.fiveHourForecast(coOdinates).subscribe(data => {
          this.isLoader = false;
          this._rawData = Object.freeze(data);
          this.rowData = data.list;
          this.createChartData();
          this.formChartData();
          this.createRowData();
        });
        return;
      default:
        // commented due to these api's are available in pro version
        // return this.weatherReportService.thirtyDaysForecast(coOdinates).subscribe(data => {
        // });
        return;
    }
  }

  // create a DOM of rowdata for AG grid data input
  private createRowData(): void {
    const _rowData: any[] = [];
    for (const column of this.rowData) {
      const dateHourInfo = new Date(column.dt_txt);
      const hours: number = dateHourInfo.getHours();
      const hoursFormat: string = (hours == 12) ? hours.toString().concat(" PM") : (hours > 12) ? (hours - 12).toString().concat(" PM") : hours.toString().concat(" AM");
      const date_format = this.dateFormatter(column.dt_txt);
      let rowObj: any = _rowData.find((row: any) => row.date_format.toString() === date_format.toString());
      if (rowObj) {
        rowObj[hoursFormat] = {
          temp_min: column.main.temp_min,
          temp_max: column.main.temp_max,
          temp_avg: column.main.temp,
          pressure: column.main.pressure
        }
      } else {
        const row: any = {
          date: Date.parse(column.dt_txt),
          date_format: date_format,
          [hoursFormat]: {
            temp_min: column.main.temp_min,
            temp_max: column.main.temp_max,
            temp_avg: column.main.temp,
            pressure: column.main.pressure
          }
        }
        _rowData.push(row);
      }
      this.rowData = _rowData;
    }
    this.rowData = _rowData;
    // refreshing the AG-Grid after updating the datas
    if (this.agGrid && this.agGrid.api) {
      this.agGrid.api.redrawRows();
    }
  }

  // date formatted based on DD-MMM-YYYY formatted
  private dateFormatter(value: string): string {
    const dateHour = new Date(value);
    const date = dateHour.getDate();
    const month = dateHour.getMonth();
    const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const year = dateHour.getFullYear();
    return `${date}-${monthName[month]}-${year}`
  }

  // create the chart data using API response for charts view
  private createChartData(): void {
    this._rawData.list.forEach((_list: dataHoursList) => {
      this._chartData.push({
        formatDate: this.dateFormatter(_list.dt_txt),
        time: new Date(_list.dt_txt.concat(" GMT")),
        temp_min: _list.main.temp_min - 50,
        temp_max: _list.main.temp_max + 50,
        temp_avg: _list.main.temp,
        pressure: _list.main.pressure
      })
    });
    this.dateList = ([...new Set(this._chartData.map(item => item.formatDate))]);
    this.selectedDate = this.dateList[0];
  }

  // configration of AG-Charts 
  private formChartData(): void {
    this.dateBasedChart();
    this.chartOptions = {
      autoSize: true,
      series: [
        {
          data: this.chartData,
          xKey: 'time',
          yKey: 'temp_min',
          yName: 'Minimum Temperature',
          stroke: '#8bc24a',
          marker: {
            fill: '#8bc24a',
            stroke: '#658d36',
          },
        },
        {
          data: this.chartData,
          xKey: 'time',
          yKey: 'temp_avg',
          yName: 'Average Temperature',
          stroke: '#03a9f4',
          marker: {
            fill: '#03a9f4',
            stroke: '#0276ab',
          }
        },
        {
          data: this.chartData,
          xKey: 'time',
          yKey: 'temp_max',
          yName: 'Maximum Temperature',
          stroke: 'red',
          marker: {
            fill: 'red',
            stroke: 'blue',
          },
        }
      ],
      axes: [
        {
          type: 'time',
          position: 'bottom',
        },
        {
          type: 'number',
          position: 'left',
          label: {
            format: '#{.1f} kelvens',
          },
        },
      ],
      legend: {
        position: 'bottom',
      }
    };
  }

  // reset the values based on the value changes of country, state, city
  private resetSelectedValue(params: string): void {

    switch (params.toLowerCase()) {
      case 'country':
        this.selectedValue = {
          country: this.resetSelectedObjectValue(),
          state: this.resetSelectedObjectValue(),
          city: this.resetSelectedObjectValue(true),
          lastSelection: this.selectedValue.lastSelection
        };
        this.resetSelectedValue('state');
        break;
      case 'state':
        this.selectedValue = {
          country: this.selectedValue.country,
          state: this.resetSelectedObjectValue(),
          city: this.resetSelectedObjectValue(true),
          lastSelection: this.selectedValue.lastSelection
        };
        this.resetSelectedValue('city');
        break;

      case 'city':
        this.selectedValue = {
          country: this.selectedValue.country,
          state: this.selectedValue.country,
          city: this.resetSelectedObjectValue(true),
          lastSelection: this.selectedValue.lastSelection
        };
        break;
      default:
        return;
    }

  }

  // updating the chart data based on the date selections
  private dateBasedChart(): void {
    this.chartData.length = 0;
    const index = this.dateList.findIndex(dates => dates === this.selectedDate);
    this.chartData = this._chartData.filter((_chartData: any) => { return _chartData.formatDate === this.selectedDate });
    for (const chart of this.chartData) {
      chart.temp_max = chart.temp_max + ((index + 1) * 100);
      chart.temp_min = chart.temp_min + ((index + 1) * 100);
      chart.temp_avg = chart.temp_avg + ((index + 1) * 100);
    }
  }

  // open the dialog for displaying the current/selected cell value in the table 
  private openDialog(selectedTime: string = '', selectedCellValue: any = {}): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '600px',
      data: {
        weather: (this.favoriteSeason.value === 1) ? this.currentWeatherDetails.main : selectedCellValue,
        isCurrent: (this.favoriteSeason.value === 1),
        selectedDate: selectedTime
      }
    });
  }

  resetSelectedObjectValue(isCity: boolean = false): placeInfo {
    const stateObj = {
      name: null,
      isoCode: null,
      coordinates: {
        lat: null,
        lon: null
      }
    };
    const cityObj = {
      name: null,
      coordinates: {
        lat: null,
        lon: null
      }
    };
    return isCity ? cityObj : stateObj;
  }
}
