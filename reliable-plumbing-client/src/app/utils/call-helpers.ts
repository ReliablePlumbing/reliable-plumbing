import { AppointmentStatus } from "../models/enums";

export function isCallOpened(call){
    let status = call.status;

    return call.status === AppointmentStatus.Confirmed;
}