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
  calls;
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
      this.calls = results;
      this.loading = false;

    });
  }

  
}
