import { Repo } from './repo';
import { appointmentTypeSchema } from '../schemas/appointment-type-schema';
import { AppointmentType } from '../../3-domain/domain-module';
import { GenericModel } from '../models/model';


export class AppointmentTypeRepo extends Repo<AppointmentType> {

    constructor() {
        super(appointmentTypeSchema)
    }

    getLastPriority() {
        return new Promise<number>((resolve, reject) => {
            let model = this.createSet();

            model.findOne().sort('-priority').then((result) => {
                if (result == null)
                    return resolve(0);
                else
                    return resolve(new AppointmentType(result.toObject({ transform: Object })).priority);
            }).catch((error: Error) => reject(error));
        });
    }

    getAllAppointments() {
        return new Promise<AppointmentType[]>((resolve, reject) => {
            let model = this.createSet();

            model.find({ isDeleted: false }, (err, results) => {
                if (err != null)
                    return reject(err);
                let types = [];
                for (let typeModel of results) {
                    let type = new AppointmentType(typeModel.toObject({ transform: Object }));
                    types.push(type);
                }
                return resolve(types);
            });
        });

    }
}