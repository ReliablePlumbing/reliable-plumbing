import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EnvironmentService, RouteHandlerService } from '../services/services.exports';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Role, RegistrationMode } from '../models/enums';

@Component({
  selector: 'rb-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {

  currentSelectedTab = 1;
  
  @ViewChild('registeration') registerationTemplate: ElementRef;
  registerModalRef: NgbModalRef;
  
  @ViewChild('changePassword') changePasswordTemplate: ElementRef;
  changePasswordModalRef: NgbModalRef;

  registerMode;
  currentUser;
  tabs = {
    scheduleManagement: {index: 1, hasPermission: false},
    settings: {index: 2, hasPermission: false},
    systemUsers: {index: 3, hasPermission: false},
    myAppointments: {index: 4, hasPermission: false},
    tracking: {index: 5, hasPermission: false},
  }
  constructor(private environmentService: EnvironmentService, private router: Router, private routeHandlerService: RouteHandlerService,
    private modalService: NgbModal) { }

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
        this.tabs.settings.hasPermission = true;
        this.tabs.systemUsers.hasPermission = true;
      }
      if (role == Role.Admin || role == Role.SystemAdmin || role == Role.Supervisor) {
        this.tabs.scheduleManagement.hasPermission = true;
        this.tabs.tracking.hasPermission = true;
      }
      if (role == Role.Technician)
        this.tabs.myAppointments.hasPermission = true;
    }

  }

  userRegistered(user) {
    this.registerModalRef.close();
  }

  openEditProfile() {
    this.registerMode = RegistrationMode.edit;
    this.registerModalRef = this.modalService.open(this.registerationTemplate, { size: 'lg' })
  }

  
  openChangePassword() {
    this.changePasswordModalRef = this.modalService.open(this.changePasswordTemplate);
  }

  passwordChanged() {
    this.changePasswordModalRef.close();
  }
}
