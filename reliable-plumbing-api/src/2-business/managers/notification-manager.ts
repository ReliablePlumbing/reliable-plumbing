import { Inject, Service } from 'typedi';
import { dependencies } from '../../5-cross-cutting/cross-cutting.module';
import { NotificationBroadcastingService } from '../notifiers/notification-broadcasting-service';
import { NotificationRepo, AppointmentRepo, QuoteRepo } from '../../4-data-access/data-access.module';
import { Notification, NotificationType, ObjectType } from '../../3-domain/domain-module';

@Service()
export class NotificationManager {

    @Inject(dependencies.NotificationRepo) private notificationRepo: NotificationRepo;
    @Inject(dependencies.NotificationBroadcastingService) private notificationBroadcastingService: NotificationBroadcastingService;
    @Inject(dependencies.AppointmentRepo) private appointmentRepo: AppointmentRepo;
    @Inject(dependencies.QuoteRepo) private quoteRepo: QuoteRepo;

    addNotification(notification: Notification) {

        notification.notifees.forEach(notifee => notifee.seen = false);

        notification.creationDate = new Date();
        return new Promise<Notification>((resolve, reject) => {

            this.notificationRepo.add(notification).then(result => {
                this.notificationBroadcastingService.broadcast(result);
                return resolve(notification);
            }).catch((error: Error) => reject(error));
        });
    }

    addNotifications(notifications: Notification[]) {
        let creationDate = new Date();
        return new Promise<any>((resolve, reject) => {
            for (let notf of notifications) {
                notf.creationDate = creationDate;
                this.notificationRepo.add(notf).then(result => {
                    this.notificationBroadcastingService.broadcast(result);
                }).catch((error: Error) => reject(error));
            }
            return resolve(true);
        });
    }

    getUserNotifications(id) {
        return new Promise<Notification[]>((resolve, reject) => {
            this.notificationRepo.getNotificationsByNotifeeIds([id])
                .then((result) => resolve(result))
                .catch((error: Error) => reject(error));

        });
    }

    getNotificationObject(objectType: ObjectType, objectId: string) {

        return new Promise<any>((resolve, reject) => {

            switch (objectType) {
                case ObjectType.Appointment:
                    this.appointmentRepo.findById(objectId)
                        .then(result => resolve(result))
                        .catch((error: Error) => reject(error));
                    break;
                case ObjectType.Quote:
                    this.quoteRepo.findById(objectId)
                        .then(result => resolve(result))
                        .catch((error: Error) => reject(error));

                    break

                default:
                    break;
            }
        });
    }
}