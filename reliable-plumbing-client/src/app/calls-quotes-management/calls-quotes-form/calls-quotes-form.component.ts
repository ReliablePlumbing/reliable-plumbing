import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AlertifyService, EnvironmentService, RouteHandlerService, LookupsService, AppointmentService, UserManagementService } from '../../services/services.exports';
import { convertFromBootstrapDate, getTimeArray, compareBootstrapDate, getDateString } from '../../utils/date-helpers';
import { b64toByteArr } from '../../utils/files-helpers';
import { NgbDatepickerConfig, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { CallsQuotesMode } from '../../models/enums';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

@Component({
  selector: 'rb-calls-quotes-form',
  templateUrl: './calls-quotes-form.component.html',
  styleUrls: ['./calls-quotes-form.component.scss']
})
export class CallsQuotesFormComponent implements OnInit {

  @Input() mode: CallsQuotesMode;
  @Input() adminMode = false;
  @Input() forQuote = false;
  existingCustomer = false;
  modes = CallsQuotesMode;
  appointmentForm: FormGroup;
  customerInfoForm: FormGroup;
  appointmentTypes = [];
  timeList = [];
  trySubmit: boolean = false;
  isLoggedIn: boolean = false;
  images = [];
  appointment: any = {
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
  @Output() submitted: EventEmitter<any> = new EventEmitter<any>();
  sites = [];

  constructor(private fb: FormBuilder, private alertifyService: AlertifyService, private lookupsService: LookupsService,
    private environmentService: EnvironmentService, private routeHandler: RouteHandlerService, private usermanagementService: UserManagementService,
    private appointmentService: AppointmentService, private config: NgbDatepickerConfig) { }


  ngOnInit() {
    this.existingCustomer = this.adminMode;
    let nowDate = moment().add(1, 'hour').add(30, 'minutes'); // now date after 1:30 hours
    this.config.markDisabled = (date: NgbDateStruct) => {
      return compareBootstrapDate(date, { day: nowDate.date(), month: nowDate.month() + 1, year: nowDate.year() }) > 0;
    };
    let date = new Date();
    this.appointment.dateObj = { day: nowDate.date(), month: nowDate.month() + 1, year: nowDate.year() };
    this.isLoggedIn = this.environmentService.isUserLoggedIn;
    if (this.isLoggedIn && !this.adminMode) {
      this.activeIndex = 1;
      this.sites = this.environmentService.currentUser.sites;
    }
    this.getLookups();
    this.createForm();
  }

  createForm() {
    this.appointmentForm = this.fb.group({});

    if (!this.forQuote) {
      this.appointment.typeId = '-1';
      this.appointment.preferedContactType = 'Email';
      this.appointmentForm.addControl('appointmentType', new FormControl(null, [this.validateDropdownRequired]));
      this.appointmentForm.addControl('message', new FormControl(null))
    }

    if (this.mode == CallsQuotesMode.call) {
      this.appointmentForm.addControl('date', new FormControl(null, [Validators.required, (control: FormControl) => {
        let date = this.appointment.dateObj;
        if (date == null) return null;
        let nowDate = new Date();
        if (compareBootstrapDate(date, { day: nowDate.getDate(), month: nowDate.getMonth() + 1, year: nowDate.getFullYear() }) > 0)
          return { invalidDate: true };

        return null;
      }]));

      this.appointmentForm.controls['date'].valueChanges.subscribe(value => {
        if (value == null)
          return;

        this.createTimeArray();
      });
      this.appointmentForm.addControl('time', new FormControl(null, this.validateDropdownRequired));
    }

    if (!this.isLoggedIn || this.adminMode) {
      this.appointment.customerInfo = {
        state: 'California'
      },
        this.customerInfoForm = this.fb.group({
          firstName: [null, [Validators.required]],
          lastName: [null],
          email: [null, [Validators.required, Validators.email]],
          mobile: [null, [Validators.required]],
          street: [null, [Validators.required]],
          city: [null, [Validators.required]],
          state: [null, [Validators.required]],
          zipCode: [null]
        });
      //California
      this.customerInfoForm.controls['state'].disable();
    }
    else if (!this.forQuote) {
      this.appointment.siteId = '-1';
      this.appointmentForm.addControl('site', new FormControl(null, this.validateDropdownRequired));
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

    return (beforeSubmit || this.trySubmit) && !control.valid && control.hasError(errorName);
  }

  scheduleAppointment() {
    this.trySubmit = true;
    if (this.appointmentForm.invalid)
      return;

    this.appointment.date = convertFromBootstrapDate(this.appointment.dateObj, this.appointment.time);
    if (this.isLoggedIn && !this.adminMode)
      this.appointment.userId = this.environmentService.currentUser.id;
    else if (this.existingCustomer)
      this.appointment.userId = this.selectedUser.id;

    this.submitted.emit({
      obj: this.appointment,
      images: this.images.map(img => img.file)
    });
  }

  nextStep() {
    if (!this.adminMode && this.customerInfoForm.invalid) {
      this.trySubmit = true;
      return;
    }
    else if (this.existingCustomer && typeof this.selectedUser != 'object')
      return;

    this.trySubmit = false;
    if (this.existingCustomer && typeof this.selectedUser == 'object') {
      this.appointmentForm.addControl('site', new FormControl(null, this.validateDropdownRequired));
      this.sites = this.selectedUser.sites;
    }
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

  constructSite(site) {
    return site.streetAddress + ' - ' + site.city + ' - ' + site.state;
  }

  onUploadFile(files) {
    for (let file of files.files)
      this.images.push({ file: file, source: file.objectURL, alt: 'image' + (this.images.length + 1), title: 'image' + (this.images.length + 1) });
  }

  removeAllImages = () => this.images = [];

  selectedUser;
  searching = false;
  searchFailed = false;
  hideSearchingWhenUnsubscribed = new Observable(() => () => this.searching = false);

  search = (text$: Observable<string>) =>
    text$
      .debounceTime(300)
      .distinctUntilChanged()
      .do(() => this.searching = true)
      .switchMap(term =>
        this.usermanagementService.searchUsers(term)
          .do(() => this.searchFailed = false)
          .catch(() => {
            this.searchFailed = true;
            return of([]);
          }))
      .do(() => this.searching = false)
      .merge(this.hideSearchingWhenUnsubscribed);

  inputFormatter = (val) => val == null ? '' : val.firstName + ' ' + val.lastName + '  (' + val.email + ')';
}
