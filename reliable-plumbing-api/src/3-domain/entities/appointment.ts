import { BaseEntity } from './base/base-entity';
import { AppointmentStatus } from '../enums/appointment-status';

export class Appointment extends BaseEntity {

    creationDate: Date;
    fullName: string;
    email?: string;
    mobile?: string;
    userId?: string;
    date: Date;
    typeId: string;
    status: AppointmentStatus;

    constructor(appointment: any) {
        super();

        this.id = appointment.id;
        this.creationDate = appointment.creationDate;
        this.fullName = appointment.fullName;
        this.email = appointment.email;
        this.mobile = appointment.mobile;
        this.userId = appointment.userId;
        this.date = appointment.date;
        this.typeId = appointment.typeId;
        this.status = appointment.status;
    }

    toLightModel() {
        return {
            id: this.id,
            creationDate: this.creationDate,
            fullName: this.fullName,
            email: this.email,
            mobile: this.mobile,
            userId: this.userId,
            date: this.date,
            typeId: this.typeId,
            status: this.status
        }
    }
}