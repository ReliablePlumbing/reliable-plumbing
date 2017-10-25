import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';
import { convertTimeTo12String } from '../../utils/date-helpers';
import { AppointmentStatus, TechnicianStatus } from '../../models/enums';
import { AppointmentService } from '../../services/services.exports';

// todo: allow to change status
// todo: save appointment with the new status and assignee
@Component({
  selector: 'appointment-details',
  templateUrl: './appointment-details.component.html',
  styleUrls: ['./appointment-details.component.scss']
})
export class AppointmentDetailsComponent implements OnInit {

  @Input() appointment;
  mappedAppointment: {
    date: any,
    time: string,
    status: { id: number, text: string },
    assignees: any[]
  };
  technicians;
  mappedTechnicians;

  constructor(private appointmentService: AppointmentService) { }

  ngOnInit() {
    this.appointmentService.getTechniciansWithStatusInTime(this.appointment.id).subscribe(results => {
      console.log(results);
      this.technicians = results;
      this.mappedTechnicians = this.mapTechnicians(results);
    });
    this.mappedAppointment = this.mapAppointment(this.appointment);
  }

  mapAppointment(appointment) {

    let apppointmentDate = moment(this.appointment.date);

    return {
      date: this.appointment.date,
      time: convertTimeTo12String(apppointmentDate.hour(), apppointmentDate.minutes()),
      status: { id: this.appointment.status, text: AppointmentStatus[this.appointment.status] },
      assignees: appointment.assignees
    }
  }

  mapTechnicians(technicians) {
    let mappedTechs = technicians.map(tech => {
      return {
        technician: tech.technician,
        status: {
          id: tech.status,
          text: TechnicianStatus[tech.status],
          color: this.getTechnicianStatusColor(tech.status)
        },
        appointments: tech.appointments.map(appoint => this.mapAppointment(appoint))
      }
    });

    return mappedTechs;
  }

  getTechnicianStatusColor(status) {
    switch (status) {
      case TechnicianStatus.Available:
        return 'green';
      case TechnicianStatus.Busy:
        return 'red';
      case TechnicianStatus.PossibleBusy:
        return 'yellow';
      case TechnicianStatus.HardlyBusy:
        return 'orange';

      default:
        break;
    }
  }

  assign(tech) {
    if (this.mappedAppointment.assignees == null)
      this.mappedAppointment.assignees = [];

    this.mappedAppointment.assignees.push(tech.technician);
  }
}
