import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ScheduleManagementRoutingModule } from './schedule-management-routing.module';
import { ScheduleAppointmentComponent } from './schedule-appointment/schedule-appointment.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule, ScheduleManagementRoutingModule, NgbModule, ReactiveFormsModule
  ],
  declarations: [ScheduleAppointmentComponent]
})
export class ScheduleManagementModule { }
