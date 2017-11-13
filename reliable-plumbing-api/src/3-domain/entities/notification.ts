import { BaseEntity } from './base/base-entity';
import { NotificationType } from '../enums/notification-type';
import { ObjectType } from '../enums/object-type';

export class Notification extends BaseEntity {

    creationDate: Date;
    type: NotificationType;
    message: string;
    notifees: {
        userId: string,
        seen: boolean,
        seenDate?: Date
    }[];
    notifierIds: string[];
    objectType?: ObjectType;
    objectId?: string;
    object?: any;
    unregisterdEmail?: string;

    constructor(notification?: any) {
        super();
        if (notification != null) {
            this.creationDate = notification.creationDate;
            this.type = notification.type;
            this.message = notification.message;
            this.notifees = notification.notifees == null ? null : notification.notifees.map(notifee => {
                return {
                    userId: notifee.userId,
                    seen: notifee.seen,
                    seenDate: notifee.seenDate
                };
            });
            this.notifierIds = notification.notifierIds;
            this.objectType = notification.objectType;
            this.objectId = notification.objectId;
        }
        if (this.notifees == null)
            this.notifees = [];
        if (this.notifierIds == null)
            this.notifierIds = []
    }


    toLightModel() {
        return {
            creationDate: this.creationDate,
            type: this.type,
            message: this.message,
            objectType: this.objectType,
            objectId: this.objectId,
            notifees: this.notifees,
            object: this.object
        }
    }

}