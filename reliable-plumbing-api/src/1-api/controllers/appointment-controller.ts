import { JsonController, Param, QueryParam, Body, Get, Post, Put, Delete, Authorized } from "routing-controllers";
import { Role } from '../../3-domain/domain-module';
import { AppointmentManager } from '../../2-business/business.module';
import { dependcies } from '../../5-cross-cutting/cross-cutting.module';
import { Inject } from 'typedi';


@JsonController('/appointments')
export class AppointmentController {

    @Inject(dependcies.AppointmentManager)
    private appointmentManager: AppointmentManager;

    @Post('./addAppointment')
    addAppointment( @Body() appointment) {
        return new Promise<any>((resolve, reject) => {

            this.appointmentManager.addAppointment(appointment).then(result => {
                return resolve(result.toLightModel());
            })
        })
    }
}