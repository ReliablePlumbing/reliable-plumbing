import { BaseEntity } from './base/base-entity';

export class AppointmentType extends BaseEntity {

    name: string;
    description?: string;
    priority: number;
    creationDate: Date;
    createdBy: string;
    lastModifiedDate?: Date;
    lastModifiedBy?: Date;
    isDeleted: boolean;

    constructor(appointmentType?: any) {
        super();
        if (appointmentType != null) {
            this.id = appointmentType.id;
            this.name = appointmentType.name;
            this.description = appointmentType.description;
            this.priority = appointmentType.priority;
            this.creationDate = appointmentType.creationDate;
            this.createdBy = appointmentType.createdBy;
            this.lastModifiedDate = appointmentType.lastModifiedDate;
            this.lastModifiedBy = appointmentType.lastModifiedBy;
            this.isDeleted = appointmentType.isDeleted;
        }
    }

    toLightModel() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            priority: this.priority,
            creationDate: this.creationDate,
            createdBy: this.createdBy,
            lastModifiedDate: this.lastModifiedDate,
            lastModifiedBy: this.lastModifiedBy,
            isDeleted: this.isDeleted
        }
    }
}