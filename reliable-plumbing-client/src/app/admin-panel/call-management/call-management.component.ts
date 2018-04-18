import { Component, OnInit } from '@angular/core';
import { AppointmentStatus } from '../../models/enums';
import { getEnumEntries, convertDateParamToDateObj, convertTimeTo12String, getDatesArray } from '../../utils/date-helpers';
import { LookupsService } from '../../services/lookups.service';
import * as moment from 'moment';
import { AppointmentService } from '../../services/services.exports';
import { isCallOpened } from '../../utils/call-helpers';

@Component({
  selector: 'rb-call-management',
  templateUrl: './call-management.component.html',
  styleUrls: ['./call-management.component.scss']
})
export class CallManagementComponent implements OnInit {

  statusTabs;
  services;
  selectedServices = [];
  loading;
  calls;
  mappedCalls;
  datesArrayBetweenFilterDates;
  rangeDates;
  customerName;
  selectedCall;

  constructor(private lookupsService: LookupsService, private callService: AppointmentService) { }

  ngOnInit() {
    this.loading = true;
    this.statusTabs = [{ id: '0', text: 'All' }];
    this.statusTabs = this.getStatusIcons(this.statusTabs.concat(getEnumEntries(AppointmentStatus)));
    let nowDate = moment().toDate();
    let afterWeekDate = moment().add(1, 'week').toDate();
    this.rangeDates = [nowDate, afterWeekDate];
    this.lookupsService.getAppointmentSettingsAndTypes().subscribe(results => {
      this.services = results.types.map(t => { return { label: t.name, value: t } });
      // this.loading = false;
      this.filter();
    });
  }

  getStatusIcons(statusArr: any[]) {
    return statusArr.map(x => {
      switch (parseInt(x.id, 10)) {
        case AppointmentStatus.Pending:
          x.icon = 'fa fa-hourglass-half';
          break;
        case AppointmentStatus.Confirmed:
          x.icon = 'fa fa-circle green';
          break;
        case AppointmentStatus.Rejected:
          x.icon = 'fa fa-ban red';
          break;
        case AppointmentStatus.Canceled:
          x.icon = 'fa fa-circle red';
          break;
        case AppointmentStatus.Completed:
          x.icon = 'fa fa-check-circle green';
          break;
        default:
          break;
      }
      return x;
    })
  }

  filter() {
    // this.loadingFiltered = true;
    let requestFilters = {
      date: {
        from: this.rangeDates[0],
        to: this.rangeDates[1],
      },
      // time: this.filters.time,
      time: { from: { hour: 0, minute: 0 }, to: { hour: 0, minute: 0 } },
      customerName: this.customerName,
      status: [],
      typeIds: []
    }
    for (let type of this.selectedServices)
      requestFilters.typeIds.push(type.id);

    // if (changeUrlParams)
    //   this.changeUrlParams();
    this.callService.getAppointmentsFiltered(requestFilters).subscribe(results => {
      console.log(results);
      this.calls = results;
      this.mapAndGroupAppointmentsByDay();
      if (this.calls && this.calls.length > 0)
        this.selectedCall = this.calls[0];
      this.loading = false;
      // this.loadingFiltered = false;
    });
  }

  mapAndGroupAppointmentsByDay() {
    this.mappedCalls = {};
    this.statusTabs.forEach(tab => {
      this.mappedCalls[tab.id] = { callsCount: 0 };
    });
    for (let call of this.calls) {

      let callDate = moment(call.date, 'YYYY-MM-DD').format('MM-DD-YYYY');

      // if (this.mappedCalls[call.status] == undefined)
      this.mappedCalls[call.status].callsCount++;
      this.mappedCalls[0].callsCount++;
      if (this.mappedCalls[call.status][callDate] == null)
        this.mappedCalls[call.status][callDate] = [];
      if (this.mappedCalls[0][callDate] == null)
        this.mappedCalls[0][callDate] = [];
      // call.quoteTotalEstimate = this.calculateTotalQuoteEstimate(call);
      if (call.quote && call.user)
        call.quote.user = call.user;
      let appointmentDateLocalized = new Date(call.date);
      call.time = convertTimeTo12String(appointmentDateLocalized.getHours(), appointmentDateLocalized.getMinutes());
      call.allowCheckIn = isCallOpened(call);
      let customer = call.user == null ? call.customerInfo : call.user;
      call.customerName = customer.firstName + ' ' + (customer.lastName ? customer.lastName : '');
      this.mappedCalls[call.status][callDate].push(call);
      // handle all tab
      this.mappedCalls[0][callDate].push(call);
      // if (this.urlIdParam != null && call.id == this.urlIdParam) {
      //   this.openAppointmentDetailsModal(call, appointmentDate);
      // }

    }
    this.constructDaysArrayBetweenFilterDates();
  }

  constructDaysArrayBetweenFilterDates() {
    let from = this.rangeDates[0];
    let to = this.rangeDates[1] == null ? from : this.rangeDates[1];

    let startDate = moment(from, 'MM-DD-YYYY');
    let endDate = moment(to, 'MM-DD-YYYY');

    this.datesArrayBetweenFilterDates = getDatesArray(startDate, endDate);
  }

  servicesChanged = (x) => console.log(x)

  datesChanged = (x) => {
    console.log(x)
  };

}
