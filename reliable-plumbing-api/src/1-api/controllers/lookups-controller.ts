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
    @Authorized([Role.Admin, Role.SystemAdmin])
    addAppointmentType( @Body() appointmentType) {
        return new Promise<any>((resolve, reject) => {
            this.lookupsManager.addEditAppointmentType(appointmentType)
                .then(res => resolve(res))
                .catch((error: Error) => reject(error));
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
            }).catch((error: Error) => reject(error));
        });
    }

    @Get('/getAppointmentSettings')
    getAppointmentSettings() {
        return new Promise<any>((resolve, reject) => {
            this.lookupsManager.getAppointmentSettings()
                .then(result => resolve(result))
                .catch((error: Error) => reject(error));
        });
    }

    @Post('/addEditAppointmentSettings')
    @Authorized([Role.Admin, Role.SystemAdmin])
    addEditAppointmentSettings( @Body() appointmentSettings) {
        return new Promise<any>((resolve, reject) => {
            this.lookupsManager.addEditAppointmentSettings(appointmentSettings)
                .then(result => resolve(result))
                .catch((error: Error) => reject(error));
        });
    }

    @Get('/getAppointmentSettingsAndTypes')
    getAppointmentSettingsAndTypes() {
        return new Promise<any>((resolve, reject) => {
            this.lookupsManager.getAppointmentSettingsAndTypes()
                .then(result => resolve(result))
                .catch((error: Error) => reject(error));
        });
    }

}