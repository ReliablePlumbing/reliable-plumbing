import { Repo } from './repo';
import { appointmentSchema } from '../schemas/appointment-schema';
import { Appointment, AppointmentStatus, User } from '../../3-domain/domain-module';
import { GenericModel } from '../models/model';


export class AppointmentRepo extends Repo<Appointment> {

    constructor() {
        super(appointmentSchema)
    }

    getAppointmentsFilteredByDatesAndStatusAndType(from: Date, to: Date, status: AppointmentStatus[], typeids: string[]) {
        let model = this.createSet();

        let filterObj: any = {
            date: { $gt: from },
        };
        if (to != null)
            filterObj.date.$lt = to;
        if (status != null && status.length > 0)
            filterObj.status = { $in: status };
        if (typeids != null && typeids.length > 0)
            filterObj.typeId = { $in: typeids }; 

        return new Promise<any>((resolve, reject) => {

            model.find(filterObj).populate('userId').exec((err, results) => {
                if (err != null)
                    return reject(err);

                return resolve(this.mapModelToEntities(results));
            });
        });
    }

    private mapModelToEntity(appointmentModel: GenericModel<Appointment>) {
        let obj: any = appointmentModel.toObject({ transform: Object });
        let appointment = new Appointment(obj);
        if (obj.userId != null) {
            appointment.user = new User(obj.userId);
            appointment.userId = appointment.user.id;
        }

        return appointment;
    }

    private mapModelToEntities(appointmentModels: GenericModel<Appointment>[]) {
        let appointments = [];
        for (let appointmentModel of appointmentModels)
            appointments.push(this.mapModelToEntity(appointmentModel));

        return appointments;
    }

}