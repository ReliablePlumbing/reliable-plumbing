import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule }from '@angular/http';
import { UserManagementRoutingModule } from './user-management-routing.module';
// services
import { UserManagementService } from './services/user-management.service';
// components
import { LoginComponent } from './login/login.component';
import { RegisterationComponent } from './registeration/registeration.component';
import { ActivateMailComponent } from './activate-mail/activate-mail.component';

@NgModule({
  imports: [
    CommonModule, FormsModule, HttpModule, ReactiveFormsModule,
    UserManagementRoutingModule
  ],
  declarations: [LoginComponent, RegisterationComponent, ActivateMailComponent],
  providers: [UserManagementService]
})

export class UserManagementModule { }
