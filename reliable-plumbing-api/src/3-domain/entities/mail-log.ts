import { BaseEntity } from './base/base-entity';
import { MailStatus } from '../enums/mail-status';

export class MailLog extends BaseEntity {

    sendingDate: Date;
    from: string;
    to: string;
    subject: string;
    status: MailStatus;
    errorMessage?: string

    toLightModel() {
        return {
            sendingDate: this.sendingDate,
            from: this.from,
            to: this.to,
            subject: this.subject,
            status: this.status,
            errorMessage: this.errorMessage
        }
    }
}