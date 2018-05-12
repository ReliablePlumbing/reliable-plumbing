import { Component, OnInit } from '@angular/core';
import { AppointmentStatus, CallsQuotesMode } from '../../models/enums';
import { getEnumEntries, convertDateParamToDateObj, convertTimeTo12String, getDatesArray } from '../../utils/date-helpers';
import { LookupsService } from '../../services/lookups.service';
import * as moment from 'moment';
import { AppointmentService, AlertifyService, EnvironmentService } from '../../services/services.exports';
import { isCallOpened } from '../../utils/call-helpers';
import { ActivatedRoute } from '@angular/router';

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
  isMyCalls;
  responsiveModes = { split: 1, listing: 2, details: 3 }
  responsiveMode;
  screenWidth;

  constructor(private lookupsService: LookupsService, private callService: AppointmentService, private activatedRoute: ActivatedRoute,
    private alertifyService: AlertifyService, private enviromentService: EnvironmentService) { }

  ngOnInit() {
    this.loading = true;
    this.isMyCalls = this.activatedRoute.snapshot.data.myCalls;
    let nowDate = moment().toDate();
    let afterWeekDate = moment().add(1, 'week').toDate();
    this.rangeDates = [nowDate, afterWeekDate];
    this.lookupsService.getAppointmentSettingsAndTypes().subscribe(results => {
      this.services = results.types.map(t => { return { label: t.name, value: t } });
      this.filter();
    });
    this.screenWidth = screen.width;
    this.responsiveMode = screen.width >= 800 ? this.responsiveModes.split : this.responsiveModes.listing;
  }

  filter() {
    this.loading = true;
    let requestFilters: any = {
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
    if (this.isMyCalls)
      requestFilters.assigneeIds = [this.enviromentService.currentUser.id];

    this.callService.getAppointmentsFiltered(requestFilters).subscribe(results => {
      this.calls = results;
      if (this.calls && this.calls.length > 0)
        this.selectedCall = this.calls[0];
      this.loading = false;
    });
  }

  callSelected(call) {
    if (screen.width < 800)
      this.responsiveMode = this.responsiveModes.details;
    this.selectedCall = call;
  }

  backFromDetails() {
    this.responsiveMode = this.responsiveModes.listing;
  }

  callSubmitted(call) {
    this.callService.addAppointment(call.obj, call.images).subscribe(result => {
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

  ngAfterContentChecked() {
    if (this.screenWidth == screen.width)
      return;
    this.responsiveMode = screen.width >= 800 ? this.responsiveModes.split : this.responsiveModes.listing;
    this.screenWidth = screen.width;
  }
}
