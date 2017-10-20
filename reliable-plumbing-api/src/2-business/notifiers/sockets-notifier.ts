import { Service, Inject, Container } from 'typedi';
import { NotificationBroadcastingService } from './notification-broadcasting-service';
import { SocketContext, ConfigService } from '../../5-cross-cutting/cross-cutting.module';
import { Notification, NotificationType } from '../../3-domain/domain-module';

@Service()
export class SocketsNotifier {

    constructor(broadcastingService: NotificationBroadcastingService) {
        broadcastingService.notificationBroadcasted.subscribe((notification: Notification) => {
            this.handleBroadcast(notification);
        })
    }


    handleBroadcast(notification: Notification) {
        let notificationsEvent = ConfigService.config.socketsSettings.notificationsEvent;
        let asd = SocketContext.connections;
        for (let id of notification.notifeeIds)
            SocketContext.connections[id].emit(notificationsEvent, notification.toLightModel());

    }

}
