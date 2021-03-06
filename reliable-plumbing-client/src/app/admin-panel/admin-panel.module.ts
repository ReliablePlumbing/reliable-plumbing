import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'ng2-select';

// our modules
import { ServicesModule } from '../services/services.module';
import { UserManagementModule } from '../user-management/user-management.module';
import { SharedModule } from '../shared/shared.module';
import { CallsQuotesManagementModule } from '../calls-quotes-management/calls-quotes-management.module';
import { DashboardsModule } from '../dashboards/dashboards.module';

// components
import { AdminPanelRoutingModule } from './admin-panel-routing.module';
import { AppointmentSettingsomponent } from './appointment-settings/appointment-settings.component';
import { AdminPanelComponent } from './admin-panel.component';
import { MyAppointmentsComponent } from './my-appointments/my-appointments.component';
import { TechniciansTrackingComponent } from './technicians-tracking/technicians-tracking.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { QuoteManagementComponent } from './quote-management/quote-management.component';
import { DashboardsComponent } from './dashboards/dashboards.component';
import { CallManagementComponent } from './call-management/call-management.component';
@NgModule({
  imports: [
    CommonModule, AdminPanelRoutingModule, ServicesModule, FormsModule, UserManagementModule,
    SharedModule, SelectModule, CallsQuotesManagementModule, ReactiveFormsModule, DashboardsModule
  ],
  declarations: [
    AppointmentSettingsomponent, AdminPanelComponent, MyAppointmentsComponent, TechniciansTrackingComponent, EditProfileComponent, ResetPasswordComponent, QuoteManagementComponent, DashboardsComponent, CallManagementComponent
  ]
})
export class AdminPanelModule { }
