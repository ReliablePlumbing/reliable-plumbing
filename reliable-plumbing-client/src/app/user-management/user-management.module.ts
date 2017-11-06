import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { UserManagementRoutingModule } from './user-management-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// our modules
import { SharedModule } from '../shared/shared.module';
import { ServicesModule } from '../services/services.module';

// components
import { LoginComponent } from './login/login.component';
import { RegisterationComponent } from './registeration/registeration.component';
import { ActivateMailComponent } from './activate-mail/activate-mail.component';
import { SystemUsersManagementComponent } from './system-users-management/system-users-management.component';
import { SocialMediaRedirectComponent } from './social-media-redirect/social-media-redirect.component';

@NgModule({
  imports: [
    CommonModule, FormsModule, HttpModule, ReactiveFormsModule, ServicesModule, 
    UserManagementRoutingModule, NgbModule.forRoot(), SharedModule
  ],
  declarations: [LoginComponent, RegisterationComponent, ActivateMailComponent, SystemUsersManagementComponent, SocialMediaRedirectComponent],
  exports: [LoginComponent, RegisterationComponent]
})

export class UserManagementModule { }
