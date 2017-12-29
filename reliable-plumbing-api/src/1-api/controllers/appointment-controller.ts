import { JsonController, Param, QueryParam, Body, Get, Post, Put, Delete, Authorized, BodyParam, UploadedFiles } from "routing-controllers";
import { Role, Appointment } from '../../3-domain/domain-module';
import { AppointmentManager } from '../../2-business/business.module';
import { dependencies } from '../../5-cross-cutting/cross-cutting.module';
import { Inject } from 'typedi';
import { fileUploadOptions } from '../utils/files-options';

@JsonController('/appointments')
export class AppointmentController {

    @Inject(dependencies.AppointmentManager)
    private appointmentManager: AppointmentManager;

    @Post('/addAppointment')
    addAppointment( @BodyParam('appointment') appointmentModel, @UploadedFiles('images', { options: fileUploadOptions }) images) {
        let appointment = new Appointment(appointmentModel);
        return new Promise<any>((resolve, reject) => {
            this.appointmentManager.addAppointment(appointment, images)
                .then(result => resolve(result.toLightModel()))
                .catch((error: Error) => reject(error));
        })
    }

    @Post('/getAppointmentsFiltered')
    @Authorized([Role.Supervisor, Role.Admin, Role.SystemAdmin])
    getAppointmentsFiltered( @Body() filters) {
        return new Promise<Appointment[]>((resolve, reject) => {
            this.appointmentManager.getAppointmentFiltered(filters).then(appointments => {
                // to light models here
                let models = [];
                for (let appointment of appointments) {
                    let model = appointment.toLightModel();
                    models.push(model);
                }

                resolve(models);
            }).catch((error: Error) => reject(error));
        })
    }

    @Post('/getAssigneesAppointments')
    @Authorized([Role.Supervisor, Role.Admin, Role.SystemAdmin, Role.Technician])
    getAssigneesAppointments( @Body() filters) {
        return new Promise<Appointment[]>((resolve, reject) => {
            this.appointmentManager.getAssigneesAppointments(filters.assigneeIds, filters.from, filters.to)
                .then(appointments => {
                    // to light models here
                    let models = [];
                    for (let appointment of appointments)
                        models.push(appointment.toLightModel());

                    resolve(models);
                }).catch((error: Error) => reject(error));
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
            }).catch((error: Error) => reject(error));
        });
    }

    @Post('/updateAppointmentStatusAndAssignees')
    @Authorized([Role.Supervisor, Role.Admin, Role.SystemAdmin])
    updateAppointmentStatusAndAssignees( @Body() appointment) {
        return new Promise<any>((resolve, reject) => {
            this.appointmentManager.updateAppointmentStatusAndAssignees(appointment)
                .then(appointment => resolve(appointment.toLightModel()))
                .catch((error: Error) => reject(error));
        });
    }

    @Post('/technicianCheckIn')
    @Authorized([Role.Technician])
    technicianCheckIn( @Body() checkInDetails) {
        return new Promise<any>((resolve, reject) => {
            this.appointmentManager.technicianCheckIn(checkInDetails)
                .then(success => resolve(success))
                .catch((error: Error) => reject(error));
        });
    }

}