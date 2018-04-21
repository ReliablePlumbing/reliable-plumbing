import { Inject, Service } from 'typedi';
import {
    AppError, ErrorType, Appointment, AppointmentStatus, NotificationType,
    Notification, ObjectType, Role, TechnicianStatus, User, StatusHistory
} from '../../3-domain/domain-module';
import { AppointmentRepo, UserRepo, QuoteRepo } from '../../4-data-access/data-access.module';
import { NotificationManager } from './notification-manager';
import { FilesManager } from './files-manager';
import { AccountSecurity, dependencies, TokenManager } from '../../5-cross-cutting/cross-cutting.module';
import * as moment from 'moment';
import config from '../../config';

@Service()
export class AppointmentManager {

    @Inject(dependencies.AppointmentRepo) private appointmentRepo: AppointmentRepo;
    @Inject(dependencies.QuoteRepo) private quoteRepo: QuoteRepo;
    @Inject(dependencies.UserRepo) private userRepo: UserRepo;
    @Inject(dependencies.NotificationManager) private notificationManager: NotificationManager;
    @Inject(dependencies.FilesManager) private filesManager: FilesManager;

    addAppointment(appointment: Appointment, images) {
        if (appointment == null)
            throw new Error('appointment can\'t be null');

        // todo: validate availablilty
        let errors = this.validateAppointment(appointment);
        if (errors.length > 0)
            throw new AppError(errors, ErrorType.validation);

        // initialize appointment data creation date, initial status etc..
        appointment.creationDate = new Date();
        appointment.status = AppointmentStatus.Pending;
        appointment.statusHistory = [new StatusHistory({
            status: AppointmentStatus.Pending,
            creationDate: new Date(),
            createdByUserId: appointment.userId
        })];
        appointment.relatedFileNames = this.filesManager.getImagesFilesNames(images);

        return new Promise<Appointment>((resolve, reject) => {
            this.appointmentRepo.add(appointment).then(result => {
                // update quotes if exists
                if (appointment.quoteIds)
                    this.updateQuoteWithAppointment(appointment.id, appointment.quoteIds);

                // add notification
                let notifier = appointment.userId == null ? [] : appointment.userId;
                this.buildAppointCreatedNotification([notifier], result.id)
                    .then(notification => this.notificationManager.addNotification(notification))
                    .catch((error: Error) => reject(error));

                // convert images to file system
                this.filesManager.moveFilesToObjectFolder(result.id, images);
                return resolve(result);
            }).catch((error: Error) => reject(error));

        });
    }

    getAppointmentFiltered(filters) {

        let fromDate = (filters.date && filters.date.from) ? this.constructAppointmentDate(filters.date.from, filters.time.from) : null;
        if (filters.time && filters.time.to.hour == 0 && filters.time.to.minute == 0)
            filters.time.to = { hour: 23, minute: 59 };
        let toDate = (filters.date && filters.date.to) ? this.constructAppointmentDate(filters.date.to, filters.time.to) : null;
        return new Promise<Appointment[]>((resolve, reject) => {
            this.appointmentRepo.getAppointmentsFilteredByDatesAndStatusAndType(fromDate, toDate, filters.status, filters.typeIds, filters.userIds)
                .then(results => {
                    let filteredAppointments = results;
                    if (filters.time)
                        filteredAppointments = this.filterAppointmentsByTime(filters.time.from, filters.time.to, results);
                    if (filters.customerName && filters.customerName.length > 0)
                        filteredAppointments = this.filterCallsByCustomerName(filters.customerName, filteredAppointments);
                    return resolve(filteredAppointments);
                }).catch((error: Error) => reject(error));
        })
    }

    getAssigneesAppointments(assigneeIds: string[], from?: Date, to?: Date) {
        return new Promise<Appointment[]>((resolve, reject) => {
            this.appointmentRepo.getAppointmentsFilteredByAssigneesAndDates(assigneeIds, from, to)
                .then(results => resolve(results))
                .catch((error: Error) => reject(error));
        });
    }

    getTechniciansWithStatusInTime(appointmentId: string) {
        return new Promise<{
            technician: User,
            status: TechnicianStatus,
            appointments: Appointment[]
        }[]>((resolve, reject) => {
            let appointmentPromise = this.appointmentRepo.findById(appointmentId);
            let usersPromise = this.userRepo.getUsersByRoles([Role.Technician]);
            Promise.all([appointmentPromise, usersPromise]).then(values => {
                let appointment = values[0];
                let technicians = values[1];

                // todo: get boundaries from settings
                let boundaryDates = this.getPossibleOverlappingDates(appointment.date, 4);
                let filterStatus = [AppointmentStatus.Pending, AppointmentStatus.Rejected, AppointmentStatus.Confirmed]
                let technicianIds = technicians.map(tech => tech.id);

                this.appointmentRepo.getAppointmentsFilteredByDatesAndStatusAndType(boundaryDates.from, boundaryDates.to, filterStatus, null)
                    .then(results => {
                        let techniciansWithAppointmentsAndStatus = [];

                        for (let technician of technicians) {
                            let technicianAppointments = results.filter(appoint => appoint.assigneeIds.findIndex(assignId => assignId == technician.id) != -1);

                            techniciansWithAppointmentsAndStatus.push({
                                technician: technician,
                                status: this.getTechnicianStatus(appointment, technicianAppointments),
                                appointments: technicianAppointments
                            });
                        }

                        return resolve(techniciansWithAppointmentsAndStatus);
                    }).catch((error: Error) => reject(error));
            });
        });
    }

