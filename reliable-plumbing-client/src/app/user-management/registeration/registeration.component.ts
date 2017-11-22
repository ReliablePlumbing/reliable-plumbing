import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Role, RegistrationMode } from '../../models/enums';
import { Marker } from '../../models/marker';
import { AlertifyService, EnvironmentService, RouteHandlerService, UserManagementService } from '../../services/services.exports';

@Component({
  selector: 'rb-registeration',
  templateUrl: './registeration.component.html',
  styleUrls: ['./registeration.component.scss']
})
export class RegisterationComponent implements OnInit {

  @Input() mode: RegistrationMode = RegistrationMode.signup;
  controls: regControls[] = [];
  registerForm: FormGroup;
  registerBtnText = 'Register';
  disableEmailInput = false;
  showResetBtn = false;
  trySubmit: boolean = false;
  @Output() userAdded: EventEmitter<any> = new EventEmitter<any>();
  role = Role;
  registrationModes = RegistrationMode;
  isSystemAdmin = false;
  @Input() user: any = {
    password: null,
    confirmPassword: null,
    firstName: null,
    lastName: null,
    email: null,
    mobile: null,
    roles: [],
    address: {
      coords: {
        lat: null,
        lng: null
      },
      text: null
    }
  }
  mapMarker: Marker;
  mobileMaskOpts = {
    mask: ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
    guide: false,
    keepCharPositions: false,
    showMask: true,
    replceRegex: /\W/g
  };
  constructor(private fb: FormBuilder, private userManagementService: UserManagementService, private alertifyService: AlertifyService,
    private environmentService: EnvironmentService, private routeHandler: RouteHandlerService) { }

