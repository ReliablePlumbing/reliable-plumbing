import { BaseEntity } from './base/base-entity';

export class Settings extends BaseEntity {

    workDays: number[];
    workHours: {
        from: { hour: number, minute: number },
        to: { hour: number, minute: number }
    }
    timeSpan: number;
    lastModifiedDate?: Date;
    lastModifiedBy?: string;

    constructor(settings: any) {
        super();
        if (settings != null) {
            this.id = settings.id,
            this.workDays = settings.workDays;
            this.workHours = settings.workHours;
            this.timeSpan = settings.timeSpan;
            this.lastModifiedDate = settings.lastModifiedDate;
            this.lastModifiedBy = settings.lastModifiedBy;
        }
    }

    toLightModel() {
        return {
            id: this.id,
            workDays: this.workDays,
            workHours: this.workHours,
            timeSpan: this.timeSpan,
            lastModifiedDate: this.lastModifiedDate,
            lastModifiedBy: this.lastModifiedBy
        }
    }

}