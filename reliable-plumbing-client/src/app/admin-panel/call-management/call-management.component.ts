import { Component, OnInit } from '@angular/core';
import { CallsQuotesMode } from '../../models/enums';
import { LookupsService } from '../../services/lookups.service';
import * as moment from 'moment';
import { AppointmentService, AlertifyService, EnvironmentService } from '../../services/services.exports';
import { ActivatedRoute, Router } from '@angular/router';
import { queryParams } from '../../models/constants'

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
    private alertifyService: AlertifyService, private enviromentService: EnvironmentService, private router: Router) { }

  ngOnInit() {
    this.loading = true;
    this.isMyCalls = this.activatedRoute.snapshot.data.myCalls;
    let fromDateParam = this.activatedRoute.snapshot.params[queryParams.fromDate];
    let toDateParam = this.activatedRoute.snapshot.params[queryParams.toDate];

    let nowDate = fromDateParam ? moment(fromDateParam, queryParams.urlDateFormat).toDate() : moment().toDate();
    let afterWeekDate = moment().add(1, 'week').toDate();
    if (toDateParam)
      afterWeekDate = moment(toDateParam, queryParams.urlDateFormat).toDate();
    else if (fromDateParam)
      afterWeekDate = null;

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
    let params: any = {};
    params[queryParams.fromDate] = moment(this.rangeDates[0]).format(queryParams.urlDateFormat);
    if (this.rangeDates[1])
      params[queryParams.toDate] = moment(this.rangeDates[1]).format(queryParams.urlDateFormat);
    if (this.activatedRoute.snapshot.params[queryParams.callId])
      params[queryParams.callId] = this.activatedRoute.snapshot.params[queryParams.callId];
    this.router.navigate([this.router.url.split(';')[0], params])
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
      let callIdUrlParam = this.activatedRoute.snapshot.params[queryParams.callId];
      if (this.calls && this.calls.length > 0) {
        if (callIdUrlParam)
          this.selectedCall = this.calls.find(call => call.id == callIdUrlParam);
        else
          this.selectedCall = this.calls[0];
      }
      this.loading = false;
    });
  }

  callSelected(call) {
    if (screen.width < 800)
      this.responsiveMode = this.responsiveModes.details;
    this.selectedCall = call;
    let url = this.router.url.split(';')[0];
    let params = {};
    Object.keys(this.activatedRoute.snapshot.params).forEach(key => params[key] = this.activatedRoute.snapshot.params[key]);
    params[queryParams.callId] = this.selectedCall.id;

    this.router.navigate([url, params]);
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

  private updateUrlParams(newParams){

  }
}
