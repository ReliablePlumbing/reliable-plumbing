import { JsonController, Param, QueryParam, Body, Get, Post, Put, Delete, Authorized, BodyParam, UploadedFiles } from "routing-controllers";
import { DashboardManager } from '../../2-business/business.module';
import { dependencies } from '../../5-cross-cutting/cross-cutting.module';
import { Inject } from 'typedi';
import { fileUploadOptions } from '../utils/files-options';

@JsonController('/dashboards')
export class DashboardController {

    @Inject(dependencies.DashboardManager)
    private dashboardManager: DashboardManager;

    @Get('/getServicesStats')
    @Authorized()
    addAppointment() {
        return new Promise<any>((resolve, reject) => {
            this.dashboardManager.getServicesStats()
                .then(result => resolve(result))
                .catch((error: Error) => reject(error));
        })
    }

    @Get('/getTechniciansCallsStats')
    @Authorized()
    getTechniciansCallsStats() {
        return new Promise<any>((resolve, reject) => {
            this.dashboardManager.getTechniciansCallsStats()
                .then((result: any) => resolve(result))
                .catch((error: Error) => reject(error));

        });
    }

    @Get('/getTechniciansRating')
    @Authorized()
    getTechniciansRating() {
        return new Promise<any>((resolve, reject) => {
            this.dashboardManager.getTechniciansRating()
                .then((result: any) => resolve(result))
                .catch((error: Error) => reject(error));

        });
    }

    @Get('/getCallsCounts')
    @Authorized()
    getCallsCounts() {
        return new Promise<any>((resolve, reject) => {
            this.dashboardManager.getCallsCounts()
                .then((result: any) => resolve(result))
                .catch((error: Error) => reject(error));

        });
    }


}