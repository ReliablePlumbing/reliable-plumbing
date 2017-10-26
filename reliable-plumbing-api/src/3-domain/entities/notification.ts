import { BaseEntity } from './base/base-entity';
import { NotificationType } from '../enums/notification-type';
import { ObjectType } from '../enums/object-type';

export class Notification extends BaseEntity {

    creationDate: Date;
    type: NotificationType;
    message: string;
    notifeeIds: string[];
    notifierIds: string[];
    seen: boolean;
    seenDate: Date;
    objectType?: ObjectType;
    objectId?: string;
    unregisterdEmail?: string;

    constructor(notification?: any) {
        super();
        if (notification != null) {
            this.creationDate = notification.creationDate;
            this.type = notification.type;
            this.message = notification.message;
            this.notifeeIds = notification.notifeeIds;
            this.notifierIds = notification.notifierIds;
            this.seen = notification.seen;
            this.seenDate = notification.seenDat;
            this.objectType = notification.objectType;
            this.objectId = notification.objectId;
        }
        if (this.notifeeIds == null)
            this.notifeeIds = [];
        if (this.notifierIds == null)
            this.notifierIds = []
    }


    toLightModel() {
        return {
            creationDate: this.creationDate,
            type: this.type,
            message: this.message,
            seen: this.seen,
            seenDate: this.seenDate,
            objectType: this.objectType,
            objectId: this.objectId
        }
    }

}