    updateAppointmentStatusAndAssignees(appointment: Appointment) {
        return new Promise<Appointment>((resolve, reject) => {
            this.appointmentRepo.findById(appointment.id).then(oldAppointment => {
                let oldStatus = oldAppointment.status;
                let newStatus = appointment.status;
                if (oldAppointment.statusHistory.length != appointment.statusHistory.length) {
                    for (let status of appointment.statusHistory) {
                        if (status.id == null)
                            status.creationDate = new Date();
                    }
                    oldAppointment.statusHistory = appointment.statusHistory;
                    oldAppointment.status = this.getAppointmentCurrentStatus(oldAppointment.statusHistory);
                }
                let oldAssignees = oldAppointment.assigneeIds;
                let newAssignees = appointment.assigneeIds;
                oldAppointment.assigneeIds = appointment.assigneeIds;
                oldAppointment.rate = appointment.rate;

                this.appointmentRepo.updateAppointment(oldAppointment).then(result => {
                    this.sendAppointmentUpdatedNotification(oldStatus, newStatus, oldAssignees, newAssignees, appointment);
                    resolve(result);
                }).catch((error: Error) => reject(error));
            }).catch((error: Error) => reject(error));
        });
    }

    technicianCheckIn(checkInDetails) {
        if (checkInDetails.appointmentId == null)
            throw new Error('appointmentId can\'t be null');
        return new Promise((resolve, reject) => {
            this.appointmentRepo.findById(checkInDetails.appointmentId).then(appointment => {
                if (appointment == null)
                    throw new AppError('Appointment no longer exists', ErrorType.validation);

                appointment.checkInDetails = {
                    date: new Date(),
                    lat: checkInDetails.lat,
                    lng: checkInDetails.lng,
                    userId: checkInDetails.userId
                };

                this.appointmentRepo.update(appointment).then(success => {
                    if (success)
                        this.sendCheckInNotification(checkInDetails.appointmentId, checkInDetails.userId);

                    return resolve(success);
                }).catch((error: Error) => reject(error));
            }).catch((error: Error) => reject(error));
        });
    }

    // region Private Methods

    private getAppointmentCurrentStatus(statusHistory: any[]) {
        let sortedArr = statusHistory.sort((a, b) => {
            if (a.creationDate == b.creationDate) return 0;
            else if (a.creationDate > b.creationDate) return 1;
            else if (a.creationDate < b.creationDate) return -1;
        });

        return sortedArr[sortedArr.length - 1].status;
    }

    private getTechnicianStatus(appointment: Appointment, technicianAppointments: Appointment[]) {
        // todo: get interval from settings
        let possibleBusyInterval = 2;
        let boundary2HourDates = this.getPossibleOverlappingDates(appointment.date, 2);
        let boundary4HourDates = this.getPossibleOverlappingDates(appointment.date, 4);

        let status = TechnicianStatus.Available;
        for (let appoint of technicianAppointments) {
            if (appoint.date.getTime() == appointment.date.getTime()) {
                status = TechnicianStatus.Busy
                break;
            };
            if (appoint.date.getTime() >= boundary2HourDates.from.getTime() || appoint.date.getTime() <= boundary2HourDates.to.getTime())
                status = TechnicianStatus.PossibleBusy;
            if ((appoint.date.getTime() >= boundary4HourDates.from.getTime() && appoint.date.getTime() < boundary2HourDates.from.getTime()) ||
                appoint.date.getTime() <= boundary4HourDates.to.getTime() && appoint.date.getTime() > boundary2HourDates.to.getTime())
                status = TechnicianStatus.HardlyBusy;
        }

        return status;
    }

    private getPossibleOverlappingDates(date, interval) {

        let momentDate = moment(date);
        let from = momentDate.clone().add(-interval, 'hours');
        let to = momentDate.clone().add(interval, 'hours');

        return {
            from: new Date(from.toISOString()),
            to: new Date(to.toISOString())
        }
    }
    private filterAppointmentsByTime(from, to, appointments: Appointment[]) {
        let filteredAppointments = [];
        let toModified = {
            hour: to.hour == 0 ? 24 : to.hour,
            minute: to.minute
        }
        for (let appoint of appointments) {
            let appointHour = appoint.date.getHours();
            let appointMins = appoint.date.getMinutes();
            let isValid = true;

            if (appointHour < from.hour || appointHour > toModified.hour)
                isValid = false;
            if (appointHour == from.hour && appointMins < from.minute)
                isValid = false;
            if (appointHour == toModified.hour && appointMins > toModified.minute)
                isValid = false;

            if (isValid)
                filteredAppointments.push(appoint);
        }

        return filteredAppointments;
    }

