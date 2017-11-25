import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { convertTimeTo12String } from '../../utils/date-helpers';
import { AppointmentStatus, TechnicianStatus } from '../../models/enums';
import { AppointmentService, AlertifyService, EnvironmentService } from '../../services/services.exports';

// todo: loader
@Component({
  selector: 'appointment-details',
  templateUrl: './appointment-details.component.html',
  styleUrls: ['./appointment-details.component.scss']
})
export class AppointmentDetailsComponent implements OnInit {

  loading = true;
  @Input() appointment;
  mappedAppointment: {
    date: any,
    time: string,
    status: { id: number, text: string },
    assignees: any[]
  };
  technicians;
  mappedTechnicians;
  appointmentStatusEnum = AppointmentStatus;
  @Output() appointmentUpdated = new EventEmitter<any>();

  constructor(private appointmentService: AppointmentService, private alertifyService: AlertifyService, private environmentService: EnvironmentService) { }

  ngOnInit() {
    this.mappedAppointment = this.mapAppointment(this.appointment);
    this.appointmentService.getTechniciansWithStatusInTime(this.appointment.id).subscribe(results => {
      this.technicians = results;
      this.mappedTechnicians = this.mapTechnicians(results);
      this.loading = false;
    });
  }

  mapAppointment(appointment) {

    let apppointmentDate = moment(appointment.date);

    return {
      date: this.appointment.date,
      time: convertTimeTo12String(apppointmentDate.hour(), apppointmentDate.minutes()),
      status: { id: this.appointment.status, text: AppointmentStatus[this.appointment.status] },
      assignees: []
    }
  }

  mapTechnicians(technicians) {
    let mappedTechs = technicians.map(tech => {
      return {
        technician: tech.technician,
        status:  tech.status,
        appointments: tech.appointments.map(appoint => this.mapAppointment(appoint)),
      }
    });

    for (let tech of mappedTechs) {
      for (let assigneeId of this.appointment.assigneeIds)
        if (assigneeId == tech.technician.id) {
          this.mappedAppointment.assignees.push(tech);
          tech.selected = true;
        }
    }
    mappedTechs = mappedTechs.filter(tech => !tech.selected)
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
}
