import { Component, OnInit } from '@angular/core';
import { EnvironmentService, RouteHandlerService } from '../services/services.exports';
import { Router, NavigationEnd } from '@angular/router';
import { Role } from '../models/enums';
import { systemRoutes } from '../models/constants';

@Component({
  selector: 'rb-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {

  currentSelectedTab = -1;

  registerMode;
  currentUser;
  tabs = {
    scheduleManagement: { index: 1, hasPermission: false },
    quoteManagement: { index: 2, hasPermission: false },
    settings: { index: 3, hasPermission: false },
    systemUsers: { index: 4, hasPermission: false },
    users: { index: 5, hasPermission: false },
    myAppointments: { index: 6, hasPermission: false },
    tracking: { index: 7, hasPermission: false },
    profile: { index: 8, hasPermission: true },
    changePassword: { index: 9, hasPermission: true },
  }
  systemRoutes = systemRoutes;

  constructor(private environmentService: EnvironmentService, private router: Router, private routeHandlerService: RouteHandlerService) { }

  ngOnInit() {
    this.currentUser = this.environmentService.currentUser;
    this.constructTabsPermissions();
    this.subscribeToRouterEvents();
    this.setCurrentTabFromUrl(this.router.url);
  }



  constructTabsPermissions() {
    let roles = this.currentUser.roles;

    for (let role of roles) {
      if (role == Role.Customer) {
        this.router.navigate(['/']);
        return;
      }

      if (role == Role.Admin || role == Role.SystemAdmin) {
        this.tabs.settings.hasPermission = true;
        this.tabs.systemUsers.hasPermission = true;
        this.tabs.users.hasPermission = true;
      }
      if (role == Role.Admin || role == Role.SystemAdmin || role == Role.Supervisor) {
        this.tabs.scheduleManagement.hasPermission = true;
        this.tabs.quoteManagement.hasPermission = true;
        this.tabs.tracking.hasPermission = true;
      }
      if (role == Role.Technician)
        this.tabs.myAppointments.hasPermission = true;
    }

  }

  subscribeToRouterEvents() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd)
        this.setCurrentTabFromUrl(event.url);
    });
  }

  setCurrentTabFromUrl(url) {
    if (~url.indexOf(systemRoutes.scheduleManagement))
      this.currentSelectedTab = this.tabs.scheduleManagement.index;
    if (~url.indexOf(systemRoutes.quoteManagement))
      this.currentSelectedTab = this.tabs.quoteManagement.index;
    else if (~url.indexOf(systemRoutes.settings))
      this.currentSelectedTab = this.tabs.settings.index;
    else if (~url.indexOf(systemRoutes.systemUsers))
      this.currentSelectedTab = this.tabs.systemUsers.index;
    else if (~url.indexOf(systemRoutes.users))
      this.currentSelectedTab = this.tabs.users.index;
    else if (~url.indexOf(systemRoutes.myAppointments))
      this.currentSelectedTab = this.tabs.myAppointments.index;
    else if (~url.indexOf(systemRoutes.tracking))
      this.currentSelectedTab = this.tabs.tracking.index;
    else if (~url.indexOf(systemRoutes.editProfile))
      this.currentSelectedTab = this.tabs.profile.index;
    else if (~url.indexOf(systemRoutes.changePassword))
      this.currentSelectedTab = this.tabs.changePassword.index;
  }

  toggleNav() {
    document.getElementById("mySidenav").classList.toggle("opened");
    document.getElementById("main").classList.toggle("opened");
  }
}