    private filterCallsByCustomerName(customerName, calls) {
        if (!customerName && customerName.length == 0)
            return calls;

        customerName = customerName.replace(/\s/g, '').toLowerCase();
        if (customerName.length == 0)
            return calls;

        return calls.filter(call => {
            let customer = call.user ? call.user : call.customerInfo;
            let fullName = (customer.firstName + ' ' + (customer.lastName ? customer.lastName : '')).replace(/\s/g, '').toLowerCase();

            return fullName.indexOf(customerName) != -1;
        });
    }

    private validateAppointment(appointment: Appointment) {
        let errors = [];

        if (appointment.userId == null) {
            if (appointment.customerInfo.email == null)
                errors.push('email type cann\'t be empty');
            if (appointment.customerInfo.firstName == null)
                errors.push('first name type cann\'t be empty');
        }
        if (appointment.date == null)
            errors.push('appointment date cann\'t be empty');
        if (appointment.typeId == null)
            errors.push('appointment type cann\'t be empty');

        return errors;
    }

    private buildAppointCreatedNotification(notifierIds, objectId) {
        let newNotification = new Notification();
        newNotification.message = config.notification.messages.appointmentCreated;
        newNotification.notifierIds = notifierIds;
        newNotification.objectId = objectId;
        newNotification.objectType = ObjectType.Appointment;
        newNotification.type = NotificationType.AppointmentCreated;

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

    private constructAppointmentDate(date: string, time: { hour: number, minute: number }) {
        let returnDate = new Date(date);
        returnDate.setHours(time.hour);
        returnDate.setMinutes(time.minute);
        returnDate.setSeconds(0);

        return returnDate;
    }

    private sendAppointmentUpdatedNotification(oldStatus: AppointmentStatus, newStatus: AppointmentStatus,
        oldAssignees: string[], newAssignees: string[], appointment: Appointment) {
        let addedAssignees = [];
        let removedAssignees = [];
        let sameAssignees = [];

        for (let oldAssignee of oldAssignees) {
            let exists = false;
            for (let newAssignee of newAssignees)
                if (oldAssignee == newAssignee) {
                    exists = true; break;
                }
            exists ? sameAssignees.push(oldAssignee) : removedAssignees.push(oldAssignee);
        }
        for (let newAssignee of newAssignees) {
            let exists = false;
            for (let oldAssignee of oldAssignees)
                if (oldAssignee == newAssignee) {
                    exists = true; break;
                }
            if (!exists)
                addedAssignees.push(newAssignee);
        }

        let notifications = [];

        if (addedAssignees.length > 0)
            notifications.push(new Notification({
                message: config.notification.messages.assgineeAdded,
                notifees: addedAssignees.map(a => { return { userId: a, seen: false } }),
                objectId: appointment.id,
                objectType: ObjectType.Appointment,
                type: NotificationType.AssigneeAdded
            }));

        if (removedAssignees.length > 0)
            notifications.push(new Notification({
                message: config.notification.messages.assgineeRemoved,
                notifees: removedAssignees.map(a => { return { userId: a, seen: false } }),
                objectId: appointment.id,
                objectType: ObjectType.Appointment,
                type: NotificationType.AssigneeRemoved
            }));

        if (oldStatus != newStatus) {
            let changedNotification = new Notification({
                message: config.notification.messages.appointmentChanged,
                notifees: sameAssignees.map(a => { return { userId: a, seen: false } }),
                objectId: appointment.id,
                objectType: ObjectType.Appointment,
                type: NotificationType.AssigneeRemoved
            });
            appointment.userId != null ? changedNotification.notifees.push({ userId: appointment.userId, seen: false }) :
                changedNotification.unregisterdEmail = appointment.customerInfo.email;

            notifications.push(changedNotification);
        }

        this.notificationManager.addNotifications(notifications);
    }

    private updateQuoteWithAppointment(appointmentId, quoteIds) {
        this.quoteRepo.updateQuotesAppointment(quoteIds, appointmentId).then((result: any) => {

            console.log('saved ');
        }).catch((error: Error) => console.log(error));
    }

    sendCheckInNotification(appointmentId, notifierId) {
        let newNotification = new Notification();
        newNotification.message = config.notification.messages.appointmentCheckedIn;
        newNotification.notifierIds = [notifierId];
        newNotification.objectId = appointmentId;
        newNotification.objectType = ObjectType.Appointment;
        newNotification.type = NotificationType.AppointmentCheckedIn;

        this.userRepo.getUsersByRoles([Role.Supervisor]).then(users => {
            let notifeesIds = [];
            for (let user of users)
                notifeesIds.push(user.id);

            newNotification.notifees = notifeesIds.map(id => {
                return { userId: id, seen: false }
            });
            this.notificationManager.addNotification(newNotification);
        }).catch((error: Error) => console.log(error));;
    }
    // endregion private methods
}