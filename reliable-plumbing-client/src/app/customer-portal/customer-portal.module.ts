import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerPortalRoutingModule } from './customer-portal-routing.module';

// modules
import { ServicesModule } from '../services/services.module';
import { SharedModule } from '../shared/shared.module';
import { UserManagementModule } from '../user-management/user-management.module';
import { CallsQuotesManagementModule } from '../calls-quotes-management/calls-quotes-management.module';

// components
import { CustomerPortalComponent } from './customer-portal.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { CallsHistoryComponent } from './calls-history/calls-history.component';
import { QuotesHistoryComponent } from './quotes-history/quotes-history.component';

@NgModule({
  imports: [
    CommonModule, CustomerPortalRoutingModule, ServicesModule, SharedModule, UserManagementModule, CallsQuotesManagementModule
  ],
  declarations: [CustomerPortalComponent, EditProfileComponent, ResetPasswordComponent, CallsHistoryComponent, QuotesHistoryComponent]
})
export class CustomerPortalModule { }
