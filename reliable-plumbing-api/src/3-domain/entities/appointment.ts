import { BaseEntity } from './base/base-entity';
import { AppointmentStatus } from '../enums/appointment-status';
import { Role } from '../enums/role';
import { SocialMediaProvider } from '../enums/social-media-provider';
import { User } from './user';
import { AppointmentType } from './appointment-type';
import { StatusHistory } from './helpers/status-history';
import { Quote } from '../domain-module';

export class Appointment extends BaseEntity {

    creationDate: Date;
    // unregistered user
    customerInfo: {
        firstName: string,
        lastName: string,
        mobile: string,
        email: string,
        street: string,
        city: string,
        state:string,
        zipCode: string
    }
    userId?: string;
    siteId?: string;
    rate?: number;
    date: Date;
    typeId: string;
    quoteId?: string;
    message: string;
    status: AppointmentStatus;
    statusHistory: StatusHistory[];
    assigneeIds?: string[];
    checkInDetails: {
        date: Date,
        lat: number,
        lng: number,
        userId: string,
        user?: User
    };
    relatedFileNames: string[];
    // navigational properties
    user?: User;
    assignees?: User[];
    type?: AppointmentType;
    relatedFiles: any[];
    quote?: Quote; 

    constructor(appointment: any) {
        super();

        if (appointment != null) {
            this.id = appointment.id;
            this.creationDate = appointment.creationDate;
            this.customerInfo = appointment.customerInfo;
            this.userId = appointment.userId;
            this.siteId = appointment.siteId;
            this.quoteId = appointment.quoteId;
            this.rate = appointment.rate;
            this.date = appointment.date;
            this.typeId = appointment.typeId;
            this.message = appointment.message;
            this.status = appointment.status;
            this.assigneeIds = appointment.assigneeIds;
            this.user = appointment.user;
            this.type = appointment.type;
            this.checkInDetails = appointment.checkInDetails;
            this.relatedFileNames = appointment.relatedFileNames;
            this.relatedFiles = appointment.relatedFiles;
            this.statusHistory = appointment.statusHistory == null ? [] : appointment.statusHistory.map(s => {
                return new StatusHistory({
                    id: s.id,
                    status: s.status,
                    creationDate: s.creationDate,
                    createdByUserId: s.createdByUserId,
                    createdBy: s.createdBy
                });
            });
        }

        if (this.assigneeIds == null)
            this.assigneeIds = [];
        if (this.statusHistory == null)
            this.statusHistory = [];
    }

    toLightModel() {
        return {
            id: this.id,
            creationDate: this.creationDate,
            customerInfo: this.customerInfo,
            userId: this.userId,
            siteId: this.siteId,
            quoteId: this.quoteId,
            date: this.date,
            typeId: this.typeId,
            rate: this.rate,
            message: this.message,
            status: this.status,
            user: this.user == null ? null : this.user.toLightModel(),
            type: this.type == null ? null : this.type.toLightModel(),
            quote: this.quote == null ? null : this.quote.toLightModel(),
            statusHistory: this.statusHistory.map(s => s.toLightModel()),
            assigneeIds: this.assigneeIds,
            assignees: this.assignees == null ? null : this.assignees.map(a => a.toLightModel()),
            checkInDetails: this.mapCheckInDetails(this.checkInDetails),
            // images: this.images
            relatedFileNames: this.relatedFileNames
        }
    }

    mapCheckInDetails(checkin){
        if(checkin == null)
            return null;

        return {
            date: checkin.date,
            lat: checkin.lat,
            lng: checkin.lng,
            userId: checkin.userId,
            user: checkin.user == null ? null : checkin.user.toLightModel()
        }
    }
}