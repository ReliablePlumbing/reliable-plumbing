import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { AlertifyService, EnvironmentService, UserManagementService } from '../../services/services.exports';

@Component({
  selector: 'rb-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  form: FormGroup;
  changePassword = {
    email: null,
    oldPassword: null,
    newPassword: null,
    confirmNewPassword: null
  };
  trySubmit = false;
  @Output() passwordChanged: EventEmitter<any> = new EventEmitter<any>();

  constructor(private fb: FormBuilder, private userManagementService: UserManagementService,
    private alertifyService: AlertifyService, private environmentService: EnvironmentService) { }

  ngOnInit() {
    this.form = this.fb.group({
      oldPassword: ['', Validators.required],
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
    this.changePassword.email = currentUser.email;
    this.userManagementService.changePassword(this.changePassword).subscribe(success => {
      if (success) {
        this.alertifyService.success('password changed successfully');
        this.passwordChanged.emit();
      }
      else
        this.alertifyService.error('try again');
    })
  }

}
