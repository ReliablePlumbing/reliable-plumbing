import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppointmentStatus } from '../../models/enums';
import { LookupsService, AppointmentService } from '../../services/services.exports';
import { getEnumEntries, getDatesArray, getDateString } from '../../utils/date-helpers';
import * as moment from 'moment';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';

// todo: refactor dates to use moment and default offset is week
@Component({
  selector: 'rb-schedule-management',
  templateUrl: './schedule-management.component.html',
  styleUrls: ['./schedule-management.component.scss']
})
export class ScheduleManagementComponent implements OnInit {

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

  constructor(private lookupsService: LookupsService, private appointmentService: AppointmentService,
    private modalService: NgbModal, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.urlIdParam = this.activatedRoute.snapshot.params['id'];
    this.lookupsService.getAppointmentSettingsAndTypes().subscribe(results => {
      this.lookups = {
        types: this.mapTypes(results.types),
        status: getEnumEntries(AppointmentStatus)
      };
      let nowDate = moment();
      let afterWeekDate = moment().add(1, 'week');
      this.filters = {
        date: {
          from: { day: nowDate.date(), month: nowDate.month() + 1, year: nowDate.year() },
          to: { day: afterWeekDate.date(), month: afterWeekDate.month() + 1, year: afterWeekDate.year() },
        },
        status: [],
        time: results.settings.workHours,
        types: []
      }
      this.filter()
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

  filter() {
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

    this.appointmentService.getAppointmentsFiltered(requestFilters).subscribe(results => {
      console.log(results);

      this.mapAndGroupAppointmentsByDay(results);
      this.loading = false;
      this.loadingFiltered = false;

    })
  }

  mapAndGroupAppointmentsByDay(appointments) {
    // todo: map to an object for display in card
    this.appointments = {};
    for (let appointment of appointments) {

      let appointmentDate = moment(appointment.date, 'YYYY-MM-DD').format('MM-DD-YYYY');

      if (this.appointments[appointmentDate] == null)
        this.appointments[appointmentDate] = [];

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
    let url = this.router.url;
    this.router.navigate([url, { id: appointment.id }])
    this.appointmentDetailsModalRef = this.modalService.open(this.appointmentDetailsTemplate, { size: 'lg' });
    this.appointmentDetailsModalRef.result.then(_ => {

      this.selectedAppointment = null;
      this.selectedDate = null;
      let url = this.router.url.split(';')[0];
      this.router.navigate([url]);
    }, _ => {
      let url = this.router.url.split(';')[0];
      this.router.navigate([url]);
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

}

