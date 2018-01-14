import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppointmentStatus, CallsQuotesMode } from '../../models/enums';
import { LookupsService, AppointmentService, AlertifyService } from '../../services/services.exports';
import { getEnumEntries, getDatesArray, getDateString, convertFromBootstrapDate, convertDateParamToDateObj } from '../../utils/date-helpers';
import * as moment from 'moment';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { convertTimeTo12String } from '../../utils/date-helpers';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'rb-schedule-management',
  templateUrl: './schedule-management.component.html',
  styleUrls: ['./schedule-management.component.scss']
})
export class ScheduleManagementComponent implements OnInit {

  modes = { listing: 1, addCall: 2, msg: 3 };
  mode = this.modes.listing;
  callsQuotesMode: CallsQuotesMode = CallsQuotesMode.call;
  @ViewChild('appointmentDetails') appointmentDetailsTemplate: ElementRef;
  appointmentDetailsModalRef: NgbModalRef;
  selectedAppointment = null;
  selectedDate = null;
  urlIdParam = null;
  loading: boolean = true;
  loadingFiltered = true;
  appointments = {};
  datesArrayBetweenFilterDates;
  filters: any = {};
  lookups: {
    types: { id: string, text: string }[],
    status: any[]
  };

  timeTo: FormControl;
  timeFrom: FormControl;

  constructor(private lookupsService: LookupsService, private appointmentService: AppointmentService, private alertifyService: AlertifyService,
    private modalService: NgbModal, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.timeTo = this.timeFrom = new FormControl('', (control: FormControl) => {
      if (this.filters.time == null) return null;
      let from = this.filters.time.from;
      let to = this.filters.time.to;

      if (to.hour < from.hour)
        return { afterFrom: true };
      else if (from.hour == to.hour) {
        if (to.minute < from.minute)
          return { afterFrom: true };
      }

      return null;
    });
    let urlParams = this.activatedRoute.snapshot.params;
    this.urlIdParam = urlParams['id'];
    this.lookupsService.getAppointmentSettingsAndTypes().subscribe(results => {
      this.lookups = {
        types: this.mapTypes(results.types),
        status: getEnumEntries(AppointmentStatus)
      };
      let nowDate = moment();
      let afterWeekDate = moment().add(1, 'week');
      this.filters = {
        date: {
          from: urlParams['dFrom'] == null ? { day: nowDate.date(), month: nowDate.month() + 1, year: nowDate.year() } :
            convertDateParamToDateObj(urlParams['dFrom']),
          to: urlParams['dTo'] == null ? { day: afterWeekDate.date(), month: afterWeekDate.month() + 1, year: afterWeekDate.year() } :
            convertDateParamToDateObj(urlParams['dTo']),
        },
        time: results.settings.workHours,
        status: [],
        types: []
      }

      this.filter(urlParams['dFrom'] == null && urlParams['dFrom'] == null)

      this.activatedRoute.params.subscribe(params => {
        let urlIdParam = params['id'];
        let fromString = !this.filters.date.from ? null : moment(convertFromBootstrapDate(this.filters.date.from)).format('YYYY-M-D');
        let toString = !this.filters.date.to ? null : moment(convertFromBootstrapDate(this.filters.date.to)).format('YYYY-M-D');

        if ((!params['dFrom'] || params['dFrom'] == fromString) && (!params['dTo'] || (params['dTo'] == 'null' && toString == null) || params['dTo'] == toString))// &&
          // (!urlIdParam || this.urlIdParam == urlIdParam))
          return;

        this.urlIdParam = urlIdParam;
        let nowDate = moment();
        let afterWeekDate = moment().add(1, 'week');
        this.filters.date = {
          from: params['dFrom'] == null ? { day: nowDate.date(), month: nowDate.month() + 1, year: nowDate.year() } :
            convertDateParamToDateObj(params['dFrom']),
          to: params['dTo'] == null ? { day: afterWeekDate.date(), month: afterWeekDate.month() + 1, year: afterWeekDate.year() } :
            convertDateParamToDateObj(params['dTo']),
        }
        this.filter(false);
      });
    });

  }

  mapTypes(types) {
    if (types == null)
      return [];

    let mappedTypes = [];
    for (let type of types) {
      mappedTypes.push({
        id: type.id,
        text: type.name
      });
    }

    return mappedTypes;
  }

  updateDates(dates) {
    this.filters.date.from = dates.from;
    this.filters.date.to = dates.to;
  }

  selected(item, items) {
    if (items == null)
      items = [];
    items.push(item);
  }

  removed(item, propName) {
    this.filters[propName] = this.filters[propName].filter(i => i.id != item.id);
  }

