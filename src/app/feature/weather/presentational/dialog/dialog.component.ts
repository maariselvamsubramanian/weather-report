import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { tempature } from 'src/app/shared/shared/models/weather-models';
@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
  weatherType: string = '';
  weather: tempature = {} as tempature;

  // Inject the dependency of the mat dialog module
  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public _weather: any,
  ) { }

  ngOnInit(): void {
    this.weatherType = this._weather.isCurrent ? `Current Weather ${this._weather.selectedDate}` : `Weather Details on ${this._weather.selectedDate}`;
    this.weather = this._weather.weather;
  }

  // closing the dialog 
  onNoClick(): void {
    this.dialogRef.close();
  }

}
