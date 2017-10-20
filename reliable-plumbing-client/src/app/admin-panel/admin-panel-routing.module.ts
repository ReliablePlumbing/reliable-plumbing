import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginAuthGuard } from "../services/auth-guard.service";
import { Role } from '../models/enums';
import { AdminPanelComponent } from './admin-panel.component';
import { AppointmentTypesManagementComponent } from './appointment-types-management/appointment-types-management.component';
import { ScheduleManagementComponent } from './schedule-management/schedule-management.component';
import { SystemUsersManagementComponent } from '../user-management/system-users-management/system-users-management.component';

const routes: Routes = [
  {
    path: 'admin-panel', component: AdminPanelComponent, canActivate: [LoginAuthGuard], data: { roles: [Role.Admin] },
    children: [
      { path: '', component: ScheduleManagementComponent },
      { path: 'appointment-types', component: AppointmentTypesManagementComponent },
      { path: 'system-users-management', component: SystemUsersManagementComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminPanelRoutingModule { }
