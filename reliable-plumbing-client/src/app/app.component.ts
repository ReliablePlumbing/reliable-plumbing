import { Component, ViewChild, ElementRef } from '@angular/core';
import { NotificationService, SocketsService, EnvironmentService, RouteHandlerService } from './services/services.exports';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Role, RegistrationMode } from './models/enums';
import { systemRoutes } from './models/constants';

@Component({
  selector: 'rb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild('registeration') registerationTemplate: ElementRef;
  registerModalRef: NgbModalRef;

  @ViewChild('login') loginTemplate: ElementRef;
  loginModalRef: NgbModalRef;
  registeredUserEmail = null;

  @ViewChild('changePassword') changePasswordTemplate: ElementRef;
  changePasswordModalRef: NgbModalRef;

  isUserLoggedIn: boolean = false;
  currentUser = null;
  isSystemUser = false;
  registerMode;
  systemRoutes = systemRoutes;
  isControlPanel = false;

  constructor(private socketsSerivce: SocketsService, private notificationService: NotificationService, private router: Router,
    private modalService: NgbModal, private environmentService: EnvironmentService, private routeHandlerService: RouteHandlerService) { }

  ngOnInit() {
    this.notificationService.connectSockets();
    this.isUserLoggedIn = this.environmentService.isUserLoggedIn;
    this.currentUser = this.environmentService.currentUser;
    this.isSystemUser = this.isUserLoggedIn && this.environmentService.currentUser.roles.findIndex(x => x == Role.Customer) == -1;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd)
        this.isControlPanel = this.router.url.indexOf(systemRoutes.controlPanel) != -1;
    });
  }

  userRegistered(user) {
    this.registerModalRef.close();
    this.registeredUserEmail = user.email;
    if (!this.isUserLoggedIn)
      this.openLoginPopup();
  }

  userLoggedIn() {
    this.loginModalRef.close();
    this.isUserLoggedIn = this.environmentService.isUserLoggedIn;
    this.currentUser = this.environmentService.currentUser;
    this.isSystemUser = this.isUserLoggedIn && this.environmentService.currentUser.roles.findIndex(x => x == Role.Customer) == -1;
  }

  openRegisterPopup() {
    this.registerMode = RegistrationMode.signup;
    this.registerModalRef = this.modalService.open(this.registerationTemplate, { size: 'lg' })
  }

  openEditProfile() {
    this.registerMode = RegistrationMode.edit;
    this.registerModalRef = this.modalService.open(this.registerationTemplate, { size: 'lg' })
  }

  openLoginPopup() {
    this.loginModalRef = this.modalService.open(this.loginTemplate)
  }

  logout() {
    this.environmentService.destroyLoginInfo();
    this.isUserLoggedIn = this.environmentService.isUserLoggedIn;
    this.currentUser = this.environmentService.currentUser;
    this.isSystemUser = this.isUserLoggedIn && this.environmentService.currentUser.roles.findIndex(x => x == Role.Customer) == -1;
    this.router.navigate(['/']);
  }

  openChangePassword() {
    this.changePasswordModalRef = this.modalService.open(this.changePasswordTemplate);
  }

  passwordChanged() {
    this.changePasswordModalRef.close();
  }

  getDefaultPanelRoute() {
    return this.routeHandlerService.getDefaultRoute();
  }
}
