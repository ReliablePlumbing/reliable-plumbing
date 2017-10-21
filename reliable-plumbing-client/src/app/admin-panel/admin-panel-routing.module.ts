import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginAuthGuard } from "../services/auth-guard.service";
import { Role } from '../models/enums';
import { AdminPanelComponent } from './admin-panel.component';
import { AppointmentSettingsomponent } from './appointment-settings/appointment-settings.component';
import { ScheduleManagementComponent } from './schedule-management/schedule-management.component';
import { SystemUsersManagementComponent } from '../user-management/system-users-management/system-users-management.component';

const routes: Routes = [
  {
    path: 'admin-panel', component: AdminPanelComponent, canActivate: [LoginAuthGuard], data: { roles: [Role.Manager] },
    children: [
      { path: '', component: ScheduleManagementComponent },
      { path: 'appointment-settings', component: AppointmentSettingsomponent },
      { path: 'system-users-management', component: SystemUsersManagementComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminPanelRoutingModule { }
