import { Inject, Service } from 'typedi';
import {
    AppError, ErrorType, Appointment, QuoteStatus, NotificationType,
    Notification, ObjectType, Role, TechnicianStatus, User, StatusHistory, Quote
} from '../../3-domain/domain-module';
import { QuoteRepo, UserRepo } from '../../4-data-access/data-access.module';
import { NotificationManager } from './notification-manager';
import { FilesManager } from './files-manager';
import { AccountSecurity, dependencies, TokenManager } from '../../5-cross-cutting/cross-cutting.module';
import * as moment from 'moment';
import config from '../../config';

@Service()
export class QuoteManager {

    @Inject(dependencies.QuoteRepo) private quoteRepo: QuoteRepo;
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
       quote.status = QuoteStatus.Pending;
       quote.statusHistory = [new StatusHistory({
            status: QuoteStatus.Pending,
            creationDate: new Date(),
            createdByUserId: quote.userId
        })];
        quote.relatedFileNames = this.filesManager.getImagesFilesNames(images);

        return new Promise<Quote>((resolve, reject) => {
            this.quoteRepo.add(quote).then(result => {
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
        newNotification.message = config.notification.messages.appointmentCreated;
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

    // private sendAppointmentUpdatedNotification(oldStatus: AppointmentStatus, newStatus: AppointmentStatus,
    //     oldAssignees: string[], newAssignees: string[], appointment: Appointment) {
    //     let addedAssignees = [];
    //     let removedAssignees = [];
    //     let sameAssignees = [];

    //     for (let oldAssignee of oldAssignees) {
    //         let exists = false;
    //         for (let newAssignee of newAssignees)
    //             if (oldAssignee == newAssignee) {
    //                 exists = true; break;
    //             }
    //         exists ? sameAssignees.push(oldAssignee) : removedAssignees.push(oldAssignee);
    //     }
    //     for (let newAssignee of newAssignees) {
    //         let exists = false;
    //         for (let oldAssignee of oldAssignees)
    //             if (oldAssignee == newAssignee) {
    //                 exists = true; break;
    //             }
    //         if (!exists)
    //             addedAssignees.push(newAssignee);
    //     }

    //     let notifications = [];

    //     if (addedAssignees.length > 0)
    //         notifications.push(new Notification({
    //             message: config.notification.messages.assgineeAdded,
    //             notifees: addedAssignees.map(a => { return { userId: a, seen: false } }),
    //             objectId: appointment.id,
    //             objectType: ObjectType.Appointment,
    //             type: NotificationType.AssigneeAdded
    //         }));

    //     if (removedAssignees.length > 0)
    //         notifications.push(new Notification({
    //             message: config.notification.messages.assgineeRemoved,
    //             notifees: removedAssignees.map(a => { return { userId: a, seen: false } }),
    //             objectId: appointment.id,
    //             objectType: ObjectType.Appointment,
    //             type: NotificationType.AssigneeRemoved
    //         }));

    //     if (oldStatus != newStatus) {
    //         let changedNotification = new Notification({
    //             message: config.notification.messages.appointmentChanged,
    //             notifees: sameAssignees.map(a => { return { userId: a, seen: false } }),
    //             objectId: appointment.id,
    //             objectType: ObjectType.Appointment,
    //             type: NotificationType.AssigneeRemoved
    //         });
    //         appointment.userId != null ? changedNotification.notifees.push({ userId: appointment.userId, seen: false }) :
    //             changedNotification.unregisterdEmail = appointment.customerInfo.email;

    //         notifications.push(changedNotification);
    //     }

    //     this.notificationManager.addNotifications(notifications);
    // }

    // endregion private methods
}