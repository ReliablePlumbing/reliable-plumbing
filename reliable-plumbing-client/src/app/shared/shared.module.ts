import { NgModule } from '@angular/core';
import { AgmCoreModule } from '@agm/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";
import { CommonModule } from '@angular/common';
import { TextMaskModule } from 'angular2-text-mask';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../environments/environment';

// prime ng components
import { StepsModule, TabViewModule, MenuModule, FileUploadModule, GalleriaModule } from 'primeng/primeng';

// components
import { LoaderComponent } from './loader/loader.component';
import { NoDataComponent } from './no-data/no-data.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { MultiSelectDatepickerComponent } from './multi-select-datepicker/multi-select-datepicker.component';
// directives
import { ModelCharsReplaceDirective } from './directives/model-chars-replace.directive';
import { InputNumberDirective } from './directives/input-number.directive';
import { ClosePopoverOnOutsideClickDirective } from './directives/close-popover-outside-click.directive';
// pipes 
import { TechnicianStatusColor, TechnicianStatusTxt } from './pipes/technician-status-pipes';
import { AppointmentStatusColor, AppointmentStatusTxt } from './pipes/appointment-status-pipes';

let declarations = [
  // components
  LoaderComponent, MultiSelectDatepickerComponent, NoDataComponent, NotificationsComponent,
  // pipes
  AppointmentStatusColor, AppointmentStatusTxt, TechnicianStatusColor, TechnicianStatusTxt,
  // directives
  ModelCharsReplaceDirective, InputNumberDirective, ClosePopoverOnOutsideClickDirective
];


@NgModule({
  imports: [
    CommonModule, FormsModule, NgbModule, TextMaskModule, RouterModule, 
    AgmCoreModule.forRoot({ apiKey: environment.mapsApiKey }), StepsModule, TabViewModule, MenuModule, FileUploadModule, GalleriaModule
  ],
  declarations: declarations,
  exports: [declarations, AgmCoreModule, TextMaskModule, StepsModule, TabViewModule, MenuModule, FileUploadModule, GalleriaModule]
})
export class SharedModule { }
