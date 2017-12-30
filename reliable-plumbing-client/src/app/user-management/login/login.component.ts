import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertifyService, EnvironmentService, RouteHandlerService,
  NotificationService, AuthService, UserManagementService
} from '../../services/services.exports';
import { SocialMediaProvider } from '../../models/enums';

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
  SocialMediaProvider = SocialMediaProvider;
  showErrorMsg = false;
  errorMsg = 'Invalid email and/or password';

  constructor(
    private userManagementService: UserManagementService, private alertifyService: AlertifyService,
    private environmentService: EnvironmentService, private routeHandler: RouteHandlerService,
    private notificationService: NotificationService, private authService: AuthService
  ) { }

  userLogin(loginForm: any) {
    this.trySubmit = true;
    if (loginForm.valid) {
      this.userManagementService.login(this.userEmail, this.userPassword, this.rememberMe)
        .subscribe(result => {
          if (result) {
            this.notificationService.connectSockets();
            this.userLoggedIn.emit();
            this.alertifyService.success('login completed successfully');
            this.routeHandler.routeToDefault();
            this.showErrorMsg = false;
          }
          else {
            this.alertifyService.error(this.errorMsg);
          }
        },
        error => {
          this.showErrorMsg = true;
          this.alertifyService.error(this.errorMsg);
        });
    }
  }

  socialLogin(provider: SocialMediaProvider) {
    this.authService.redirectToSocialLogin(provider);

  }
}
