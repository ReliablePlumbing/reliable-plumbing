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

        return new Promise<Appointment[]>((resolve, reject) => {

            model.find(filterObj).populate('userId').exec((err, results) => {
                if (err != null)
                    return reject(err);

                return resolve(this.mapModelToEntities(results));
            });
        });
    }

    findById(id) {
        let model = this.createSet();
        return new Promise<Appointment>((resolve, reject) => {
            model.findById(id, (err, result) => {
                if (err != null)
                    return reject(err);

                return resolve(this.mapModelToEntity(result));
            });
        });
    }

    // getAppointmentsFiltredByStatusAndDate(status: AppointmentStatus[], from, date){
    //     let model = this.createSet();
    //     return new Promise((resolve, reject) => {
    //         model.find({})

    //     });

    // }

    private mapModelToEntity(appointmentModel: GenericModel<Appointment>) {
        let obj: any = appointmentModel.toObject({ transform: Object });
        let appointment = new Appointment(obj);
        if (obj.userId != null && typeof obj.userId == 'object') {
            appointment.user = new User(obj.userId);
            appointment.userId = appointment.user.id;
        }
        else
            appointment.userId = obj.userId;

        return appointment;
    }

    private mapModelToEntities(appointmentModels: GenericModel<Appointment>[]) {
        let appointments = [];
        for (let appointmentModel of appointmentModels)
            appointments.push(this.mapModelToEntity(appointmentModel));

        return appointments;
    }

}