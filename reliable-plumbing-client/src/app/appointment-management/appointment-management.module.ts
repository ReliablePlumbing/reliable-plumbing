import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AppointmentManagementRoutingModule } from './appointment-management-routing.module';
import { ScheduleAppointmentComponent } from './schedule-appointment/schedule-appointment.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppointmentDetailsComponent } from './appointment-details/appointment-details.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule, AppointmentManagementRoutingModule, NgbModule, ReactiveFormsModule, SharedModule
  ],
  declarations: [ScheduleAppointmentComponent, AppointmentDetailsComponent],
  exports: [ScheduleAppointmentComponent, AppointmentDetailsComponent]
})
export class AppointmentManagementModule { }
