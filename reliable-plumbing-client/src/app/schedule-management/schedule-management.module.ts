import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ScheduleManagementRoutingModule } from './schedule-management-routing.module';
import { ScheduleAppointmentComponent } from './schedule-appointment/schedule-appointment.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppointmentTypesManagementComponent } from './appointment-types-management/appointment-types-management.component';

@NgModule({
  imports: [
    CommonModule, ScheduleManagementRoutingModule, NgbModule, ReactiveFormsModule
  ],
  declarations: [ScheduleAppointmentComponent, AppointmentTypesManagementComponent]
})
export class ScheduleManagementModule { }
