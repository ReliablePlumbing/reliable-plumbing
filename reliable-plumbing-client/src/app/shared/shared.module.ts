import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader/loader.component';
import { MultiSelectDatepickerComponent } from './multi-select-datepicker/multi-select-datepicker.component';
import { InputNumberDirective } from './directives/input-number.directive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NoDataComponent } from './no-data/no-data.component';
import { AgmCoreModule } from '@agm/core';
import { environment } from '../../environments/environment';
// pipes 
import { AppointmentStatusColor, AppointmentStatusTxt } from './pipes/appointment-status-pipes';
import { TechnicianStatusColor, TechnicianStatusTxt } from './pipes/technician-status-pipes';

let declarations = [LoaderComponent, InputNumberDirective, MultiSelectDatepickerComponent, NoDataComponent,
  // pipes
  AppointmentStatusColor, AppointmentStatusTxt, TechnicianStatusColor, TechnicianStatusTxt];


@NgModule({
  imports: [
    CommonModule, FormsModule, NgbModule, AgmCoreModule.forRoot({ apiKey: environment.mapsApiKey })
  ],
  declarations: declarations,
  exports: [declarations, AgmCoreModule]
})
export class SharedModule { }
