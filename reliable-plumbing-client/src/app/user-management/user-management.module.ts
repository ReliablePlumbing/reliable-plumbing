import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { UserManagementRoutingModule } from './user-management-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// providers
import { ProfileEventsService } from './registeration/profile-events.service';

// our modules
import { SharedModule } from '../shared/shared.module';
import { ServicesModule } from '../services/services.module';

// components
import { LoginComponent } from './login/login.component';
import { RegisterationComponent } from './registeration/registeration.component';
import { ActivateMailComponent } from './activate-mail/activate-mail.component';
import { SystemUsersManagementComponent } from './system-users-management/system-users-management.component';
import { SocialMediaRedirectComponent } from './social-media-redirect/social-media-redirect.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { DynamicFormComponent } from './registeration/dynamic-form/dynamic-form.component';
import { UsersManagementComponent } from './users-management/users-management.component';

@NgModule({
  imports: [
    CommonModule, FormsModule, HttpModule, ReactiveFormsModule, ServicesModule,
    UserManagementRoutingModule, NgbModule.forRoot(), SharedModule
  ],
  declarations: [LoginComponent, RegisterationComponent, ActivateMailComponent, SystemUsersManagementComponent, SocialMediaRedirectComponent, 
    ChangePasswordComponent, ForgotPasswordComponent, DynamicFormComponent, UsersManagementComponent],

  providers: [ProfileEventsService],
  
  exports: [LoginComponent, RegisterationComponent, ChangePasswordComponent]
})

export class UserManagementModule { }
