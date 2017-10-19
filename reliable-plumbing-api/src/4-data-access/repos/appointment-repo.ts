import { Repo } from './repo';
import { appointmentSchema } from '../schemas/appointment-schema';
import { Appointment } from '../../3-domain/domain-module';
import { GenericModel } from '../models/model';


export class AppointmentRepo extends Repo<Appointment> {

    constructor() {
        super(appointmentSchema)
    }


}