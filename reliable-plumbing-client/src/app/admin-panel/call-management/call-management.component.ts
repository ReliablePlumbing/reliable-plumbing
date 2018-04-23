import { Component, OnInit } from '@angular/core';
import { AppointmentStatus, CallsQuotesMode } from '../../models/enums';
import { getEnumEntries, convertDateParamToDateObj, convertTimeTo12String, getDatesArray } from '../../utils/date-helpers';
import { LookupsService } from '../../services/lookups.service';
import * as moment from 'moment';
import { AppointmentService, AlertifyService } from '../../services/services.exports';
import { isCallOpened } from '../../utils/call-helpers';

@Component({
  selector: 'rb-call-management',
  templateUrl: './call-management.component.html',
  styleUrls: ['./call-management.component.scss']
})
export class CallManagementComponent implements OnInit {

  modes = { listing: 1, addCall: 2, msg: 3 };
  mode = this.modes.listing;
  callsQuotesMode: CallsQuotesMode = CallsQuotesMode.call;
  services;
  selectedServices = [];
  loading;
  calls;
  rangeDates;
  customerName;
  selectedCall;

  constructor(private lookupsService: LookupsService, private callService: AppointmentService, private appointmentService: AppointmentService,
    private alertifyService: AlertifyService) { }

  ngOnInit() {
    this.loading = true;
    let nowDate = moment().toDate();
    let afterWeekDate = moment().add(1, 'week').toDate();
    this.rangeDates = [nowDate, afterWeekDate];
    this.lookupsService.getAppointmentSettingsAndTypes().subscribe(results => {
      this.services = results.types.map(t => { return { label: t.name, value: t } });
      this.filter();
    });
  }

  filter() {
    let requestFilters = {
      date: {
        from: this.rangeDates[0],
        to: this.rangeDates[1],
      },
      time: { from: { hour: 0, minute: 0 }, to: { hour: 0, minute: 0 } },
      customerName: this.customerName,
      status: [],
      typeIds: []
    }
    for (let type of this.selectedServices)
      requestFilters.typeIds.push(type.id);

    this.callService.getAppointmentsFiltered(requestFilters).subscribe(results => {
      console.log(results);
      this.calls = results;
      if (this.calls && this.calls.length > 0)
        this.selectedCall = this.calls[0];
      this.loading = false;
    });
  }

  callSelected = call => this.selectedCall = call;

  callSubmitted(call) {
    this.appointmentService.addAppointment(call.obj, call.images).subscribe(result => {
      if (result.id != null) {
        this.mode = this.modes.msg;
        setTimeout(() => {
          this.mode = this.modes.listing
          this.filter();
        }, 5000);
        this.alertifyService.success('Your call has been submitted');
      }
    });
  }

  setMode(currentMode) {
    this.mode = currentMode;
  }

}
