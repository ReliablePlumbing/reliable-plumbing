import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { getDateString, getDatesArray, convertTimeTo12String } from '../../utils/date-helpers';
import * as moment from 'moment';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertifyService, EnvironmentService, AppointmentService } from '../../services/services.exports';
import { ActivatedRoute, Router } from '@angular/router';
import { isAnyEligible } from '../../utils/user-helpers';
import { Role } from '../../models/enums';
import { isCallOpened } from '../../utils/call-helpers';

@Component({
  selector: 'calls-listing',
  templateUrl: './calls-listing.component.html',
  styleUrls: ['./calls-listing.component.scss']
})
export class CallsListingComponent implements OnInit {

  @Input() dates;
  @Input() calls = [];
  mappedCalls = {};
  datesArrayBetweenFilterDates;
  @ViewChild('appointmentDetails') appointmentDetailsTemplate: ElementRef;
  appointmentDetailsModalRef: NgbModalRef;
  @ViewChild('quoteDetails') quoteDetailsTemplate: ElementRef;
  quoteDetailsModalRef: NgbModalRef;
  selectedAppointment = null;
  selectedQuote = null;
  selectedDate = null;
  urlIdParam = null;
  allowUserCheckIn = false;
  mapMarker: any = { lat: 36.778259, lng: -119.417931 }; // california coordinates
  checkInMapModalRef: NgbModalRef;

  constructor(private alertifyService: AlertifyService, private modalService: NgbModal, private router: Router,
    private activatedRoute: ActivatedRoute, private environmentService: EnvironmentService, private appointmentService: AppointmentService) { }

  ngOnInit() {
    this.allowUserCheckIn = isAnyEligible(this.environmentService.currentUser, [Role.Technician]);
    if (this.allowUserCheckIn) {
      navigator.geolocation.getCurrentPosition(position => {
        this.mapMarker = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          draggable: true,
          label: null
        }
      });
    }
  }

  ngOnChanges() {
    this.urlIdParam = this.activatedRoute.snapshot.params['id'];
    if (this.dates)
      this.mapAndGroupAppointmentsByDay();
  }

  mapAndGroupAppointmentsByDay() {
    this.mappedCalls = {};
    for (let call of this.calls) {

      let appointmentDate = moment(call.date, 'YYYY-MM-DD').format('MM-DD-YYYY');

      if (this.mappedCalls[appointmentDate] == null)
        this.mappedCalls[appointmentDate] = [];

      call.quoteTotalEstimate = this.calculateTotalQuoteEstimate(call);
      let appointmentDateLocalized = new Date(call.date);
      call.time = convertTimeTo12String(appointmentDateLocalized.getHours(), appointmentDateLocalized.getMinutes());
      call.allowCheckIn = isCallOpened(call);
      this.mappedCalls[appointmentDate].push(call);
      if (this.urlIdParam != null && call.id == this.urlIdParam) {
        this.openAppointmentDetailsModal(call, appointmentDate);
      }

    }
    this.constructDaysArrayBetweenFilterDates();
  }

  constructDaysArrayBetweenFilterDates() {
    let from = getDateString(this.dates.from);
    let to = this.dates.to == null ? from : getDateString(this.dates.to);

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

  openQuoteDetails(quote) {
    this.selectedQuote = quote;
    this.quoteDetailsModalRef = this.modalService.open(this.quoteDetailsTemplate, { size: 'lg' });
    this.quoteDetailsModalRef.result.then(_ => this.selectedQuote = null, _ => this.selectedQuote = null);
  }

  closeQuoteDetailsModal = () => this.quoteDetailsModalRef.close();

  closeAppointmentDetailsModal() {
    this.selectedAppointment = null;
    this.selectedDate = null;
    this.urlIdParam = null;
    this.appointmentDetailsModalRef.close();
  }

  appointmentUpdated(appointment) {
    let index = this.mappedCalls[this.selectedDate].filter(appoint => appoint.id == appointment.id);

    this.mappedCalls[this.selectedDate][index] = appointment;

    this.selectedAppointment = null;
    this.selectedDate = null;
    this.appointmentDetailsModalRef.close();
  }

  openCheckInMap(appointment, template) {

    this.selectedAppointment = appointment;

    this.checkInMapModalRef = this.modalService.open(template, { size: 'lg' });
    this.checkInMapModalRef.result.then(_ => {
      this.selectedAppointment = null;
    }, _ => {
      this.selectedAppointment = null;
      this.checkInMapModalRef.close();
    });
  }

  markerDragEnd(m, $event) {
    this.mapMarker.lat = $event.coords.lat;
    this.mapMarker.lng = $event.coords.lng;
  }

  checkIn() {
    let checkInDetails = {
      appointmentId: this.selectedAppointment.id,
      lat: this.mapMarker.lat,
      lng: this.mapMarker.lng,
      userId: this.environmentService.currentUser.id
    }
    this.appointmentService.technicianCheckIn(checkInDetails).subscribe(success => {
      if (success) {
        this.checkInMapModalRef.close();
        this.alertifyService.success('check in completed successfully');
      }
      else
        this.alertifyService.error('unsuccessful check in, please try again');

    });
  }
}
