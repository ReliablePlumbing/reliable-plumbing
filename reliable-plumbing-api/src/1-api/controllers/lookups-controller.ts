import { JsonController, Param, QueryParam, Body, Get, Post, Put, Delete, Authorized } from "routing-controllers";
import { Role } from '../../3-domain/domain-module';
import { LookupsManager } from '../../2-business/business.module';
import { dependencies } from '../../5-cross-cutting/cross-cutting.module';
import { Inject } from 'typedi';

@JsonController('/lookups')
export class LookupsController {

    @Inject(dependencies.LookupsManager)
    private lookupsManager: LookupsManager;

    @Post('/addEditAppointmentType')
    @Authorized([Role.Manager])
    addAppointmentType( @Body() appointmentType) {
        return new Promise<any>((resolve, reject) => {
            this.lookupsManager.addEditAppointmentType(appointmentType).then(res => resolve(res));
        });
    }

    @Get('/getAllAppointmentTypes')
    getAllAppointmentTypes() {
        return new Promise<any>((resolve, reject) => {

            this.lookupsManager.getAllAppointmentTypes().then(results => {
                let models = [];
                for (let type of results)
                    models.push(type.toLightModel());
                return resolve(models);
            });
        });
    }

    @Get('/getAppointmentSettings')
    getAppointmentSettings() {
        return new Promise<any>((resolve, reject) => {
            this.lookupsManager.getAppointmentSettings().then(result => resolve(result));
        });
    }

    @Post('/addEditAppointmentSettings')
    @Authorized([Role.Manager])
    addEditAppointmentSettings( @Body() appointmentSettings) {
        return new Promise<any>((resolve, reject) => {
            this.lookupsManager.addEditAppointmentSettings(appointmentSettings).then(result => resolve(result));
        });
    }

}