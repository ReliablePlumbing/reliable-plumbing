import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader/loader.component';
import { MultiSelectDatepickerComponent } from './multi-select-datepicker/multi-select-datepicker.component';
import { InputNumberDirective } from './directives/input-number.directive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NoDataComponent } from './no-data/no-data.component';

// pipes 
import { AppointmentStatusColor, AppointmentStatusTxt } from './pipes/appointment-status-pipes';
import { TechnicianStatusColor, TechnicianStatusTxt } from './pipes/technician-status-pipes';

let components: any[] = [LoaderComponent, InputNumberDirective, MultiSelectDatepickerComponent, NoDataComponent];
let pipes: any[] = [AppointmentStatusColor, AppointmentStatusTxt, TechnicianStatusColor, TechnicianStatusTxt];

let declarations = components.concat(pipes);

@NgModule({
  imports: [
    CommonModule, FormsModule, NgbModule
  ],
  declarations: declarations,
  exports: declarations
})
export class SharedModule { }
