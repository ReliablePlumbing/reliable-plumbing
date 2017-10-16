import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { UserManagementService } from '../services/user-management.service';
import { NotificationService } from '../../services/notification.service';
import { EnvironmentService } from '../../services/environment.service';
import { RouteHandlerService } from '../../services/route-handler.service';

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
    private userManagementService: UserManagementService, private notificationService: NotificationService, private environmentService: EnvironmentService,
    private routeHandler: RouteHandlerService
  ) { }

  userLogin(loginForm: any) {
    this.trySubmit = true;
    if (loginForm.valid) {
      this.userManagementService.login(this.userEmail, this.userPassword, this.rememberMe)
        .subscribe(result => {
          // this.environmentService.currentUser = null;
          if (result) {
            this.userLoggedIn.emit();
            // this.routeHandler.routeToDefault();
          }
          else
            this.notificationService.printErrorMessage('Email or password is incorrect');
        },
        error => {
          this.notificationService.printErrorMessage('Email or password is incorrect');
        });
    }
  }
}
