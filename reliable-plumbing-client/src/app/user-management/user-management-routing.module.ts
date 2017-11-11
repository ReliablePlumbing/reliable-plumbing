import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterationComponent } from './registeration/registeration.component';
import { ActivateMailComponent } from './activate-mail/activate-mail.component';
import { SystemUsersManagementComponent } from './system-users-management/system-users-management.component';
import { LoginAuthGuard } from "../services/auth-guard.service";
import { Role } from '../models/enums';
import { SocialMediaRedirectComponent } from './social-media-redirect/social-media-redirect.component';

const routes: Routes = [
  { path: 'activate-mail', component: ActivateMailComponent },
  { path: 'social-media-authenticate', component: SocialMediaRedirectComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }
