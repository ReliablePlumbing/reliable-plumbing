import { Inject, Service } from 'typedi';
import {
    AppError, ErrorType, Appointment, QuoteStatus, NotificationType,
    Notification, ObjectType, Role, TechnicianStatus, User, StatusHistory, Quote
} from '../../3-domain/domain-module';
import { QuoteRepo, UserRepo, AppointmentRepo } from '../../4-data-access/data-access.module';
import { NotificationManager } from './notification-manager';
import { FilesManager } from './files-manager';
import { AccountSecurity, dependencies, TokenManager } from '../../5-cross-cutting/cross-cutting.module';
import * as moment from 'moment';
import config from '../../config';

@Service()
export class QuoteManager {

    @Inject(dependencies.QuoteRepo) private quoteRepo: QuoteRepo;
    @Inject(dependencies.AppointmentRepo) private callRepo: AppointmentRepo;
    @Inject(dependencies.UserRepo) private userRepo: UserRepo;
    @Inject(dependencies.NotificationManager) private notificationManager: NotificationManager;
    @Inject(dependencies.FilesManager) private filesManager: FilesManager;

    addQuote(quote: Quote, images) {
        if (quote == null)
            throw new Error('quote can\'t be null');

        let errors = this.validateQuote(quote);
        if (errors.length > 0)
            throw new AppError(errors, ErrorType.validation);

        // initialize quote data creation date, initial status etc..
        quote.creationDate = new Date();
        quote.status = QuoteStatus.Open;
        quote.statusHistory = [new StatusHistory({
            status: QuoteStatus.Open,
            creationDate: new Date(),
            createdByUserId: quote.userId
        })];
        quote.relatedFileNames = this.filesManager.getImagesFilesNames(images);

        return new Promise<Quote>((resolve, reject) => {
            this.quoteRepo.add(quote).then(result => {

                // update quotes if exists
                if (quote.appointmentId)
                    this.updateQuoteCall(quote.id, quote.appointmentId);

                // add notification
                let notifier = quote.userId == null ? [] : quote.userId;
                this.buildQuoteCreatedNotification([notifier], result.id)
                    .then(notification => this.notificationManager.addNotification(notification))
                    .catch((error: Error) => reject(error));

                // convert images to file system
                this.filesManager.moveFilesToObjectFolder(result.id, images);
                return resolve(result);
            }).catch((error: Error) => reject(error));

        });
    }


    getQuotesFilteredByStatus(filters: { statuses: QuoteStatus[], userId: string }) {
        return new Promise<Quote[]>((resolve, reject) => {
            this.quoteRepo.getQuotesFilteredByStatus(filters)
                .then((result: any) => resolve(result))
                .catch((error: Error) => reject(error));

        });
    }

    updateQuote(quote: Quote) {
        return new Promise<Quote>((resolve, reject) => {
            this.quoteRepo.updateQuote(quote)
                .then((result: any) => {
                    this.buildQuoteUpdatedNotification(quote);
                    resolve(result);
                }).catch((error: Error) => reject(error));
        });
    }

    private updateQuoteCall(quoteId, callId) {
        this.callRepo.updateAppoitnemntQuotes(quoteId, callId).then((result: any) => {

            console.log('saved ');
        }).catch((error: Error) => console.log(error));
    }
    // getAppointmentFiltered(filters) {

    //     let fromDate = this.constructAppointmentDate(filters.date.from, filters.time.from);
    //     let toDate = filters.date.to == null ? null : this.constructAppointmentDate(filters.date.to, filters.time.to);
    //     return new Promise<Appointment[]>((resolve, reject) => {
    //         this.appointmentRepo.getAppointmentsFilteredByDatesAndStatusAndType(fromDate, toDate, filters.status, filters.typeIds)
    //             .then(results => {
    //                 let filteredAppointments = this.filterAppointmentsByTime(filters.time.from, filters.time.to, results);
    //                 return resolve(filteredAppointments);
    //             }).catch((error: Error) => reject(error));
    //     })
    // }



    // updateAppointmentStatusAndAssignees(appointment: Appointment) {
    //     return new Promise<Appointment>((resolve, reject) => {
    //         this.appointmentRepo.findById(appointment.id).then(oldAppointment => {
    //             let oldStatus = oldAppointment.status;
    //             let newStatus = appointment.status;
    //             if (oldAppointment.statusHistory.length != appointment.statusHistory.length) {
    //                 for (let status of appointment.statusHistory) {
    //                     if (status.id == null)
    //                         status.creationDate = new Date();
    //                 }
    //                 oldAppointment.statusHistory = appointment.statusHistory;
    //                 oldAppointment.status = this.getAppointmentCurrentStatus(oldAppointment.statusHistory);
    //             }
    //             let oldAssignees = oldAppointment.assigneeIds;
    //             let newAssignees = appointment.assigneeIds;
    //             oldAppointment.assigneeIds = appointment.assigneeIds;

    //             this.appointmentRepo.updateAppointment(oldAppointment).then(result => {
    //                 this.sendAppointmentUpdatedNotification(oldStatus, newStatus, oldAssignees, newAssignees, appointment);
    //                 resolve(result);
    //             }).catch((error: Error) => reject(error));
    //         }).catch((error: Error) => reject(error));
    //     });
    // }


    // region Private Methods

    private getQuoteCurrentStatus(statusHistory: any[]) {
        let sortedArr = statusHistory.sort((a, b) => {
            if (a.creationDate == b.creationDate) return 0;
            else if (a.creationDate > b.creationDate) return 1;
            else if (a.creationDate < b.creationDate) return -1;
        });

        return sortedArr[sortedArr.length - 1].status;
    }

    private validateQuote(quote: Quote) {
        let errors = [];

        if (quote.userId == null) {
            if (quote.customerInfo.email == null)
                errors.push('email type cann\'t be empty');
            if (quote.customerInfo.firstName == null)
                errors.push('first name type cann\'t be empty');
        }
        if (quote.typeId == null)
            errors.push('quote service cann\'t be empty');

        return errors;
    }

    private buildQuoteCreatedNotification(notifierIds, objectId) {
        let newNotification = new Notification();
        newNotification.message = config.notification.messages.quoteCreated;
        newNotification.notifierIds = notifierIds;
        newNotification.objectId = objectId;
        newNotification.objectType = ObjectType.Quote;
        newNotification.type = NotificationType.QuoteCreated;

        return new Promise<Notification>((resolve, reject) => {
            this.userRepo.getUsersByRoles([Role.Supervisor, Role.Admin, Role.SystemAdmin]).then(users => {
                let notifeesIds = [];
                for (let user of users)
                    notifeesIds.push(user.id);

                newNotification.notifees = notifeesIds.map(id => {
                    return { userId: id, seen: false }
                });
                return resolve(newNotification);
            }).catch((error: Error) => reject(error));
        });
    }

    private buildQuoteUpdatedNotification(quote: Quote) {

        let changedNotification = new Notification({
            message: config.notification.messages.quoteChanged,
            notifees: [],
            objectId: quote.id,
            objectType: ObjectType.Quote,
            type: NotificationType.QuoteChanged
        });

        let promise: Promise<any> = null;
        switch (quote.status) {
            case QuoteStatus.Pending:
                promise = new Promise<any>((resolve, reject) => {
                    quote.userId != null ? changedNotification.notifees.push({ userId: quote.userId, seen: false }) :
                        changedNotification.unregisterdEmail = quote.customerInfo.email;
                    resolve(true);
                });
                break;
            case QuoteStatus.Approved:
            case QuoteStatus.Rejected:
                promise = new Promise<any>((resolve, reject) => {
                    this.userRepo.getUsersByRoles([Role.Admin, Role.Supervisor, Role.SystemAdmin]).then(results => {
                        changedNotification.notifees = results.map(user => {
                            return { userId: user.id, seen: false };
                        });
                        resolve(true);
                    });
                });
                break;
        }

        if (!promise)
            return;

        promise.then((result: any) => {
            if (changedNotification.notifees && changedNotification.notifees.length > 0)
                return this.notificationManager.addNotification(changedNotification);
        })
            .catch((error: Error) => console.log(error));

    }

    // endregion private methods
}