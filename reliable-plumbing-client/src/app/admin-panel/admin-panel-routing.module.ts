import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { systemRoutes } from '../models/constants';
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
    path: systemRoutes.controlPanel, component: AdminPanelComponent, canActivate: [LoginAuthGuard], data: { roles: [Role.Supervisor, Role.Technician, Role.Admin, Role.SystemAdmin] },
    children: [
      { path: systemRoutes.scheduleManagement, canActivate: [LoginAuthGuard], component: ScheduleManagementComponent, data: { roles: [Role.Admin, Role.SystemAdmin, Role.Supervisor] } },
      { path: systemRoutes.settings, component: AppointmentSettingsomponent, canActivate: [LoginAuthGuard], data: { roles: [Role.Admin, Role.SystemAdmin] } },
      { path: systemRoutes.systemUsers, component: SystemUsersManagementComponent, canActivate: [LoginAuthGuard], data: { roles: [Role.Admin, Role.SystemAdmin] } },
      { path: systemRoutes.myAppointments, component: MyAppointmentsComponent, canActivate: [LoginAuthGuard], data: { roles: [Role.Technician] } },
      { path: systemRoutes.tracking, component: TechniciansTrackingComponent, canActivate: [LoginAuthGuard], data: { roles: [Role.Supervisor, Role.Admin, Role.SystemAdmin] } }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminPanelRoutingModule { }
