import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { EnvironmentService } from '../../services/environment.service';
import { RouteHandlerService } from '../../services/route-handler.service';

@Component({
  selector: 'rb-schedule-appointment',
  templateUrl: './schedule-appointment.component.html',
  styleUrls: ['./schedule-appointment.component.scss']
})
export class ScheduleAppointmentComponent implements OnInit {
  appointmentForm: FormGroup;
  trySubmit: boolean = false;
  isLoggedIn: boolean = false;
  appointment = {
    appointmentType: -1,
    time: -1
  };

  constructor(private fb: FormBuilder, private notificationService: NotificationService,
    private environmentService: EnvironmentService, private routeHandler: RouteHandlerService) { }


  ngOnInit() {
    this.isLoggedIn = this.environmentService.isUserLoggedIn;
    this.createForm();
  }

  createForm() {

    this.appointmentForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', this.validateDropdownRequired],
      appointmentType: ['', this.validateDropdownRequired],
    });

    if (!this.isLoggedIn) {
      this.appointmentForm.addControl('fullName', new FormControl(null, [Validators.required]))
      this.appointmentForm.addControl('email', new FormControl(null, [Validators.required, Validators.email]))
      this.appointmentForm.addControl('mobile', new FormControl(null, [Validators.required]))
    }
  }

  validateDropdownRequired(control: AbstractControl) {
    let value = control.value;

    return value != null && value != '-1' ? null : { req: true };
  }
  getControlValidation(controlName, errorName, beforeSubmit = true) {
    if (this.appointmentForm == null)
      return false;

    let control = this.appointmentForm.controls[controlName];

    return (beforeSubmit || this.trySubmit) && !control.valid && control.errors[errorName];
  }

  scheduleAppointment() {
    this.trySubmit = true;
    // call service to send the appointement data
  }

  resetForm() {
    this.appointment.appointmentType = -1;
    this.appointment.time = -1;
    this.appointment['date'] = null;
    if (!this.isLoggedIn) {
      this.appointment['fullName'] = null;
      this.appointment['email'] = null;
      this.appointment['mobile'] = null;
    }
  }


}

