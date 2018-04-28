import { Pipe, PipeTransform } from '@angular/core';
import { AppointmentStatus, QuoteStatus } from '../../models/enums';

@Pipe({
    name: 'QuoteStatusColor'
})

export class QuoteStatusColor implements PipeTransform {

    transform(status: QuoteStatus) {
        switch (status) {
            case QuoteStatus.Open:
                return 'grayBg';
            case QuoteStatus.Pending:
                return 'yellowBg';
            case QuoteStatus.Approved:
                return 'greenBg';
            case QuoteStatus.Rejected:
                return 'redBg';
            case QuoteStatus.Closed:
                return 'blueBg';
            default:
                break;
        }
    }
}

@Pipe({
    name: 'QuoteStatusTxt'
})
export class QuoteStatusTxt implements PipeTransform {

    transform(status: QuoteStatus) {
        switch (status) {
            case QuoteStatus.Open:
                return 'Open';
            case QuoteStatus.Pending:
                return 'Pending';
            case QuoteStatus.Approved:
                return 'Approved';
            case QuoteStatus.Rejected:
                return 'Rejected';
            case QuoteStatus.Closed:
                return 'Closed';
        }
    }
}
