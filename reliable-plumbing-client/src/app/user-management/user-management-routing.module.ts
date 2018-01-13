import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterationComponent } from './registeration/registeration.component';
import { ActivateMailComponent } from './activate-mail/activate-mail.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { SystemUsersManagementComponent } from './system-users-management/system-users-management.component';
import { LoginAuthGuard } from "../services/auth-guard.service";
import { Role, RegistrationMode } from '../models/enums';
import { SocialMediaRedirectComponent } from './social-media-redirect/social-media-redirect.component';
import { systemRoutes } from '../models/constants';

const routes: Routes = [
  { path: systemRoutes.activateMail, component: ActivateMailComponent },
  { path: systemRoutes.socialMediaAuthenticate, component: SocialMediaRedirectComponent },
  { path: systemRoutes.register, component: RegisterationComponent, data: { mode: RegistrationMode.signup} },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }
