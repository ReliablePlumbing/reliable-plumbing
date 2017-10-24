import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AppointmentManagementRoutingModule } from './appointment-management-routing.module';
import { ScheduleAppointmentComponent } from './schedule-appointment/schedule-appointment.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule, AppointmentManagementRoutingModule, NgbModule, ReactiveFormsModule
  ],
  declarations: [ScheduleAppointmentComponent]
})
export class AppointmentManagementModule { }
