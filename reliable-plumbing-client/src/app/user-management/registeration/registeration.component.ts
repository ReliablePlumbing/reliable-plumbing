import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Role, RegistrationMode, regControls } from '../../models/enums';
import { Marker } from '../../models/marker';
import { AlertifyService, EnvironmentService, RouteHandlerService, UserManagementService } from '../../services/services.exports';
import { ProfileEventsService } from './profile-events.service';
import { isSystemUser } from '../../utils/user-helpers';

@Component({
  selector: 'rb-registeration',
  templateUrl: './registeration.component.html',
  styleUrls: ['./registeration.component.scss']
})
export class RegisterationComponent implements OnInit {

  @Input() mode: RegistrationMode;
  @Input() user = null;
  @Output() userAdded: EventEmitter<any> = new EventEmitter<any>();
  userId: any;
  basicInfoControls;
  steps = [
    { label: 'Basic Info' },
    { label: 'Sites (Addresses)' }
  ];
  activeIndex = 0;
  subscription;
  isValid = true;
  actionType: actionType;
  showSteps = false;

  constructor(private fb: FormBuilder, private userManagementService: UserManagementService, private alertifyService: AlertifyService,
    private environmentService: EnvironmentService, private routeHandler: RouteHandlerService, private activatedRoute: ActivatedRoute,
    private profileEventsService: ProfileEventsService) { }

  ngOnInit() {
    this.subsciptionToForms();
    this.userId = this.activatedRoute.snapshot.params['userId'];
    if (this.mode == null)
      this.mode = this.activatedRoute.snapshot.data.mode;

    this.initUser();
  }

  initUser() {
    switch (this.mode) {
      case RegistrationMode.addSystemUser:
      case RegistrationMode.editSystemUser:
        // user comes from input
        this.mapUser(this.user);
        this.basicInfoControls = this.getModeControls();
        break;
      case RegistrationMode.completeProfile:
        // the user is an input
        this.mapUser(this.user);
        this.basicInfoControls = this.getModeControls();
        break;
      case RegistrationMode.edit:
        if (this.userId)
          this.getUserById(this.userId);
        else
          this.mapUser(this.environmentService.currentUser)
        break;
      case RegistrationMode.signup:
        this.showSteps = true;
        this.user = { sites: [], site: {} };
        this.basicInfoControls = this.getModeControls();

        break;
    }

  }

  getUserById(userId) {
    this.userManagementService.getUserById(userId).subscribe(result => {
      if (result)
        this.user = result;

      this.showSteps = !isSystemUser(this.user);
      this.basicInfoControls = this.getModeControls();
    });
  }


  mapUser(user) {
    if (user) {
      this.user = {
        id: user.id,
        email: user.email,
        accountType: user.accountType,
        firstName: user.firstName,
        lastName: user.lastName,
        mobile: user.mobile,
        roles: user.roles,
        site: user.sites,
      };
      this.showSteps = !isSystemUser(this.user);
      if (this.showSteps) {
        if (this.user.site && this.user.sites.length > 0) {
          this.user.site = this.user.sites[0];
          this.user.site.index = 0;
        }
        else {
          this.user.site;
          this.user.sites = [];
        }
      }
    }
    else
      this.user = { sites: [], roles: [], site: {} }

    this.basicInfoControls = this.getModeControls();
  }

  getModeControls() {
    let controls: any = [];
    switch (this.mode) {
      case RegistrationMode.addSystemUser:
        let editableEmail = true;
      case RegistrationMode.editSystemUser:
        this.showSteps = false;
        controls = [
          { type: regControls.firstName },
          { type: regControls.lastName },
          { type: regControls.email, editable: editableEmail },
          { type: regControls.mobile },
          { type: regControls.roles, roles: this.getAllowedRoles() },
        ]
        break;
      case RegistrationMode.completeProfile:
        controls = [
          { type: regControls.firstName },
          { type: regControls.lastName },
          { type: regControls.email, editable: false },
          { type: regControls.mobile },
          { type: regControls.password },
        ]
        break;
      case RegistrationMode.edit:
        controls = [];
        if (!isSystemUser(this.user))
          controls.push({ type: regControls.accountType });
        controls.push({ type: regControls.firstName });
        controls.push({ type: regControls.lastName });
        controls.push({ type: regControls.email, editable: false });
        controls.push({ type: regControls.mobile });

        break;
      case RegistrationMode.signup:
        this.showSteps = true;
        controls = [
          { type: regControls.accountType },
          { type: regControls.firstName },
          { type: regControls.lastName },
          { type: regControls.email, editable: true },
          { type: regControls.mobile }, // address will be added in other section
          { type: regControls.password }
        ]
        break;
    }

    return controls;
  }

  getAllowedRoles() {

    let currentUserRoles = this.environmentService.currentUser.roles;

    let allowedRoles: any = [
      { role: Role.Technician, text: 'Technician' },
      { role: Role.Supervisor, text: 'Supervisor' }
    ];
    let isSystemAdmin = ~currentUserRoles.indexOf(Role.SystemAdmin) != 0
    if (isSystemAdmin) {
      allowedRoles.push({ role: Role.Admin, text: 'Admin' });
      allowedRoles.push({ role: Role.SystemAdmin, text: 'System Admin' });
    }

    return allowedRoles;
  }

  addUserSite() {
    this.actionType = actionType.addSite;
    this.profileEventsService.isFormValid();
  }

  initNewSite = () => this.user.site = {};

  editSite(index) {
    this.user.site = this.user.sites[index];
    this.user.site.index = index;
  }

  deleteSite(index) {
    this.alertifyService.confirmDialog('Are you sure you want to remove this site', () => {
      let sites = [];
      for (let i = 0; i < this.user.sites.length; i++) {
        if (i != index)
          sites.push(this.user.sites[i]);
      }

      this.user.sites = sites;
      this.user.site = {};
    });
  }

  nextStep() {
    this.actionType = actionType.nextStep;
    this.profileEventsService.isFormValid();
  }

  save() {
    this.actionType = actionType.save;
    this.profileEventsService.isFormValid();
  }

  subsciptionToForms() {
    this.subscription = this.profileEventsService.validateFormResponse.subscribe(isValid => {
      this.isValid = isValid;
      if (isValid) {
        switch (this.actionType) {
          case actionType.addSite:
            let site = this.user.site;
            if (site.index)
              this.user.sites[site.index] = site;
            else
              this.user.sites.push(site);
            this.user.site = {};
            break;
          case actionType.nextStep:
            this.isValid = true;
            this.activeIndex = 1;
            break;
          case actionType.save:
            this.addEditUser();
            break;
        }
      }


    });
  }

  addEditUser() {
    switch (this.mode) {
      case RegistrationMode.addSystemUser:
      case RegistrationMode.signup:
        this.userManagementService.register(this.user).subscribe(x => {
          if (x) {
            this.alertifyService.success('Save Completed Successfully');
            this.userAdded.emit(this.user);
          }
        });
        break;
      case RegistrationMode.editSystemUser:
      case RegistrationMode.edit:
        this.userManagementService.updateProfile(this.user).subscribe(user => {
          if (user) {
            this.alertifyService.success('Profile updated successfully');
            this.userAdded.emit(user);
          }
          else
            this.alertifyService.error('profile not updated, please try again');
        });
        break;
      case RegistrationMode.completeProfile:
        this.userAdded.emit(this.user);

        break;
    }
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }
}

export enum actionType {
  addSite,
  nextStep,
  save
}

