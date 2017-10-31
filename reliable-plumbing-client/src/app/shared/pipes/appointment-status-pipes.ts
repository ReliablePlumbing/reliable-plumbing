import { Pipe, PipeTransform } from '@angular/core';
import { AppointmentStatus } from '../../models/enums';

@Pipe({
    name: 'appointmentStatusColor'
})

export class AppointmentStatusColor implements PipeTransform {

    transform(status: AppointmentStatus) {
        switch (status) {
            case AppointmentStatus.Pending:
                return 'pending'
            case AppointmentStatus.Confirmed:
                return 'confirmed'
            case AppointmentStatus.NotAvailable:
                return 'not-available'
            case AppointmentStatus.Rejected:
                return 'rejected'
            case AppointmentStatus.Canceled:
                return ''
            case AppointmentStatus.Rescheduled:
                return ''
            default:
                break;
        }
    }
}

@Pipe({
    name: 'appointmentStatusTxt'
})
export class AppointmentStatusTxt implements PipeTransform {

    transform(status: AppointmentStatus) {
        switch (status) {
            case AppointmentStatus.Pending:
                return 'Pending'
            case AppointmentStatus.Confirmed:
                return 'Confirmed'
            case AppointmentStatus.NotAvailable:
                return 'Not Available'
            case AppointmentStatus.Rejected:
                return 'Rejected'
            case AppointmentStatus.Canceled:
                return ''
            case AppointmentStatus.Rescheduled:
                return ''
            default:
                break;
        }
    }
}
