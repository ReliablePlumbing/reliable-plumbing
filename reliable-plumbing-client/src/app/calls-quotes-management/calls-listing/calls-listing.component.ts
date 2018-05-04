import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { getDateString, getDatesArray, convertTimeTo12String, getEnumEntries } from '../../utils/date-helpers';
import * as moment from 'moment';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertifyService, EnvironmentService, AppointmentService } from '../../services/services.exports';
import { ActivatedRoute, Router } from '@angular/router';
import { isAnyEligible } from '../../utils/user-helpers';
import { Role, AppointmentStatus, Permission } from '../../models/enums';
import { isCallOpened } from '../../utils/call-helpers';

@Component({
  selector: 'calls-listing',
  templateUrl: './calls-listing.component.html',
  styleUrls: ['./calls-listing.component.scss']
})
export class CallsListingComponent implements OnInit {

  @Input() rangeDates;
  @Input() calls = [];
  @Output() callSelected: EventEmitter<any> = new EventEmitter<any>();
  mappedCalls = {};
  datesArrayBetweenFilterDates;
  statusTabs;
  selectedCall;
  //////////////////////////
  permissions: {
    confirmCall: boolean,
    rejectCall: boolean,
    completeCall: boolean,
    cancelCall: boolean,
  };
  checkInMapModalRef: NgbModalRef;

  constructor(private alertifyService: AlertifyService, private modalService: NgbModal, private router: Router,
    private activatedRoute: ActivatedRoute, private environmentService: EnvironmentService, private callService: AppointmentService) { }

  ngOnInit() {
    this.initPermissions();
    this.statusTabs = [{ id: '0', text: 'All' }];
    this.statusTabs = this.getStatusIcons(this.statusTabs.concat(getEnumEntries(AppointmentStatus)));
    this.mapAndGroupAppointmentsByDay();
    if (this.calls && this.calls.length > 0)
      this.selectedCall = this.calls[0];
  }

  initPermissions() {
    this.permissions = {
      confirmCall: this.environmentService.hasPermission(Permission.ConfirmCall),
      rejectCall: this.environmentService.hasPermission(Permission.RejectCall),
      completeCall: this.environmentService.hasPermission(Permission.CompleteCall),
      cancelCall: this.environmentService.hasPermission(Permission.CancelCall),
    }
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

  mapAndGroupAppointmentsByDay() {
    this.mappedCalls = {};
    this.statusTabs.forEach(tab => {
      this.mappedCalls[tab.id] = { callsCount: 0 };
    });
    for (let call of this.calls) {

      let callDate = moment(call.date, 'YYYY-MM-DD').format('MM-DD-YYYY');

      this.mappedCalls[call.status].callsCount++;
      this.mappedCalls[0].callsCount++;
      if (this.mappedCalls[call.status][callDate] == null)
        this.mappedCalls[call.status][callDate] = [];
      if (this.mappedCalls[0][callDate] == null)
        this.mappedCalls[0][callDate] = [];
      if (call.quote && call.user)
        call.quote.user = call.user;
      let appointmentDateLocalized = new Date(call.date);
      call.time = convertTimeTo12String(appointmentDateLocalized.getHours(), appointmentDateLocalized.getMinutes());
      call.allowCheckIn = isCallOpened(call);
      let customer = call.user == null ? call.customerInfo : call.user;
      call.customerName = customer.firstName + ' ' + (customer.lastName ? customer.lastName : '');
      call.actions = this.getAllowedCallActions(call);
      call.allowCheckIn = isCallOpened(call);
      this.mappedCalls[call.status][callDate].push(call);
      // handle all tab
      this.mappedCalls[0][callDate].push(call);
    }
    this.constructDaysArrayBetweenFilterDates();
  }

  getAllowedCallActions(call) {
    let actions = [];
    switch (call.status) {
      case AppointmentStatus.Pending:
        if (this.permissions.confirmCall)
          actions.push({ status: AppointmentStatus.Confirmed, label: 'Confirm', cssClass: 'btn-primary' });
        if (this.permissions.rejectCall)
          actions.push({ status: AppointmentStatus.Rejected, label: 'Reject', cssClass: 'btn-primary' });
        break;
      case AppointmentStatus.Confirmed:
        if (this.permissions.completeCall)
          actions.push({ status: AppointmentStatus.Completed, label: 'Done', cssClass: 'btn-primary' });
        if (this.permissions.cancelCall)
          actions.push({ status: AppointmentStatus.Canceled, label: 'Cancel', cssClass: 'btn-primary' });
        break;
    }
    return actions;
  }

  constructDaysArrayBetweenFilterDates() {
    let from = this.rangeDates[0];
    let to = this.rangeDates[1] == null ? from : this.rangeDates[1];

    let startDate = moment(from, 'MM-DD-YYYY');
    let endDate = moment(to, 'MM-DD-YYYY');

    this.datesArrayBetweenFilterDates = getDatesArray(startDate, endDate);
  }

  calculateTotalQuoteEstimate(call) {
    if (!call.quote)
      return null;

    let totalEstimate = 0;
    call.quote.estimateFields.forEach(f => totalEstimate += parseFloat(f.cost));

    return totalEstimate;
  }

  // openCheckInMap(appointment, template) {

  //   this.selectedAppointment = appointment;

  //   this.checkInMapModalRef = this.modalService.open(template, { size: 'lg' });
  //   this.checkInMapModalRef.result.then(_ => {
  //     this.selectedAppointment = null;
  //   }, _ => {
  //     this.selectedAppointment = null;
  //     this.checkInMapModalRef.close();
  //   });
  // }

  // markerDragEnd(m, $event) {
  //   this.mapMarker.lat = $event.coords.lat;
  //   this.mapMarker.lng = $event.coords.lng;
  // }

  // checkIn() {
  //   let checkInDetails = {
  //     appointmentId: this.selectedAppointment.id,
  //     lat: this.mapMarker.lat,
  //     lng: this.mapMarker.lng,
  //     userId: this.environmentService.currentUser.id
  //   }
  //   this.appointmentService.technicianCheckIn(checkInDetails).subscribe(success => {
  //     if (success) {
  //       this.checkInMapModalRef.close();
  //       this.alertifyService.success('check in completed successfully');
  //     }
  //     else
  //       this.alertifyService.error('unsuccessful check in, please try again');

  //   });
  // }

  selectCall(call) {
    this.selectedCall = call;
    this.callSelected.emit(call);
  }

  changeCallStatus(call, nextStatus) {
    if (call.statusHistory == null)
      call.statusHistory = [];
    call.statusHistory.push({
      status: nextStatus,
      createdByUserId: this.environmentService.currentUser.id
    });
    call.status = nextStatus;
    this.callService.updateAppointmentStatusAndAssignees(call).subscribe(result => {
      if (result) {
        call.actions = this.getAllowedCallActions(call);
        this.alertifyService.success('Call Status Updated Successfully');
      }
    });
  }
}
