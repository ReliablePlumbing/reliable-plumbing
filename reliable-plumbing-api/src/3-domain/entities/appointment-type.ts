import { Role } from '../enums/role';
import { BaseEntity } from './base/base-entity';

export class AppointmentType extends BaseEntity {

    name: string;
    description: string;
    priority: number;

    constructor(appointmentType?: any) {
        super();
        if (appointmentType != null) {
            this.id = appointmentType.id;
            this.name = appointmentType.name;
            this.description = appointmentType.description;
            this.priority = appointmentType.priority;
        }
    }

    toLightModel() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            priority: this.priority,
        }
    }
}