import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { UserManagementService } from '../services/user-management.service';
import { NotificationService } from '../../services/notification.service';
import { EnvironmentService } from '../../services/environment.service';
import { RouteHandlerService } from '../../services/route-handler.service';
import { Role, RegistrationMode } from '../../models/enums';

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
    roles: []
  }
  constructor(private fb: FormBuilder, private userManagementService: UserManagementService, private notificationService: NotificationService,
    private environmentService: EnvironmentService, private routeHandler: RouteHandlerService) { }

  ngOnInit() {
    this.createForm();
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

    if (this.mode != RegistrationMode.completeProfile)
      this.userManagementService.register(this.user).subscribe(x => {

        this.user.password = this.user.confirmPassword = null;
        this.userAdded.emit(this.user)
      })
    else
      this.userAdded.emit(this.user)
  }

  openLogin(){
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
      roles: [Role.Technician]
    };
    this.trySubmit = false;
  }
}
