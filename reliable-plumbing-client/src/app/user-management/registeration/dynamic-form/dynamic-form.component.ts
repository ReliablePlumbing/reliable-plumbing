import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Role, RegistrationMode, regControls } from '../../../models/enums';
import { Marker } from '../../../models/marker';
import { AlertifyService, EnvironmentService, RouteHandlerService, UserManagementService } from '../../../services/services.exports';
import { ProfileEventsService } from '../profile-events.service';

@Component({
  selector: 'dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {

  @Input() controlsCofig = [];
  @Input() user: any;

  registerForm: FormGroup;
  trySubmit: boolean = false;
  roleEnum = Role;
  mapMarker: Marker;
  mobileMaskOpts = {
    mask: ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
    guide: false,
    keepCharPositions: false,
    showMask: true,
    replceRegex: /\W/g
  };
  userRoles = {};
  subscriptions = [];

  constructor(private fb: FormBuilder, private userManagementService: UserManagementService, private alertifyService: AlertifyService,
    private environmentService: EnvironmentService, private routeHandler: RouteHandlerService, private profileEventsService: ProfileEventsService) { }

  ngOnInit() {

    let subscription1 = this.profileEventsService.validateForm.subscribe(_ => {
      this.trySubmit = true;
      if (~this.controlsCofig.findIndex(c => c.type == regControls.address))
        this.user.site.coords = this.mapMarker ? {
          lat: this.mapMarker.lat,
          lng: this.mapMarker.lng
        } : {};
      this.profileEventsService.isFormValidResponse(this.registerForm.valid);
    });

    let subscription2 = this.profileEventsService.resetForm$.subscribe(allFormValidations => {
      if (allFormValidations)
        this.registerForm.reset();

      this.trySubmit = false;
    });

    this.subscriptions.push(subscription1, subscription2);
    this.mapSite();
    this.mapUserRoles();
    this.createForm();
  }

  mapSite() {
    if (~this.controlsCofig.findIndex(c => c.type == regControls.address)) {
      let site = this.user.site;
      this.user.site.state = 'California';
      if (site && site.coords)
        this.mapMarker = {
          lat: site.coords.lat,
          lng: site.coords.lng,
          draggable: true,
          label: null
        }
      else
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

  createForm() {
    this.registerForm = this.fb.group({});

    for (let control of this.controlsCofig) {
      switch (control.type) {
        case regControls.email:
          this.registerForm.addControl('email', new FormControl(null, [Validators.required, Validators.email]));
          if (control.editable)
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
          else
            setTimeout(() => this.registerForm.controls['email'].disable(), 0);
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
          this.registerForm.addControl('streetAddress', new FormControl(null, [Validators.required]));
          this.registerForm.addControl('city', new FormControl(null, [Validators.required]));
          this.registerForm.addControl('state', new FormControl(null, [Validators.required]));
          this.registerForm.addControl('zipCode', new FormControl(null, [Validators.required]));

          this.registerForm.controls['state'].disable();
          break;
        case regControls.roles:
          let roles = control.roles;

          let rolesControls: any = {};
          for (let roleConfig of control.roles)
            rolesControls[Role[roleConfig.role]] = [null];

          let rolesFG = this.fb.group(rolesControls, {
            validator: (group: FormGroup) => {
              return this.user.roles && this.user.roles.length > 0 ? null : { noRole: true };
            }
          });

          this.registerForm.addControl('roles', rolesFG);
          break;
        case regControls.accountType:
          if (!this.user.accountType)
            this.user.accountType = 'Residential';
          this.registerForm.addControl('accountType', new FormControl(null, [Validators.required]));
          break;
      }
    }
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

  getControlValidation(controlName, errorName, beforeSubmit = true) {
    if (this.registerForm == null)
      return false;

    let control = this.registerForm.controls[controlName];

    return (beforeSubmit || this.trySubmit) && control.hasError(errorName);
  }

  markerDragEnd(m, $event) {
    this.mapMarker.lat = $event.coords.lat;
    this.mapMarker.lng = $event.coords.lng;
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

  mapUserRoles() {
    if (~this.controlsCofig.findIndex(c => c.type == regControls.roles))
      for (let role of this.user.roles)
        this.userRoles[Role[role]] = true;
  }

  ngOnDestroy() {
    if (this.subscriptions && this.subscriptions.length > 0)
      this.subscriptions.forEach(s => s.unsubscribe());
  }
}