  filter(changeUrlParams = true) {
    this.loadingFiltered = true;
    let requestFilters = {
      date: {
        from: this.filters.date.from == null ? null : new Date(this.filters.date.from.year, this.filters.date.from.month - 1, this.filters.date.from.day),
        to: this.filters.date.to == null ? null : new Date(this.filters.date.to.year, this.filters.date.to.month - 1, this.filters.date.to.day),
      },
      time: this.filters.time,
      status: [],
      typeIds: []
    }
    for (let status of this.filters.status)
      requestFilters.status.push(status.id);
    for (let type of this.filters.types)
      requestFilters.typeIds.push(type.id);

    if (changeUrlParams)
      this.changeUrlParams();
    this.appointmentService.getAppointmentsFiltered(requestFilters).subscribe(results => {
      this.mapAndGroupAppointmentsByDay(results);
      this.loading = false;
      this.loadingFiltered = false;
    });
  }

  changeUrlParams() {

    let params = {
      dFrom: moment(convertFromBootstrapDate(this.filters.date.from)).format('YYYY-M-D'),
      dTo: this.filters.date.to == null ? null : moment(convertFromBootstrapDate(this.filters.date.to)).format('YYYY-M-D'),
    }
    let url = this.router.url.split(';')[0];
    this.router.navigate([url, params], { replaceUrl: true });
  }

  mapAndGroupAppointmentsByDay(appointments) {
    this.appointments = {};
    for (let appointment of appointments) {

      let appointmentDate = moment(appointment.date, 'YYYY-MM-DD').format('MM-DD-YYYY');

      if (this.appointments[appointmentDate] == null)
        this.appointments[appointmentDate] = [];

      let typeIndex = this.lookups.types.findIndex(t => t.id == appointment.typeId)
      if (typeIndex != -1)
        appointment.typeObj = this.lookups.types[typeIndex]
      let appointmentDateLocalized = new Date(appointment.date);
      appointment.time = convertTimeTo12String(appointmentDateLocalized.getHours(), appointmentDateLocalized.getMinutes());
      this.appointments[appointmentDate].push(appointment);
      if (this.urlIdParam != null && appointment.id == this.urlIdParam) {
        this.openAppointmentDetailsModal(appointment, appointmentDate);
      }

    }
    this.constructDaysArrayBetweenFilterDates();
  }

  constructDaysArrayBetweenFilterDates() {
    let from = getDateString(this.filters.date.from);
    let to = this.filters.date.to == null ? from : getDateString(this.filters.date.to);

    let startDate = moment(from, 'MM-DD-YYYY');
    let endDate = moment(to, 'MM-DD-YYYY');

    this.datesArrayBetweenFilterDates = getDatesArray(startDate, endDate);

  }

  openAppointmentDetailsModal(appointment, date) {
    this.selectedAppointment = appointment;
    this.selectedDate = date;
    let url = this.router.url + ';id=' + appointment.id;
    this.router.navigateByUrl(url);
    this.appointmentDetailsModalRef = this.modalService.open(this.appointmentDetailsTemplate, { size: 'lg' });
    this.appointmentDetailsModalRef.result.then(_ => {

      this.selectedAppointment = null;
      this.selectedDate = null;
      let params = Object.assign({}, this.activatedRoute.snapshot.params);
      delete params['id'];
      let url = this.router.url.split(';')[0];
      this.router.navigate([url, params]);
    }, _ => {
      let params = Object.assign({}, this.activatedRoute.snapshot.params);
      delete params['id'];
      let url = this.router.url.split(';')[0];
      this.router.navigate([url, params]);
      this.closeAppointmentDetailsModal();
    });
  }

  closeAppointmentDetailsModal() {
    this.selectedAppointment = null;
    this.selectedDate = null;
    this.urlIdParam = null;
    this.appointmentDetailsModalRef.close();
  }

  appointmentUpdated(appointment) {
    let index = this.appointments[this.selectedDate].filter(appoint => appoint.id == appointment.id);

    this.appointments[this.selectedDate][index] = appointment;

    this.selectedAppointment = null;
    this.selectedDate = null;
    this.appointmentDetailsModalRef.close();
  }


  callSubmitted(call) {

    this.appointmentService.addAppointment(call.obj, call.images).subscribe(result => {
      if (result.id != null) {
        this.mode = this.modes.msg;
        setTimeout(() => this.mode = this.modes.listing, 5000);
        this.alertifyService.success('Your call has been submitted');
      }
    });
  }

  setMode(currentMode) {
    this.mode = currentMode;
  }
}