  ngOnInit() {
    if (this.mode == RegistrationMode.edit)
      this.mapLoggedInUser();
    else
      navigator.geolocation.getCurrentPosition(position => {
        this.mapMarker = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          draggable: true,
          label: null
        }
      });
    if (this.mode == RegistrationMode.completeProfile || this.mode == RegistrationMode.edit) {
      this.registerBtnText = 'Update';
      this.showResetBtn = false;
      this.disableEmailInput = true;
    }
    else if (this.mode == RegistrationMode.admin) {
      this.registerBtnText = 'Add';
      this.showResetBtn = true;
      this.disableEmailInput = false;
    }
    this.createForm();
  }

  createForm() {
    this.registerForm = this.fb.group({});
    this.controls = this.getModeControls();

    for (let control of this.controls) {
      switch (control) {
        case regControls.email:
          this.registerForm.addControl('email', new FormControl(null, [Validators.required, Validators.email]));
          break;
        case regControls.firstName:
          this.registerForm.addControl('firstName', new FormControl(null, [Validators.required]));
          break;
        case regControls.lastName:
          this.registerForm.addControl('lastName', new FormControl(null));
          break;
        case regControls.mobile:
          this.registerForm.addControl('mobile', new FormControl(null, [Validators.required, Validators.pattern(/^(\([0-9]{3}\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}$/)]));
          break;
        case regControls.password:
          this.registerForm.addControl('password', new FormControl(null, [Validators.required, Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])((?=.*?[0-9])|(?=.*?[#?!@$%^&*-])).{6,32}$/)]))
          this.registerForm.addControl('confirmPassword', new FormControl(null, [Validators.required, this.matchOtherValidator('password')]));
          break;
        case regControls.address:
          this.registerForm.addControl('address', new FormControl(null, [Validators.required]));
          break;
        case regControls.roles:
          let roles = this.environmentService.currentUser.roles;

          let rolesControls: any = { technician: [''], supervisor: [''] };
          this.isSystemAdmin = ~roles.indexOf(Role.SystemAdmin) != 0
          if (this.isSystemAdmin) {
            rolesControls.admin = [''];
            rolesControls.systemAdmin = [''];
          }

          let rolesFG = this.fb.group(rolesControls, {
            validator: (group: FormGroup) => {
              let controlNames = Object.getOwnPropertyNames(group.controls);
              return ~controlNames.findIndex(c => group.controls[c].value == true) ? null : { noRole: true };
            }
          });

          this.registerForm.addControl('roles', rolesFG);
          break;
      }
    }
    if (this.registerForm.controls['email'] != null && this.mode != RegistrationMode.completeProfile && this.mode != RegistrationMode.edit)
      this.registerForm.controls['email'].valueChanges.subscribe(x => {
        let control = this.registerForm.controls['email']
        let emailErrors = control.hasError('email') || control.hasError('required');
        if (emailErrors) return null;

        this.userManagementService.checkEmailExistence(this.user.email)
          .subscribe(exists => {
            if (!exists) return null;
            else
              control.setErrors({ emailExists: exists })
          });
      });
    else if (this.registerForm.controls['email'] != null)
      setTimeout(() => this.registerForm.controls['email'].disable(), 0);
  }

  matchOtherValidator(otherControlName: string) {

    let thisControl: FormControl;
    let otherControl: FormControl;

    return (control: FormControl) => {

      if (!control.parent) return null;

      if (!thisControl) {
        thisControl = control;
        otherControl = control.parent.get(otherControlName) as FormControl;
        if (!otherControl) throw new Error('matchOtherValidator(): other control is not found in parent group');
        otherControl.valueChanges.subscribe(() => { thisControl.updateValueAndValidity(); });
      }

      if (!otherControl) return null;

      if (otherControl.value !== thisControl.value)
        return { matchOther: true };

      return null;
    }
  }

  handleRolesChange(event) {
    let checked = event.target.checked;
    let value = parseInt(event.target.value);

    if (checked)
      this.user.roles.push(value);
    else
      this.user.roles = this.user.roles.filter(role => role != value);
  }

  userRegister() {
    this.trySubmit = true;
    if (this.registerForm.invalid)
      return;

    if (this.mode != RegistrationMode.admin && this.user.address != null && this.mapMarker != null)
      this.user.address.coords = {
        lat: this.mapMarker.lat,
        lng: this.mapMarker.lng
      };

    switch (this.mode) {
      case RegistrationMode.signup:
      case RegistrationMode.admin:
        this.userManagementService.register(this.user).subscribe(x => {
          this.user.password = this.user.confirmPassword = null;
          this.userAdded.emit(this.user)
        });
        break;
      case RegistrationMode.edit:
        this.userManagementService.updateProfile(this.user).subscribe(success => {
          if (success) {
            this.alertifyService.success('Profile updated successfully');
            let user: any = this.environmentService.currentUser;
            user.firstName = this.user.firstName;
            user.lastName = this.user.lastName;
            user.mobile = this.user.mobile;
            user.address = this.user.address;
            this.environmentService.updateCurrentUserInfo(user);
            this.user.password = this.user.confirmPassword = null;
            this.userAdded.emit(this.user)
          }
          else
            this.alertifyService.error('profile not updated, please try again');
        });
        break;
      case RegistrationMode.completeProfile:
        this.userAdded.emit(this.user)
        break;
      default:
        break;
    }
  }

  openLogin() {
    this.userAdded.emit({});
  }

  getControlValidation(controlName, errorName, beforeSubmit = true) {
    if (this.registerForm == null)
      return false;

    let control = this.registerForm.controls[controlName];

    return (beforeSubmit || this.trySubmit) && !control.valid && control.errors && control.errors[errorName];
  }

  resetForm() {
    this.user = {
      password: null,
      confirmPassword: null,
      firstName: null,
      lastName: null,
      email: null,
      mobile: null,
      roles: [Role.Technician],
      address: {
        coords: {
          lat: null,
          lng: null
        },
        text: null
      }
    };
    this.trySubmit = false;
  }

  markerDragEnd(m, $event) {
    this.mapMarker.lat = $event.coords.lat;
    this.mapMarker.lng = $event.coords.lng;
  }

  mapLoggedInUser() {
    let currentUser: any = this.environmentService.currentUser;

    this.user = {
      email: currentUser.email,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      mobile: currentUser.mobile,
      address: currentUser.address,
    };

    if (this.user.address != null)
      this.mapMarker = {
        lat: this.user.address.coords.lat,
        lng: this.user.address.coords.lng,
        draggable: true,
        label: null
      }
    else {
      this.user.address = {
        coords: {
          lat: null,
          lng: null
        },
        text: null
      }
      navigator.geolocation.getCurrentPosition(position => {
        this.mapMarker = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          draggable: true,
          label: null
        }
      });
    }
  }

  getModeControls() {
    let controls: regControls[] = [];
    switch (this.mode) {
      case RegistrationMode.admin:
        controls = [
          regControls.firstName, regControls.lastName,
          regControls.email, regControls.roles
        ]
        break;
      case RegistrationMode.completeProfile:
        controls = [
          regControls.firstName, regControls.lastName,
          regControls.email, regControls.mobile,
          regControls.password
        ]
        break;
      case RegistrationMode.edit:
        controls = [
          regControls.firstName, regControls.lastName,
          regControls.email, regControls.mobile
        ]
        break;
      case RegistrationMode.signup:
        controls = [
          regControls.firstName, regControls.lastName,
          regControls.email, regControls.mobile,
          regControls.password
        ]
        break;
    }

    return controls;
  }

  regControls = regControls;

  resendActivationLink() {
    let user: any = this.environmentService.currentUser;
    this.userManagementService.resendActivationLink(user.email).subscribe(success => {
      if (success)
        this.alertifyService.success('activation link sent to your mail');
      else
        this.alertifyService.success('try again');
    })
  }
}


export enum regControls {
  email = 1,
  mobile,
  firstName,
  lastName,
  password,
  roles,
  address
}