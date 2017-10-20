import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { UserManagementService } from '../services/user-management.service';
import { AlertifyService, EnvironmentService, RouteHandlerService, NotificationService } from '../../services/services.exports';

@Component({
  selector: 'rb-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  trySubmit = false;
  @Input() userEmail: string = null;
  userPassword: string;
  rememberMe: boolean = false;
  @Output() userLoggedIn: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private userManagementService: UserManagementService, private alertifyService: AlertifyService,
    private environmentService: EnvironmentService, private routeHandler: RouteHandlerService, private notificationService: NotificationService
  ) { }

  userLogin(loginForm: any) {
    this.trySubmit = true;
    if (loginForm.valid) {
      this.userManagementService.login(this.userEmail, this.userPassword, this.rememberMe)
        .subscribe(result => {
          // this.environmentService.currentUser = null;
          if (result) {
            this.notificationService.connectSockets();
            this.userLoggedIn.emit();
            // this.routeHandler.routeToDefault();
          }
          else
            this.alertifyService.printErrorMessage('Email or password is incorrect');
        },
        error => {
          this.alertifyService.printErrorMessage('Email or password is incorrect');
        });
    }
  }
}
