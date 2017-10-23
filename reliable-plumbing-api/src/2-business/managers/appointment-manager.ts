import { Inject, Service } from 'typedi';
import {
    AppError, ErrorType, Appointment, AppointmentStatus, AppointmentType, NotificationType,
    Notification, ObjectType, Role
} from '../../3-domain/domain-module';
import { AppointmentRepo, UserRepo } from '../../4-data-access/data-access.module';
import { NotificationManager } from './notification-manager';
import { AccountSecurity, dependencies, TokenManager, ConfigService } from '../../5-cross-cutting/cross-cutting.module';

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
        let toDate = this.constructAppointemntDate(filters.date.to, filters.time.to);
        return new Promise<Appointment[]>((resolve, reject) => {
            this.appointmentRepo.getAppointmentsFilteredByDatesAndStatusAndType(fromDate, toDate, filters.status, filters.types).then(results => {



                return resolve(results);
            })


        })
    }

    // region Private Methords
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
    // endregion private methods
}