import { BaseEntity }  from '../base/base-entity';
import { User } from '../user';
import { QuoteStatus } from '../../enums/quote-status';
import { AppointmentStatus } from '../../enums/appointment-status';
import { Role } from '../../enums/role';
import { SocialMediaProvider } from '../../enums/social-media-provider';
import { Permission } from '../../enums/permission';

export class StatusHistory extends BaseEntity {
    status: number;
    creationDate: Date;
    createdByUserId?: string;
    createdBy?: User // nav prop


    constructor(statusHistory: any) {
        super();

        if (statusHistory != null) {
            this.id = statusHistory.id;
            this.status = statusHistory.status;
            this.creationDate = statusHistory.creationDate;
            this.createdByUserId = statusHistory.createdByUserId;
            this.createdBy = statusHistory.createdBy;
        }
    }

    toLightModel() {
        return {
            id: this.id,
            status: this.status,
            creationDate: this.creationDate,
            createdByUserId: this.createdByUserId,
            createdBy: this.createdBy == null ? null : this.createdBy.toLightModel()
        }
    }
}