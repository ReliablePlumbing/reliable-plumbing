import { Component, OnInit } from '@angular/core';
import { EnvironmentService, RouteHandlerService } from '../services/services.exports';
import { Router } from '@angular/router';
import { Role } from '../models/enums';

@Component({
  selector: 'rb-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {

  currentUser;
  tabsPremssions = {
    scheduleManagement: false,
    settings: false,
    systemUsers: false,
    myAppointments: false,
    tracking: false,
  }
  constructor(private environmentService: EnvironmentService, private router: Router, private routeHandlerService: RouteHandlerService) { }

  ngOnInit() {
    this.currentUser = this.environmentService.currentUser;
    this.routeHandlerService.routeToDefault();
    this.constructTabsPermissions();
  }

  logout() {
    this.environmentService.destroyLoginInfo();
    // this.currentUser = this.environmentService.currentUser;
    this.router.navigate(['/']);
  }

  constructTabsPermissions() {
    let roles = this.currentUser.roles;

    for (let role of roles) {
      if (role == Role.Customer)
        this.router.navigate(['/']);
      if (role == Role.Admin || role == Role.SystemAdmin) {
        this.tabsPremssions.settings = true;
        this.tabsPremssions.systemUsers = true;
      }
      if (role == Role.Admin || role == Role.SystemAdmin || role == Role.Supervisor) {
        this.tabsPremssions.scheduleManagement = true;
        this.tabsPremssions.tracking = true;
      }
      if(role == Role.Technician)
        this.tabsPremssions.myAppointments = true;
    }

  }
}
