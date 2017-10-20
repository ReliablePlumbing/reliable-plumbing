import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AlertifyService, EnvironmentService, RouteHandlerService, LookupsService, AppointmentService } from '../../services/services.exports';
import { convertFromBootstrapDate } from '../../utils/helpers';

@Component({
  selector: 'rb-schedule-appointment',
  templateUrl: './schedule-appointment.component.html',
  styleUrls: ['./schedule-appointment.component.scss']
})
export class ScheduleAppointmentComponent implements OnInit {
  appointmentForm: FormGroup;
  appointmentTypes = [];
  timeList = [];
  trySubmit: boolean = false;
  isLoggedIn: boolean = false;
  appointment: any = {
    typeId: '-1',
    time: '-1'
  };

  constructor(private fb: FormBuilder, private alertifyService: AlertifyService, private lookupsService: LookupsService,
    private environmentService: EnvironmentService, private routeHandler: RouteHandlerService, private appointmentService: AppointmentService) { }


  ngOnInit() {
    this.timeList = [
      { timeStr: '08:00 am', hour: 8, mins: 0 },
      { timeStr: '08:30 am', hour: 8, mins: 30 },
      { timeStr: '09:00 am', hour: 9, mins: 0 }
    ]
    this.isLoggedIn = this.environmentService.isUserLoggedIn;
    this.getLookups();
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
    if (this.appointmentForm.invalid)
      return;

    this.appointment.date = convertFromBootstrapDate(this.appointment.dateObj, this.appointment.time);
    if (this.isLoggedIn)
      this.appointment.userId = this.environmentService.currentUser.id;
    // call service to send the appointement data
    this.appointmentService.addAppointment(this.appointment).subscribe(result => {
      if(result.id != null)
        this.alertifyService.printSuccessMessage('Your appointment has been submitted, one of our representatives will contact you soon');
    })
  }

  resetForm() {
    this.appointment.typeId = '-1';
    this.appointment.time = -1;
    this.appointment['date'] = null;
    if (!this.isLoggedIn) {
      this.appointment['fullName'] = null;
      this.appointment['email'] = null;
      this.appointment['mobile'] = null;
    }
  }

  getLookups() {
    this.lookupsService.getAllAppointmentTypes().subscribe(results => this.appointmentTypes = results);
  }


}

