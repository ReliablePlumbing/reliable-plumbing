import { Pipe, PipeTransform } from '@angular/core';
import { AppointmentStatus } from '../../models/enums';

@Pipe({
    name: 'CallStatusColor'
})

export class CallStatusColor implements PipeTransform {

    transform(status: AppointmentStatus) {
        switch (status) {
            case AppointmentStatus.Pending:
                return 'grayBg';
            case AppointmentStatus.Confirmed:
                return 'greenBg';
            case AppointmentStatus.Rejected:
                return 'redBg';
            case AppointmentStatus.Canceled:
                return 'yellowBg';
            case AppointmentStatus.Completed:
                return 'blueBg';
            default:
                break;
        }
    }
}

@Pipe({
    name: 'CallStatusTxt'
})
export class CallStatusTxt implements PipeTransform {

    transform(status: AppointmentStatus) {
        switch (status) {
            case AppointmentStatus.Pending:
                return 'Pending';
            case AppointmentStatus.Confirmed:
                return 'Confirmed';
            case AppointmentStatus.Rejected:
                return 'Rejected';
            case AppointmentStatus.Canceled:
                return 'Canceled';
            case AppointmentStatus.Completed:
                return 'Completed';
            default:
                break;
        }
    }
}
