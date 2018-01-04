import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AlertifyService, EnvironmentService, RouteHandlerService, LookupsService, AppointmentService } from '../../services/services.exports';
import { convertFromBootstrapDate, getTimeArray, compareBootstrapDate, getDateString } from '../../utils/date-helpers';
import { b64toByteArr } from '../../utils/files-helpers';
import { NgbDatepickerConfig, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

@Component({
  selector: 'rb-schedule-appointment',
  templateUrl: './schedule-appointment.component.html',
  styleUrls: ['./schedule-appointment.component.scss']
})
export class ScheduleAppointmentComponent implements OnInit {
  appointmentForm: FormGroup;
  customerInfoForm: FormGroup;
  appointmentTypes = [];
  timeList = [];
  trySubmit: boolean = false;
  isLoggedIn: boolean = false;
  images = [];
  appointment: any = {
    customerInfo: {},
    preferedContactType: 'Email',
    typeId: '-1',
    time: '-1'
  };
  mobileMaskOpts = {
    mask: ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
    guide: false,
    keepCharPositions: false,
    showMask: true,
    replceRegex: /\W/g
  };
  steps = [
    { label: 'Basic Info' },
    { label: 'Call Info' }
  ];
  activeIndex = 0;
  @Output() appointmentSubmitted: EventEmitter<any> = new EventEmitter<any>();

  constructor(private fb: FormBuilder, private alertifyService: AlertifyService, private lookupsService: LookupsService,
    private environmentService: EnvironmentService, private routeHandler: RouteHandlerService,
    private appointmentService: AppointmentService, private config: NgbDatepickerConfig) { }


  ngOnInit() {
    let nowDate = moment().add(1, 'hour').add(30, 'minutes'); // now date after 1:30 hours
    this.config.markDisabled = (date: NgbDateStruct) => {
      return compareBootstrapDate(date, { day: nowDate.date(), month: nowDate.month() + 1, year: nowDate.year() }) > 0;
    };
    let date = new Date();
    this.appointment.dateObj = { day: nowDate.date(), month: nowDate.month() + 1, year: nowDate.year() };
    this.isLoggedIn = this.environmentService.isUserLoggedIn;
    if (this.isLoggedIn)
      this.activeIndex = 1;
    this.getLookups();
    this.createForm();
  }

  createForm() {

    this.appointmentForm = this.fb.group({
      date: ['', [Validators.required, (control: FormControl) => {
        let date = this.appointment.dateObj;
        if (date == null) return null;
        let nowDate = new Date();
        if (compareBootstrapDate(date, { day: nowDate.getDate(), month: nowDate.getMonth() + 1, year: nowDate.getFullYear() }) > 0)
          return { invalidDate: true };

        return null;
      }]],
      time: ['', this.validateDropdownRequired],
      appointmentType: ['', this.validateDropdownRequired],
      message: ['']
    });

    this.appointmentForm.controls['date'].valueChanges.subscribe(value => {
      if (value == null)
        return;

      this.createTimeArray();
    });

    if (!this.isLoggedIn) {
      this.customerInfoForm = this.fb.group({
        firstName: [null, [Validators.required]],
        lastName: [null],
        email: [null, [Validators.required, Validators.email]],
        mobile: [null, [Validators.required]],
        street: [null],
        city: [null],
        state: [null],
        zipCode: [null]
      })

    }
  }

  validateDropdownRequired(control: AbstractControl) {
    let value = control.value;

    return value != null && value != '-1' ? null : { req: true };
  }
  getControlValidation(controlName, errorName, beforeSubmit = true) {
    if (this.appointmentForm == null)
      return false;

    let control =
      this.activeIndex == 0 ? this.customerInfoForm.controls[controlName] : this.appointmentForm.controls[controlName];

    return (beforeSubmit || this.trySubmit) && !control.valid && control.errors[errorName];
  }

  scheduleAppointment() {
    this.trySubmit = true;
    if (this.appointmentForm.invalid)
      return;

    this.appointment.date = convertFromBootstrapDate(this.appointment.dateObj, this.appointment.time);
    if (this.isLoggedIn)
      this.appointment.userId = this.environmentService.currentUser.id;

    this.appointmentService.addAppointment(this.appointment, this.images.map(img => img.file)).subscribe(result => {
      if (result.id != null) {
        this.appointmentSubmitted.emit();
        this.alertifyService.success('Your appointment has been submitted');
      }
    });
  }

  nextStep() {
    if (this.customerInfoForm.invalid)
      return;

    this.activeIndex = 1;
  }

  prevStep = () => this.activeIndex = 0;

  resetForm() {
    this.appointment.typeId = '-1';
    this.appointment.time = -1;
    this.appointment['date'] = null;
  }

  resetUserInfoForm = () => this.appointment.customerInfo = {};

  settings;
  getLookups() {
    this.lookupsService.getAppointmentSettingsAndTypes().subscribe(results => {

      this.settings = results.settings;
      this.createTimeArray()
      this.appointmentTypes = results.types;
    })
  }

  createTimeArray() {
    if (!this.settings)
      return;
    let from;
    let fromSettings = this.settings.workHours.from;
    // check first if the selected date is the same today date
    let selectedDate = moment(getDateString(this.appointment.dateObj), 'MM-DD-YYYY');
    let nowDate = moment();
    if (!nowDate.isSame(selectedDate, 'day'))
      from = fromSettings;
    else { // else if selected date is not today, then get now time and make from 1:30 after now time
      let nowDateAfter90Min = nowDate.add(1, 'hour').add(30, 'minutes');
      let now = { hour: nowDateAfter90Min.hours(), minute: nowDateAfter90Min.minutes() };
      if (now.minute > 0 && now.minute < 30)
        now.minute = 30;
      else if (now.minute > 0 && now.minute > 30) {
        now.hour += 1;
        now.minute = 30;
      }

      if (fromSettings.hour < now.hour)
        from = now;
      else if (fromSettings.hour == now.hour && now.minute < fromSettings.minute)
        from = now;
      else
        from = fromSettings;
    }

    this.timeList = getTimeArray(this.settings.timeSpan, from, this.settings.workHours.to);

  }

  onUploadFile(files) {
    for (let file of files.files)
      this.images.push({ file: file, source: file.objectURL, alt: 'image' + (this.images.length + 1), title: 'image' + (this.images.length + 1) });
  }

  removeAllImages() {
    this.images = [];

  }


}

