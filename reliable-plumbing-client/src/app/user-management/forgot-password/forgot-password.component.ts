import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { AlertifyService, EnvironmentService, UserManagementService } from '../../services/services.exports';
import { ActivatedRoute } from '@angular/router';
import { RouteHandlerService } from '../../services/route-handler.service';

@Component({
  selector: 'rb-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  form: FormGroup;
  resetPassword = {
    token: null,
    newPassword: null,
    confirmNewPassword: null
  };
  trySubmit = false;
  showErrorMsg = false;
  errorMsg;
  
  constructor(private fb: FormBuilder, private userManagementService: UserManagementService,
    private activatedRoute: ActivatedRoute, private routeHandlerService: RouteHandlerService,
    private alertifyService: AlertifyService, private environmentService: EnvironmentService) { }

  ngOnInit() {
    this.resetPassword.token = this.activatedRoute.snapshot.queryParams['token'];
    if (this.resetPassword.token)
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

    this.userManagementService.resetPassword(this.resetPassword).subscribe(result => {
      if (result.success) {
        this.alertifyService.success('password changed successfully');
        this.routeHandlerService.routeToDefault();
        this.showErrorMsg = false;
      }
      else {
        this.showErrorMsg = true;
        this.errorMsg = result.message;
        this.alertifyService.error(result.message);
      }
    })
  }
}
