import { Inject, Service } from 'typedi';
import {
    AppError, ErrorType, Appointment, AppointmentStatus, AppointmentType, NotificationType,
    Notification, ObjectType, Role, TechnicianStatus, User, StatusHistory
} from '../../3-domain/domain-module';
import { AppointmentRepo, UserRepo } from '../../4-data-access/data-access.module';
import { NotificationManager } from './notification-manager';
import { AccountSecurity, dependencies, TokenManager, ConfigService } from '../../5-cross-cutting/cross-cutting.module';
import * as moment from 'moment';

@Service()
export class AppointmentManager {

    @Inject(dependencies.AppointmentRepo)
    private appointmentRepo: AppointmentRepo;

    @Inject(dependencies.UserRepo)
    private userRepo: UserRepo;

    @Inject(dependencies.NotificationManager)
    private notificationManager: NotificationManager;

    addAppointment(appointment: Appointment) {
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
        return new Promise<Appointment>((resolve, error) => {
            this.appointmentRepo.add(appointment).then(result => {
                let notifier = appointment.userId == null ? [] : appointment.userId;
                this.buildAppointCreatedNotification(notifier, result.id)
                    .then(notification => this.notificationManager.addNotification(notification))
                return resolve(result);
            });

        });
    }

    getAppointmentFiltered(filters) {

        let fromDate = this.constructAppointemntDate(filters.date.from, filters.time.from);
        let toDate = filters.date.to == null ? null : this.constructAppointemntDate(filters.date.to, filters.time.to);
        return new Promise<Appointment[]>((resolve, reject) => {
            this.appointmentRepo.getAppointmentsFilteredByDatesAndStatusAndType(fromDate, toDate, filters.status, filters.typeIds).then(results => {

                let filteredAppointments = this.filterAppointmentsByTime(filters.time.from, filters.time.to, results);


                return resolve(filteredAppointments);
            })


        })
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
                let appointemnt = values[0];
                let technicians = values[1];

                // todo: get boundaries from settings
                let boundaryDates = this.getPossibleOverlappingDates(appointemnt.date, 4);
                let filterStatus = [AppointmentStatus.Pending, AppointmentStatus.NotAvailable, AppointmentStatus.Confirmed]
                let technicianIds = technicians.map(tech => tech.id);

                this.appointmentRepo.getAppointmentsFilteredByDatesAndStatusAndType(boundaryDates.from, boundaryDates.to, filterStatus, null)
                    .then(results => {
                        let techniciansWithAppointmentsAndStatus = [];

                        for (let technician of technicians) {
                            let technicianAppointments = results.filter(appoint => appoint.userId == technician.id);

                            techniciansWithAppointmentsAndStatus.push({
                                technician: technician,
                                status: this.getTechnicianStatus(appointemnt, technicianAppointments),
                                appointments: technicianAppointments
                            });
                        }

                        return resolve(techniciansWithAppointmentsAndStatus)

                    });
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

                this.appointmentRepo.updateAppointment(oldAppointment).then(result => {
                    this.sendAppointmentUpdatedNotification(oldStatus, newStatus, oldAssignees, newAssignees, appointment);
                    resolve(result);
                })
            });
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
            if (appoint.date == appoint.date) {
                status = TechnicianStatus.Busy
                break;
            };
            if (appoint.date >= boundary2HourDates.from || appoint.date <= boundary2HourDates.to)
                status = TechnicianStatus.PossibleBusy;
            if (status != TechnicianStatus.PossibleBusy && (appoint.date >= boundary4HourDates.from || appoint.date <= boundary4HourDates.to))
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
            h: to.h == 0 ? 24 : to.h,
            min: to.min
        }
        for (let appoint of appointments) {
            let appointHour = appoint.date.getHours();
            let appointMins = appoint.date.getMinutes();
            let isValid = true;

            if (appointHour < from.h || appointHour > toModified.h)
                isValid = false;
            if (appointHour == from.h && appointMins < from.min)
                isValid = false;
            if (appointHour == toModified.h && appointMins > toModified.min)
                isValid = false;

            if (isValid)
                filteredAppointments.push(appoint);
        }

        return filteredAppointments;
    }

    private validateAppointment(appointment: Appointment) {
        let errors = [];

        if (appointment.userId == null) {
            if (appointment.email == null)
                errors.push('email type cann\'t be empty');
            if (appointment.fullName == null)
                errors.push('name type cann\'t be empty');
        }
        if (appointment.date == null)
            errors.push('appointment date cann\'t be empty');
        if (appointment.typeId == null)
            errors.push('appointment type cann\'t be empty');

        return errors;
    }

    private buildAppointCreatedNotification(notifierIds, objectId) {
        let newNotification = new Notification();
        newNotification.message = ConfigService.config.notification.messages.appointmentCreated;
        newNotification.notifierIds = notifierIds;
        newNotification.objectId = objectId;
        newNotification.objectType = ObjectType.Appointment;
        newNotification.type = NotificationType.AppointmentCreated;

        return new Promise<Notification>((resolve, reject) => {
            this.userRepo.getUsersByRoles([Role.Manager]).then(users => {
                let notifeesIds = [];
                for (let user of users)
                    notifeesIds.push(user.id);

                newNotification.notifeeIds = notifeesIds;
                return resolve(newNotification);
            })
        })

    }

    private constructAppointemntDate(date: string, time: { h: number, min: number }) {
        let returnDate = new Date(date);
        returnDate.setHours(time.h);
        returnDate.setMinutes(time.min);
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
                message: ConfigService.config.notification.messages.assgineeAdded,
                notifeeIds: addedAssignees,
                objectId: appointment.id,
                objectType: ObjectType.Appointment,
                type: NotificationType.AssigneeAdded
            }));

        if (removedAssignees.length > 0)
            notifications.push(new Notification({
                message: ConfigService.config.notification.messages.assgineeRemoved,
                notifeeIds: removedAssignees,
                objectId: appointment.id,
                objectType: ObjectType.Appointment,
                type: NotificationType.AssigneeRemoved
            }));

        if (oldStatus != newStatus) {
            let changedNotification = new Notification({
                message: ConfigService.config.notification.messages.appointmentChanged,
                notifeeIds: sameAssignees,
                objectId: appointment.id,
                objectType: ObjectType.Appointment,
                type: NotificationType.AssigneeRemoved
            });
            appointment.userId != null ? changedNotification.notifeeIds.push(appointment.userId) :
                changedNotification.unregisterdEmail = appointment.email;

            notifications.push(changedNotification);
        }

        this.notificationManager.addNotifications(notifications);
    }
    // endregion private methods
}