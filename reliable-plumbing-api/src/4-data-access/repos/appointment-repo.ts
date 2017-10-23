import { Repo } from './repo';
import { appointmentSchema } from '../schemas/appointment-schema';
import { Appointment, AppointmentStatus } from '../../3-domain/domain-module';
import { GenericModel } from '../models/model';


export class AppointmentRepo extends Repo<Appointment> {

    constructor() {
        super(appointmentSchema)
    }

    getAppointmentsFilteredByDatesAndStatusAndType(from: Date, to: Date, status: AppointmentStatus[], typeids: string[]) {
        let model = this.createSet();

        let filterObj: any = {
            date: { $gt: from, $lt: to },
        };
        if (status != null && status.length > 0)
            filterObj.status = { $in: status };
        if (typeids != null && typeids.length > 0)
            filterObj.typeId = { $in: typeids };

        return new Promise<any>((resolve, reject) => {

            model.find(filterObj
            //     , (err, results) => {
            //     let appointments = [];
            //     for (let appointmentModel of results)
            //         appointments.push(new Appointment(appointmentModel.toObject({ transform: Object })));

            //     return resolve(appointments);
            // }
        ).populate('users').exec((err, results)=> {
           console.log(results);
           resolve(results) 
        });
        });
    }

}