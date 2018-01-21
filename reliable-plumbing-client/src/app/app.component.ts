import { Component, ViewChild, ElementRef } from '@angular/core';
import { NotificationService, SocketsService, EnvironmentService, RouteHandlerService, NavEventsService } from './services/services.exports';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { NgbModal, NgbModalRef, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Role, RegistrationMode } from './models/enums';
import { systemRoutes } from './models/constants';

@Component({
  selector: 'rb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild('login') loginTemplate: ElementRef;
  loginModalRef: NgbModalRef;
  @ViewChild('p') notificationsPopover: NgbPopover;

  registeredUserEmail = null;
  isUserLoggedIn: boolean = false;
  currentUser = null;
  isSystemUser = false;
  registerMode;
  systemRoutes = systemRoutes;
  isControlPanel = false;
  isCustomerPortal = false;

  constructor(private socketsSerivce: SocketsService, private notificationService: NotificationService, private router: Router,
    private modalService: NgbModal, private environmentService: EnvironmentService, private routeHandlerService: RouteHandlerService,
    private navEventsSevice: NavEventsService) { }

  ngOnInit() {
    this.notificationService.connectSockets();
    this.isUserLoggedIn = this.environmentService.isUserLoggedIn;
    this.currentUser = this.environmentService.currentUser;
    this.isSystemUser = this.isUserLoggedIn && this.environmentService.currentUser.roles.findIndex(x => x == Role.Customer) == -1;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd)
        this.isControlPanel = this.router.url.indexOf(systemRoutes.controlPanel) != -1;
      if (!this.isControlPanel)
        this.isCustomerPortal = this.router.url.indexOf(systemRoutes.customerPortal) != -1;
    });

    // for closing the navbar when any item is clicked
    $(document).ready(function () {
      $(".navbar-nav li a").click(function (event) {
        $(".navbar-collapse").collapse('hide');
      });
    });
  }


  userLoggedIn() {
    this.loginModalRef.close();
    this.isUserLoggedIn = this.environmentService.isUserLoggedIn;
    this.currentUser = this.environmentService.currentUser;
    this.isSystemUser = this.isUserLoggedIn && this.environmentService.currentUser.roles.findIndex(x => x == Role.Customer) == -1;
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

  getDefaultPanelRoute() {
    return this.routeHandlerService.getDefaultRoute();
  }

  closeNotifications = () => this.notificationsPopover.close();

  toggleNavigations() {
    this.navEventsSevice.navCicked();
  }
}
