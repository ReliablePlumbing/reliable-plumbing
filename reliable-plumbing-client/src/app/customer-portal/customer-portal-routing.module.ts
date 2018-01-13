import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { systemRoutes } from '../models/constants';
import { CustomerPortalComponent } from './customer-portal.component';
import { LoginAuthGuard } from '../services/services.exports';
import { Role, RegistrationMode } from '../models/enums';
import { CallsHistoryComponent } from './calls-history/calls-history.component';
import { QuotesHistoryComponent } from './quotes-history/quotes-history.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

const routes: Routes = [
  {
    path: systemRoutes.customerPortal, component: CustomerPortalComponent, canActivate: [LoginAuthGuard], data: { roles: [Role.Customer] },
    children: [
      { path: systemRoutes.callsHistory, component: CallsHistoryComponent, canActivate: [LoginAuthGuard] },
      { path: systemRoutes.quotesHistory, component: QuotesHistoryComponent, canActivate: [LoginAuthGuard] },
      { path: systemRoutes.myProfile, component: EditProfileComponent, canActivate: [LoginAuthGuard] },
      { path: systemRoutes.changePassword, component: ResetPasswordComponent, canActivate: [LoginAuthGuard] },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerPortalRoutingModule { }
