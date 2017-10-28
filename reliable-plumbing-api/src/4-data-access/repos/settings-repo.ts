import { Repo } from './repo';
import { settingsSchema } from '../schemas/settings.schema';
import { Settings } from '../../3-domain/domain-module';
import { GenericModel } from '../models/model';


export class SettingsRepo extends Repo<Settings> {

    constructor() {
        super(settingsSchema)
    }

    getSettings() {
        return new Promise<Settings>((resolve, reject) => {
            let model = this.createSet();

            model.findOne({}, (err, result) => {
                if (result == null)
                    return resolve(null);
                return resolve(new Settings(result.toObject({ transform: Object })));
            })
        });
    }
}