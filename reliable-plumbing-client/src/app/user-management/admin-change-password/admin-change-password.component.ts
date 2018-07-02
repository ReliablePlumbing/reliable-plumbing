import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { UserManagementService, EnvironmentService, AlertifyService } from '../../services/services.exports';

@Component({
  selector: 'rb-admin-change-password',
  templateUrl: './admin-change-password.component.html',
  styleUrls: ['./admin-change-password.component.scss']
})
export class AdminChangePasswordComponent implements OnInit {

  form: FormGroup;
  @Input() user;
  changePassword = {
    adminEmail: null,
    email: null,
    newPassword: null,
    confirmNewPassword: null
  };
  trySubmit = false;
  @Output() passwordChanged: EventEmitter<any> = new EventEmitter<any>();

  constructor(private fb: FormBuilder, private userManagementService: UserManagementService,
    private alertifyService: AlertifyService, private environmentService: EnvironmentService) { }

  ngOnInit() {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])((?=.*?[0-9])|(?=.*?[#?!@$%^&*-])).{6,32}$/)]],
      confirmNewPassword: ['', [Validators.required, this.matchOtherValidator('newPassword')]]
    });
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

  save() {
    if (this.form.invalid) {
      this.trySubmit = true;
      return;
    }

    let currentUser: any = this.environmentService.currentUser;
    this.changePassword.adminEmail = currentUser.email;
    this.changePassword.email = this.user.email;
    this.userManagementService.adminChangePassword(this.changePassword).subscribe(success => {
      if (success) {
        this.alertifyService.success('password changed successfully');
        this.passwordChanged.emit();
      }
      else
        this.alertifyService.error('try again');
    })
  }
}
