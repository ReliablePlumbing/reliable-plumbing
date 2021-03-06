import { JsonController, Param, QueryParam, Body, Get, Post, Put, Delete, Authorized, BodyParam, UploadedFiles } from "routing-controllers";
import { Role, Quote, QuoteStatus } from '../../3-domain/domain-module';
import { QuoteManager } from '../../2-business/business.module';
import { dependencies } from '../../5-cross-cutting/cross-cutting.module';
import { Inject } from 'typedi';
import { fileUploadOptions } from '../utils/files-options';

@JsonController('/quotes')
export class QuoteController {

    @Inject(dependencies.QuoteManager)
    private quoteManager: QuoteManager;

    @Post('/addQuote')
    addAppointment( @BodyParam('quote') appointmentModel, @UploadedFiles('images', { options: fileUploadOptions }) images) {
        let quote = new Quote(appointmentModel);
        return new Promise<any>((resolve, reject) => {
            this.quoteManager.addQuote(quote, images)
                .then(result => resolve(result.toLightModel()))
                .catch((error: Error) => reject(error));
        })
    }

    @Post('/getQuotesFilteredByStatus')
    @Authorized()
    getQuotesFilteredByStatus( @Body() filters: { statuses: QuoteStatus[], userId: string }) {
        return new Promise<any>((resolve, reject) => {
            this.quoteManager.getQuotesFilteredByStatus(filters)
                .then((results: Quote[]) => resolve(results.map(quote => quote.toLightModel())))
                .catch((error: Error) => reject(error));
        });
    }

    @Post('/updateQuote')
    @Authorized()
    updateQuote( @Body() quote: Quote) {
        return new Promise<any>((resolve, reject) => {
            this.quoteManager.updateQuote(quote)
                .then(result => resolve(result))
                .catch((error: Error) => reject(error));
        });
    }

    // @Post('/getAppointmentsFiltered')
    // @Authorized([Role.Supervisor, Role.Admin, Role.SystemAdmin])
    // getAppointmentsFiltered( @Body() filters) {
    //     return new Promise<Appointment[]>((resolve, reject) => {
    //         this.appointmentManager.getAppointmentFiltered(filters).then(appointments => {
    //             // to light models here
    //             let models = [];
    //             for (let appointment of appointments) {
    //                 let model = appointment.toLightModel();
    //                 models.push(model);
    //             }

    //             resolve(models);
    //         }).catch((error: Error) => reject(error));
    //     })
    // }



    // @Post('/updateAppointmentStatusAndAssignees')
    // @Authorized([Role.Supervisor, Role.Admin, Role.SystemAdmin])
    // updateAppointmentStatusAndAssignees( @Body() appointment) {
    //     return new Promise<any>((resolve, reject) => {
    //         this.appointmentManager.updateAppointmentStatusAndAssignees(appointment)
    //             .then(appointment => resolve(appointment.toLightModel()))
    //             .catch((error: Error) => reject(error));
    //     });
    // }
}