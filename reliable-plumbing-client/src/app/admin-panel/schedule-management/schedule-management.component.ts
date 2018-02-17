import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppointmentStatus, CallsQuotesMode } from '../../models/enums';
import { LookupsService, AppointmentService, AlertifyService } from '../../services/services.exports';
import { getEnumEntries, convertFromBootstrapDate, convertDateParamToDateObj } from '../../utils/date-helpers';
import * as moment from 'moment';
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
  loading: boolean = true;
  loadingFiltered = true;
  filters: any = {};
  lookups: {
    types: { id: string, text: string }[],
    status: any[]
  };
  timeTo: FormControl;
  timeFrom: FormControl;
  calls;

  constructor(private lookupsService: LookupsService, private appointmentService: AppointmentService, private alertifyService: AlertifyService,
    private router: Router, private activatedRoute: ActivatedRoute) { }

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
        let fromString = !this.filters.date.from ? null : moment(convertFromBootstrapDate(this.filters.date.from)).format('YYYY-M-D');
        let toString = !this.filters.date.to ? null : moment(convertFromBootstrapDate(this.filters.date.to)).format('YYYY-M-D');

        if ((!params['dFrom'] || params['dFrom'] == fromString) && (!params['dTo'] || (params['dTo'] == 'null' && toString == null) || params['dTo'] == toString))// &&
          // (!urlIdParam || this.urlIdParam == urlIdParam))
          return;

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
      this.calls = results;
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

