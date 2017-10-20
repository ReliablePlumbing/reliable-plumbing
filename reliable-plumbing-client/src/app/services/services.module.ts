import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpExtensionService } from './http-extension.service';
import { EnvironmentService } from './environment.service';
import { ExceptionHandlingService } from './exception-handling.service';
import { AlertifyService } from './alertify.service';
import { RouteHandlerService } from './route-handler.service';
import { AuthGuard, LoginAuthGuard } from './auth-guard.service';
import { LookupsService } from './lookups.service';
import { AppointmentService } from './appointment.service';
import { NotificationService } from './notification.service';
import { SocketsService } from './sockets.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [HttpExtensionService, EnvironmentService, ExceptionHandlingService, AlertifyService, RouteHandlerService,
    AuthGuard, LoginAuthGuard, LookupsService, AppointmentService, NotificationService, SocketsService
  ]
})
export class ServicesModule { }
