import { JsonController, Param, QueryParam, Body, Get, Post, Put, Delete, Authorized } from "routing-controllers";
import { Role } from '../../3-domain/domain-module';
import { LookupsManager } from '../../2-business/business.module';
import { dependcies } from '../../5-cross-cutting/cross-cutting.module';
import { Inject } from 'typedi';

@JsonController('/lookups')
export class LookupsController {

    @Inject(dependcies.LookupsManager)
    private lookupsManager: LookupsManager;

    @Post('/addEditAppointmentType')
    @Authorized([Role.Admin])
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

}