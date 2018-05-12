import { AppointmentStatus, QuoteStatus } from "../models/enums";

export function isCallOpened(call){
    let status = call.status;

    return call.status === AppointmentStatus.Confirmed ||  call.status === AppointmentStatus.Pending;
}

export function isQuoteOpen(quote){
    let status = quote.status;

    return quote.status === QuoteStatus.Open ||  quote.status === QuoteStatus.Pending;
}

export function getCustomerFullName(call){
    let customer = call.user ? call.user : call.customerInfo;

    return customer.firstName + ' ' + (customer.lastName ? customer.lastName : '');
}

