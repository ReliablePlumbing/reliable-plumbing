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
  registerForm: FormGroup;
  trySubmit: boolean = false;
  @Output() userAdded: EventEmitter<any> = new EventEmitter<any>();
  role = Role;
  registrationModes = RegistrationMode;
  @Input() user = {
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

  constructor(private fb: FormBuilder, private userManagementService: UserManagementService, private alertifyService: AlertifyService,
    private environmentService: EnvironmentService, private routeHandler: RouteHandlerService) { }

  ngOnInit() {
    this.createForm();
    navigator.geolocation.getCurrentPosition(position => {
      this.mapMarker = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        draggable: true,
        label: null
      }
    });
  }

  // todo: get regex for USA mobile
  createForm() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      //   password: ['', [Validators.required, Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')]],
      //    confirmPassword: ['', [Validators.required, this.matchOtherValidator('password')]],
      firstName: ['', Validators.required],
      lastName: [''],
      mobile: ['', Validators.required],//, Validators.pattern('^(\([0-9]{3}\)|[0-9]{3}-)[0-9]{3}-[0-9]{4}$')],
    });

    if (this.mode == RegistrationMode.admin) {
      this.registerForm.addControl('roles', this.fb.group({ technician: [''], admin: [''] }, {
        validator: (group: FormGroup) => {
          return (group.controls.technician.value == true || group.controls.technician.value == true) ? null : { noRole: true };
        }
      }));
    }
    else {
      this.registerForm.addControl('password', new FormControl(null, [Validators.required, Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')]))
      this.registerForm.addControl('confirmPassword', new FormControl(null, [Validators.required, this.matchOtherValidator('password')]));
      this.registerForm.addControl('address', new FormControl(null, [Validators.required]));

    }

    if (this.mode != RegistrationMode.completeProfile)
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
      })
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

    this.user.address.coords = {
      lat: this.mapMarker.lat,
      lng: this.mapMarker.lng
    };
    
    if (this.mode != RegistrationMode.completeProfile)
      this.userManagementService.register(this.user).subscribe(x => {

        this.user.password = this.user.confirmPassword = null;
        this.userAdded.emit(this.user)
      })
    else
      this.userAdded.emit(this.user)
  }

  openLogin() {
    this.userAdded.emit({});
  }

  getControlValidation(controlName, errorName, beforeSubmit = true) {
    if (this.registerForm == null)
      return false;

    let control = this.registerForm.controls[controlName];

    return (beforeSubmit || this.trySubmit) && !control.valid && control.errors[errorName];
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
}
