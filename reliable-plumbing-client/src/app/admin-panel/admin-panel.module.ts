import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'ng2-select';

// our modules
import { ServicesModule } from '../services/services.module';
import { UserManagementModule } from '../user-management/user-management.module';
import { SharedModule }from '../shared/shared.module';
import { AppointmentManagementModule } from '../appointment-management/appointment-management.module';

// components
import { AdminPanelRoutingModule } from './admin-panel-routing.module';
import { AppointmentSettingsomponent } from './appointment-settings/appointment-settings.component';
import { AdminPanelComponent } from './admin-panel.component';
import { ScheduleManagementComponent } from './schedule-management/schedule-management.component';
import { MyAppointmentsComponent } from './my-appointments/my-appointments.component';

@NgModule({
  imports: [
    CommonModule, AdminPanelRoutingModule, ServicesModule, NgbModule, FormsModule, UserManagementModule, 
    SharedModule, SelectModule, AppointmentManagementModule, ReactiveFormsModule
  ],
  declarations: [AppointmentSettingsomponent, AdminPanelComponent, ScheduleManagementComponent, MyAppointmentsComponent]
})
export class AdminPanelModule { }
