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
    path: 'control-panel', component: AdminPanelComponent, canActivate: [LoginAuthGuard], data: { roles: [Role.Supervisor, Role.Technician, Role.Admin, Role.SystemAdmin] },
    children: [
      { path: 'schedule-management', canActivate: [LoginAuthGuard], component: ScheduleManagementComponent, data: { roles: [Role.Admin, Role.SystemAdmin, Role.Technician] } },
      { path: 'appointment-settings', component: AppointmentSettingsomponent, canActivate: [LoginAuthGuard], data: { roles: [Role.Admin, Role.SystemAdmin] } },
      { path: 'system-users-management', component: SystemUsersManagementComponent, canActivate: [LoginAuthGuard], data: { roles: [Role.Admin, Role.SystemAdmin] } },
      { path: 'my-appointments', component: MyAppointmentsComponent, canActivate: [LoginAuthGuard], data: { roles: [Role.Technician] } },
      { path: 'technicians-tracking', component: TechniciansTrackingComponent, canActivate: [LoginAuthGuard], data: { roles: [Role.Supervisor, Role.Admin, Role.SystemAdmin] } }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminPanelRoutingModule { }
