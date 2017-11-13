import { Repo } from './repo';
import { notificationSchema } from '../schemas/notification-schema';
import { Notification, NotificationType } from '../../3-domain/domain-module';
import { GenericModel } from '../models/model';

export class NotificationRepo extends Repo<Notification> {

    constructor() {
        super(notificationSchema)
    }

    getNotificationsByNotifeeIds(ids: string[]) {
        return new Promise<Notification[]>((resolve, reject) => {
            let model = this.createSet();
            model.find().elemMatch('notifees', { userId: { $in: ids } }).exec((err, results) => {
                if (err != null)
                    return reject(err);
                return resolve(this.mapModelsToEntities(results))
            })

        });
    }

    private mapModelsToEntities(notificationModels: GenericModel<Notification>[]) {
        if (notificationModels == null)
            return [];
        let notifications = [];
        for (let notificationModel of notificationModels)
            notifications.push(this.mapModelToEntity(notificationModel));

        return notifications;
    }

    private mapModelToEntity(notificationModel: GenericModel<Notification>) {
        if (notificationModel == null)
            return null;
        let obj: any = notificationModel.toObject({ transform: Object });
        let notification = new Notification(obj);

        return notification;
    }

}