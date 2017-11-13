import { Inject, Service } from 'typedi';
import { dependencies } from '../../5-cross-cutting/cross-cutting.module';
import { NotificationBroadcastingService } from '../notifiers/notification-broadcasting-service';
import { NotificationRepo } from '../../4-data-access/data-access.module';
import { Notification, NotificationType } from '../../3-domain/domain-module';

@Service()
export class NotificationManager {

    @Inject(dependencies.NotificationRepo)
    private notificationRepo: NotificationRepo;

    @Inject(dependencies.NotificationBroadcastingService)
    private notificationBroadcastingService: NotificationBroadcastingService;

    addNotification(notification: Notification) {

        notification.creationDate = new Date();
        notification.seen = false;

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
                notf.seen = false;
                this.notificationRepo.add(notf).then(result => {
                    this.notificationBroadcastingService.broadcast(result);
                }).catch((error: Error) => reject(error));
            }
            return resolve(true);
        });
    }
}