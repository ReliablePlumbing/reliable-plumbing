import { Repo } from './repo';
import { appointmentSettingsSchema } from '../schemas/appointment-settings.schema';
import { AppointmentSettings } from '../../3-domain/domain-module';
import { GenericModel } from '../models/model';


export class AppointmentSettingsRepo extends Repo<AppointmentSettings> {

    constructor() {
        super(appointmentSettingsSchema)
    }

    getSettings() {
        return new Promise<AppointmentSettings>((resolve, reject) => {
            let model = this.createSet();

            model.findOne({}, (err, result) => {
                if (result == null)
                    return resolve(null);
                return resolve(new AppointmentSettings(result.toObject({ transform: Object })));
            })
        });
    }
}