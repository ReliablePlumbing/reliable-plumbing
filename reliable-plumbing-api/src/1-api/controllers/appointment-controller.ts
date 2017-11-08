import { JsonController, Param, QueryParam, Body, Get, Post, Put, Delete, Authorized } from "routing-controllers";
import { Role, Appointment } from '../../3-domain/domain-module';
import { AppointmentManager } from '../../2-business/business.module';
import { dependencies } from '../../5-cross-cutting/cross-cutting.module';
import { Inject } from 'typedi';


@JsonController('/appointments')
export class AppointmentController {

    @Inject(dependencies.AppointmentManager)
    private appointmentManager: AppointmentManager;

    @Post('/addAppointment')
    addAppointment( @Body() appointmentModel) {
        let appointment = new Appointment(appointmentModel);
        return new Promise<any>((resolve, reject) => {

            this.appointmentManager.addAppointment(appointment).then(result => {
                return resolve(result.toLightModel());
            })
        })
    }

    @Post('/getAppointmentsFiltered')
    @Authorized([Role.Supervisor, Role.Admin, Role.SystemAdmin])
    getAppointmentsFiltered( @Body() filters) {
        return new Promise<Appointment[]>((resolve, reject) => {
            this.appointmentManager.getAppointmentFiltered(filters).then(appointments => {
                // to light models here
                let models = [];
                for (let appointment of appointments)
                    models.push(appointment.toLightModel());

                resolve(models);
            })
        })
    }

    @Post('/getAssigneesAppointments')
    @Authorized([Role.Supervisor, Role.Admin, Role.SystemAdmin, Role.Technician])
    getAssigneesAppointments( @Body() filters) {
        return new Promise<Appointment[]>((resolve, reject) => {
            this.appointmentManager.getAssigneesAppointments(filters.assigneeIds, filters.from, filters.to).then(appointments => {
                // to light models here
                let models = [];
                for (let appointment of appointments)
                    models.push(appointment.toLightModel());

                resolve(models);
            })
        })
    }

    @Get('/getTechniciansWithStatusInTime')
    @Authorized([Role.Supervisor, Role.Admin, Role.SystemAdmin])
    getTechniciansWithStatusInTime( @QueryParam('appointmentId') appointmentId: string) {
        return new Promise<any>((resolve, reject) => {

            this.appointmentManager.getTechniciansWithStatusInTime(appointmentId).then(results => {
                let models = [];
                for (let entity of results) {
                    models.push({
                        technician: entity.technician.toLightModel(),
                        status: entity.status,
                        appointments: entity.appointments.map(appoint => appoint.toLightModel())
                    });
                }

                return resolve(models);
            });

        })
    }

    @Post('/updateAppointmentStatusAndAssignees')
    @Authorized([Role.Supervisor, Role.Admin, Role.SystemAdmin])
    updateAppointmentStatusAndAssignees( @Body() appointment) {
        return new Promise<any>((resolve, reject) => {
            this.appointmentManager.updateAppointmentStatusAndAssignees(appointment).then(appointment => {
                return resolve(appointment.toLightModel());
            });
        });
    }

    @Post('/technicianCheckIn')
    @Authorized([Role.Technician])
    technicianCheckIn(@Body() checkInDetails) {
        return new Promise<any>((resolve, reject) => {
            this.appointmentManager.technicianCheckIn(checkInDetails).then(success => {
                return resolve(success);
            });
        });
    }

}