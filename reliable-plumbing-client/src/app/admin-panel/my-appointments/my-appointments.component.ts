import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { AppointmentService, EnvironmentService, AlertifyService } from '../../services/services.exports';
import { convertTimeTo12String, getDateString, getDatesArray } from '../../utils/date-helpers';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Marker } from '../../models/marker';

@Component({
  selector: 'rb-my-appointments',
  templateUrl: './my-appointments.component.html',
  styleUrls: ['./my-appointments.component.scss']
})
export class MyAppointmentsComponent implements OnInit {

  filterDates;
  loading = true;
  appointments;
  datesArrayBetweenFilterDates;
  checkInMapModalRef: NgbModalRef;
  selectedAppointment = null;
  mapMarker: Marker;

  constructor(private appointmentService: AppointmentService, private environmentService: EnvironmentService,
    private modalService: NgbModal, private alertifyService: AlertifyService) { }

  ngOnInit() {
    let nowDate = moment();
    this.filterDates = {
      from: { day: nowDate.date(), month: nowDate.month() + 1, year: nowDate.year() },
      to: null
    };
    this.filter();
    navigator.geolocation.getCurrentPosition(position => {
      this.mapMarker = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        draggable: true,
        label: null
      }
    });
  }


  updateDates(dates) {
    this.filterDates.from = dates.from;
    this.filterDates.to = dates.to;
  }

  filter() {
    this.loading = true;
    let requestFilters = {
      from: this.filterDates.from == null ? null : new Date(this.filterDates.from.year, this.filterDates.from.month - 1, this.filterDates.from.day),
      to: this.filterDates.to == null ? null : new Date(this.filterDates.to.year, this.filterDates.to.month - 1, this.filterDates.to.day),
      assigneeIds: [this.environmentService.currentUser.id]
    }

    this.appointmentService.getAssigneesAppointments(requestFilters).subscribe(results => {
      console.log(results);

      this.mapAndGroupAppointmentsByDay(results);
      this.loading = false;

    });
  }

  mapAndGroupAppointmentsByDay(appointments) {
    this.appointments = {};
    for (let appointment of appointments) {

      let appointmentDate = moment(appointment.date, 'YYYY-MM-DD').format('MM-DD-YYYY');

      if (this.appointments[appointmentDate] == null)
        this.appointments[appointmentDate] = [];

      let appointmentDateLocalized = new Date(appointment.date);
      appointment.time = convertTimeTo12String(appointmentDateLocalized.getHours(), appointmentDateLocalized.getMinutes());
      this.appointments[appointmentDate].push(appointment);
    }
    this.constructDaysArrayBetweenFilterDates();
  }

  constructDaysArrayBetweenFilterDates() {
    let from = getDateString(this.filterDates.from);
    let to = this.filterDates.to == null ? from : getDateString(this.filterDates.to);

    let startDate = moment(from, 'MM-DD-YYYY');
    let endDate = moment(to, 'MM-DD-YYYY');

    this.datesArrayBetweenFilterDates = getDatesArray(startDate, endDate);

  }

  openCheckInMap(appointment, template) {
    navigator.geolocation.getCurrentPosition(position => {
      this.mapMarker = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        draggable: true,
        label: null
      }
    });
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
