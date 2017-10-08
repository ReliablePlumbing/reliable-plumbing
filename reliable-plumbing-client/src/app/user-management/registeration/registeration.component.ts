import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { UserManagementService } from '../services/user-management.service';
import { NotificationService } from '../../services/notification.service';
import { EnvironmentService } from '../../services/environment.service';
import { RouteHandlerService } from '../../services/route-handler.service';

@Component({
  selector: 'rb-registeration',
  templateUrl: './registeration.component.html',
  styleUrls: ['./registeration.component.scss']
})
export class RegisterationComponent implements OnInit {
  registerForm: FormGroup;
  trySubmit: boolean = false;
  user = {
    username: null,
    password: null,
    firstName: null,
    lastName: null,
    email: null,
    mobile: null,
    tel: null
  }
  constructor(private fb: FormBuilder, private userManagementService: UserManagementService, private notificationService: NotificationService,
    private environmentService: EnvironmentService, private routeHandler: RouteHandlerService) { }

  ngOnInit() {
    this.createForm();
  }

  // todo: get regex for usa mobile and land numbers
  createForm() {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(30)]],
      password: ['', [Validators.required, Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')]],
      // password pattern 
      // At least one upper case English letter, (?=.*?[A-Z])
      // At least one lower case English letter, (?=.*?[a-z])
      // At least one digit, (?=.*?[0-9])
      // At least one special character, (?=.*?[#?!@$%^&*-])
      // Minimum eight in length .{8,} (with the anchors)
      firstName: ['', Validators.required],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', Validators.required],//, Validators.pattern('^(\([0-9]{3}\)|[0-9]{3}-)[0-9]{3}-[0-9]{4}$')],
      tel: [''],//, Validators.pattern('^(\([0-9]{3}\)|[0-9]{3}-)[0-9]{3}-[0-9]{4}$')],
    })
  }

  userRegister() {
    this.trySubmit = true;
    if (this.registerForm.invalid)
      return;

    this.userManagementService.register(this.user).subscribe(s => alert(s))
  }

  getControlValidation(controlName, errorName, beforeSubnit = true) {
    if (this.registerForm == null)
      return false;

    let control = this.registerForm.controls[controlName];


    return (beforeSubnit || this.trySubmit) && !control.valid && control.errors[errorName];
  }
}
