import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterationComponent } from './registeration/registeration.component';
import { ActivateMailComponent } from './activate-mail/activate-mail.component';
import { SystemUsersManagementComponent } from './system-users-management/system-users-management.component';
import { LoginAuthGuard } from "../services/auth-guard.service";

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [LoginAuthGuard] },
  { path: 'register', component: RegisterationComponent, canActivate: [LoginAuthGuard] },
  { path: 'activate-mail', component: ActivateMailComponent },
  { path: 'system-users-management', component: SystemUsersManagementComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }
