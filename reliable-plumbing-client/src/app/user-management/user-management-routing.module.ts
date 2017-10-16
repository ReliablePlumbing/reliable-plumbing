import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterationComponent } from './registeration/registeration.component';
import { ActivateMailComponent } from './activate-mail/activate-mail.component';
import { SystemUsersManagementComponent } from './system-users-management/system-users-management.component';
import { LoginAuthGuard } from "../services/auth-guard.service";
import { Role } from '../models/enums';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterationComponent },
  { path: 'activate-mail', component: ActivateMailComponent },
  { path: 'system-users-management', component: SystemUsersManagementComponent, canActivate: [LoginAuthGuard], data: { roles: [Role.Admin] } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }
