import { BaseEntity } from './base/base-entity';
import { ObjectType, User, Role, Permission, SocialMediaProvider } from '../domain-module';

export class Comment extends BaseEntity {

    objectType: ObjectType;
    objectId: string;
    creationDate: Date;
    userId: string;
    lastModifiedDate?: Date;
    isDeleted: boolean;
    text: string;

    // navigation props
    user?: User;

    constructor(comment?: any) {
        super();
        if (comment != null) {
            this.id = comment.id;
            this.objectId = comment.objectId;
            this.creationDate = comment.creationDate;
            this.userId = comment.userId;
            this.lastModifiedDate = comment.lastModifiedDate;
            this.isDeleted = comment.isDeleted;
            this.text = comment.text;
        }
    }

    toLightModel() {
        return {
            id: this.id,
            objectId: this.objectId,
            creationDate: this.creationDate,
            userId: this.userId,
            lastModifiedDate: this.lastModifiedDate,
            isDeleted: this.isDeleted,
            text: this.text,
            user: this.user ? this.user.toLightModel() : null
        }
    }
}