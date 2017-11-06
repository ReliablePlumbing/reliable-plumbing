import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginAuthGuard } from "../services/auth-guard.service";
import { Role } from '../models/enums';
import { AdminPanelComponent } from './admin-panel.component';
import { AppointmentSettingsomponent } from './appointment-settings/appointment-settings.component';
import { ScheduleManagementComponent } from './schedule-management/schedule-management.component';
import { SystemUsersManagementComponent } from '../user-management/system-users-management/system-users-management.component';
import { MyAppointmentsComponent } from './my-appointments/my-appointments.component';
import { TechniciansTrackingComponent } from './technicians-tracking/technicians-tracking.component';

const routes: Routes = [
  {
    path: 'admin-panel', component: AdminPanelComponent, canActivate: [LoginAuthGuard], data: { roles: [Role.Manager, Role.Technician] },
    children: [
      { path: '', component: ScheduleManagementComponent },
      { path: 'appointment-settings', component: AppointmentSettingsomponent, canActivate: [LoginAuthGuard], data: { roles: [Role.Manager] } },
      { path: 'system-users-management', component: SystemUsersManagementComponent, canActivate: [LoginAuthGuard], data: { roles: [Role.Manager] } },
      { path: 'my-appointments', component: MyAppointmentsComponent, canActivate: [LoginAuthGuard], data: { roles: [Role.Technician] } },
      { path: 'technicians-tracking', component: TechniciansTrackingComponent, canActivate: [LoginAuthGuard], data: { roles: [Role.Manager] } }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminPanelRoutingModule { }
