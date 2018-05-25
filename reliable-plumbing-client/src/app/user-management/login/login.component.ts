import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertifyService, EnvironmentService, RouteHandlerService,
  NotificationService, AuthService, UserManagementService, EventsService
} from '../../services/services.exports';
import { SocialMediaProvider } from '../../models/enums';
import { systemRoutes } from '../../models/constants';

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
  @Output() modalTitle: EventEmitter<any> = new EventEmitter<any>();
  @Output() close: EventEmitter<any> = new EventEmitter<any>();
  SocialMediaProvider = SocialMediaProvider;
  showErrorMsg = false;
  errorMsg = 'Invalid email and/or password';
  forgotPassword = false;
  showInfoMsg = false;
  infoMsg;
  email;
  loading = false;
  systemRoutes = systemRoutes;

  constructor(
    private userManagementService: UserManagementService, private alertifyService: AlertifyService,
    private environmentService: EnvironmentService, private routeHandler: RouteHandlerService, private router: Router,
    private notificationService: NotificationService, private authService: AuthService, private eventsService: EventsService
  ) { }

  ngOnInit() {
    this.modalTitle.emit('Login');
  }

  userLogin(loginForm: any) {
    this.trySubmit = true;
    if (loginForm.valid) {
      this.loading = true;
      this.userManagementService.login(this.userEmail, this.userPassword, this.rememberMe)
        .subscribe(result => {
          if (result) {
            this.notificationService.connectSockets();
            this.eventsService.login();
            this.alertifyService.success('login completed successfully');
            this.routeHandler.routeToDefault();
            this.showErrorMsg = false;
          }
          else {
            this.alertifyService.error(this.errorMsg);
          }
          this.loading = false;
        },
          error => {
            this.showErrorMsg = true;
            this.alertifyService.error(this.errorMsg);
            this.loading = false;
          });
    }
  }

  socialLogin(provider: SocialMediaProvider) {
    this.authService.redirectToSocialLogin(provider);

  }

  openForgotPassword() {
    this.forgotPassword = true;
    this.trySubmit = false;
    this.modalTitle.emit('Forgot Your Password?');
  }
  
  backToLogin() {
    this.trySubmit = false;
    this.forgotPassword = false;
    this.modalTitle.emit('Login');

  }

  resetPassword() {
    this.trySubmit = true;
    if (this.email) {
      this.loading = true;
      this.userManagementService.forgotPassword(this.email).subscribe(result => {
        if (result) {
          this.infoMsg = 'Please check your email to reset your password.';
          this.showInfoMsg = true;
          this.trySubmit = false;
          this.loading = false;
        }
        else
          this.alertifyService.error('Email doesn\'t exist');

      })
    }
  }

  goToRegister(){
    this.router.navigate([systemRoutes.register]);
    this.close.emit();
  }
}
