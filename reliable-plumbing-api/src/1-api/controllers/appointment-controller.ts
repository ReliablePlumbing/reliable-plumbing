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
}