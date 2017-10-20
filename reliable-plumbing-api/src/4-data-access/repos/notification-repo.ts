import { Repo } from './repo';
import { notificationSchema } from '../schemas/notification-schema';
import { Notification, NotificationType } from '../../3-domain/domain-module';
import { GenericModel } from '../models/model';

export class NotificationRepo extends Repo<Notification> {

    constructor() {
        super(notificationSchema)
    }

    

}