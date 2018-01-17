import { BaseEntity } from './base/base-entity';
import { Role } from '../enums/role';
import { SocialMediaProvider } from '../enums/social-media-provider';
import { User } from './user';
import { AppointmentType } from './appointment-type';
import { QuoteStatus } from '../enums/quote-status';
import { StatusHistory } from './helpers/status-history';
import { Appointment } from '../domain-module';

export class Quote extends BaseEntity {

    creationDate: Date;
    // unregistered user
    customerInfo: {
        firstName: string,
        lastName: string,
        mobile: string,
        email: string,
        streetAddress: string,
        city: string,
        state:string,
        zipCode: string
    }
    userId?: string;
    siteId?: string;
    appointmentId?: string;
    typeId: string;
    message: string;
    status: QuoteStatus;
    statusHistory: StatusHistory[];
    relatedFileNames: string[];
    // navigational properties
    user?: User;
    type?: AppointmentType;
    appointment?: Appointment; 
    relatedFiles: any[];
    estimateFields: [{
        id?: string,
        desc: string,
        cost: number
    }];

    constructor(quote: any) {
        super();

        if (quote != null) {
            this.id = quote.id;
            this.creationDate = quote.creationDate;
            this.customerInfo = quote.customerInfo;
            this.userId = quote.userId;
            this.siteId = quote.siteId;
            this.appointmentId = quote.appointmentId;
            this.typeId = quote.typeId;
            this.message = quote.message;
            this.status = quote.status;
            this.user = quote.user;
            this.type = quote.type;
            this.relatedFileNames = quote.relatedFileNames;
            this.relatedFiles = quote.relatedFiles;
            this.estimateFields = quote.estimateFields == null ? [] : quote.estimateFields.map(f => {
                return {
                    id: f.id,
                    desc: f.desc,
                    cost: f.cost
                }
            });
            this.statusHistory = quote.statusHistory == null ? [] : quote.statusHistory.map(s => {
                return new StatusHistory({
                    id: s.id,
                    status: s.status,
                    creationDate: s.creationDate,
                    createdByUserId: s.createdByUserId,
                    createdBy: s.createdBy
                });
            });
        }

    }

    toLightModel() {
        return {
            id: this.id,
            creationDate: this.creationDate,
            customerInfo: this.customerInfo,
            userId: this.userId,
            siteId: this.siteId,
            appointmentId: this.appointmentId,
            typeId: this.typeId,
            message: this.message,
            status: this.status,
            user: this.user == null ? null : this.user.toLightModel(),
            type: this.type == null ? null : this.type.toLightModel(),
            appointment: this.appointment == null ? null : this.appointment.toLightModel(),
            statusHistory: this.statusHistory.map(s => s.toLightModel()),
            // images: this.images
            relatedFileNames: this.relatedFileNames,
            estimateFields: this.estimateFields      
        }
    }
}