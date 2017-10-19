import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpExtensionService } from './http-extension.service';
import { EnvironmentService } from './environment.service';
import { ExceptionHandlingService } from './exception-handling.service';
import { NotificationService } from './notification.service';
import { RouteHandlerService } from './route-handler.service';
import { AuthGuard, LoginAuthGuard } from './auth-guard.service';
import { LookupsService } from './lookups.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [HttpExtensionService, EnvironmentService, ExceptionHandlingService, NotificationService, RouteHandlerService, AuthGuard, LoginAuthGuard, LookupsService]
})
export class ServicesModule { }
