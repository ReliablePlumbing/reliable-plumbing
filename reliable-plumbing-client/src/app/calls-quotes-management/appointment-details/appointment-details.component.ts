import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { convertTimeTo12String } from '../../utils/date-helpers';
import { AppointmentStatus, TechnicianStatus, Role } from '../../models/enums';
import { AppointmentService, AlertifyService, EnvironmentService } from '../../services/services.exports';
import { buildImagesObjects, buildImagesObjectsForLightBox } from '../../utils/files-helpers';
import { isAnyEligible } from '../../utils/user-helpers';
import { Lightbox } from 'angular2-lightbox';
import { getCustomerFullName } from '../../utils/call-helpers';

@Component({
  selector: 'appointment-details',
  templateUrl: './appointment-details.component.html',
  styleUrls: ['./appointment-details.component.scss']
})
export class AppointmentDetailsComponent implements OnInit {

  loading = true;
  @Input() appointment;
  mappedAppointment;
  technicians;
  mappedTechnicians;
  appointmentStatusEnum = AppointmentStatus;
  @Output() appointmentUpdated = new EventEmitter<any>();
  allowedStatus = [];
  isReadOnly = false;
  showMoreText = false;

  constructor(private appointmentService: AppointmentService, private alertifyService: AlertifyService, private environmentService: EnvironmentService,
    private lightBox: Lightbox) { }

  ngOnInit() {
    this.isReadOnly = !isAnyEligible(this.environmentService.currentUser, [Role.Admin, Role.Supervisor, Role.SystemAdmin]);
    this.mappedAppointment = this.mapAppointment(this.appointment);
    if (!this.isReadOnly) {
      this.getAllowedStatuses();
      this.appointmentService.getTechniciansWithStatusInTime(this.appointment.id).subscribe(results => {
        this.technicians = results;
        this.mappedTechnicians = this.mapTechnicians(results);
        this.loading = false;
      });
    }
  }

  mapAppointment(appointment) {
    return {
      customerName: getCustomerFullName(appointment),
      date: this.appointment.date,
      address: this.getAddress(this.appointment),
      contact: this.getCustomerContact(this.appointment),
      status: { id: this.appointment.status, text: AppointmentStatus[this.appointment.status] },
      images: buildImagesObjectsForLightBox(this.appointment.id, this.appointment.relatedFileNames),
      assignees: !this.isReadOnly ? [] : this.mapTechnicians(appointment.assignees),
      message: appointment.message
    }
  }

  getAddress(call) {
    let address = call.user ? call.user.sites.find(x => x.id == call.siteId) : call.customerInfo;

    return address.street + ' - ' + address.city + ' - ' + address.state;
  }

  getCustomerContact(call) {
    let user = call.user ? call.user : call.customerInfo;

    return user.email + ' - ' + user.mobile;
  }

  mapTechnicians(technicians) {
    let mappedTechs;

    mappedTechs = technicians.map(tech => {
      return {
        technician: this.isReadOnly ? tech : tech.technician,
        status: this.isReadOnly ? null : tech.status,
        appointments: this.isReadOnly ? null : tech.appointments.map(appoint => this.mapAppointment(appoint)),
      }
    });

    if (!this.isReadOnly) {
      for (let tech of mappedTechs) {
        for (let assigneeId of this.appointment.assigneeIds)
          if (assigneeId == tech.technician.id) {
            this.mappedAppointment.assignees.push(tech);
            tech.selected = true;
          }
      }
      mappedTechs = mappedTechs.filter(tech => !tech.selected)
    }
    return mappedTechs;
  }

  assign(tech) {
    if (this.mappedAppointment.assignees == null)
      this.mappedAppointment.assignees = [];

    this.mappedTechnicians = this.mappedTechnicians.filter(x => x.technician.id != tech.technician.id);
    this.mappedAppointment.assignees.push(tech);
  }

  removeAssignee(assignee) {
    this.mappedAppointment.assignees = this.mappedAppointment.assignees.filter(assign => assign.technician.id != assignee.technician.id);
    this.mappedTechnicians.splice(0, 0, assignee);
  }

  changeAppointmentStatus(status) {
    this.mappedAppointment.status = {
      id: status,
      text: AppointmentStatus[status]
    }
  }

  save() {
    this.loading = true;
    // map status
    if (this.mappedAppointment.status.id != this.appointment.status) {
      if (this.appointment.statusHistory == null)
        this.appointment.statusHistory = [];
      this.appointment.statusHistory.push({
        status: this.mappedAppointment.status.id,
        createdByUserId: this.environmentService.currentUser.id
      });
      this.appointment.status = this.mappedAppointment.status.id;
    }
    // map assignees
    this.appointment.assigneeIds = this.mappedAppointment.assignees.map(assignee => assignee.technician.id);

    // call service
    this.appointmentService.updateAppointmentStatusAndAssignees(this.appointment).subscribe(x => {
      this.loading = false;
      this.appointmentUpdated.emit(x);
      this.alertifyService.success('Appointment updated successfully');
    })
  }

  getAllowedStatuses() {
    let status = this.appointment.status;
    let isExistingUser = this.appointment.userId != null;

    switch (status) {
      case AppointmentStatus.Pending:
        this.allowedStatus = [AppointmentStatus.Pending, AppointmentStatus.Confirmed, AppointmentStatus.Rejected];
        break;
      case AppointmentStatus.Confirmed:
        this.allowedStatus = [AppointmentStatus.Confirmed, AppointmentStatus.Canceled];
        if (!isExistingUser)
          this.allowedStatus.push(AppointmentStatus.Completed);
        break;
      case AppointmentStatus.Rejected:
      case AppointmentStatus.Canceled:
      case AppointmentStatus.Completed:
        this.allowedStatus = [];
        break;
    }
  }

  openLightBox(index: number): void {
    // open lightbox
    this.lightBox.open(this.mappedAppointment.images, index);
  }
}
