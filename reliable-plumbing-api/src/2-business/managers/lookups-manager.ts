import { AppError, ErrorType, AppointmentType, Notification, NotificationType, Settings } from '../../3-domain/domain-module';
import { AppointmentTypeRepo, SettingsRepo } from '../../4-data-access/data-access.module';
import { AccountSecurity, dependencies, TokenManager, ConfigService } from '../../5-cross-cutting/cross-cutting.module';
import { Inject, Service } from 'typedi';


@Service()
export class LookupsManager {

    @Inject(dependencies.AppointmentTypeRepo)
    private appointmentTypeRepo: AppointmentTypeRepo;

    @Inject(dependencies.SettingsRepo)
    private appointmentSettingsRepo: SettingsRepo;

    // region appointment types
    addEditAppointmentType(appointmentType: AppointmentType) {
        if (appointmentType == null)
            throw new Error('appointment type cann\'t be null');

        if (appointmentType.name == null || appointmentType.name.length == 0)
            throw new AppError('appointment type should have a name', ErrorType.validation);

        let isNew = appointmentType.id == null;
        if (isNew) {
            appointmentType.isDeleted = false;
            appointmentType.creationDate = new Date();
        }
        else
            appointmentType.lastModifiedDate = new Date();

        return new Promise<AppointmentType | boolean>((resolve, reject) => {

            if (isNew)
                this.appointmentTypeRepo.getLastPriority().then(lastPriority => {
                    appointmentType.priority = ++lastPriority;
                    this.appointmentTypeRepo.add(appointmentType)
                        .then(addedType => resolve(addedType))
                        .catch((error: Error) => reject(error));
                }).catch((error: Error) => reject(error));
            else
                this.appointmentTypeRepo.update(appointmentType)
                    .then(success => resolve(success))
                    .catch((error: Error) => reject(error));
        });
    }

    getAllAppointmentTypes() {
        return new Promise<AppointmentType[]>((resolve, reject) => {

            return this.appointmentTypeRepo.getAllAppointments()
                .then((result: AppointmentType[]) => resolve(result))
                .catch((error: Error) => reject(error));
        });
    }

    // endregion appointment types

    // region settings

    addEditAppointmentSettings(settings: Settings) {
        let isNew = settings.id == null;

        return new Promise<Settings | boolean>((resolve, reject) => {
            let promise;
            if (isNew)
                this.appointmentSettingsRepo.add(settings)
                    .then(result => resolve(result))
                    .catch((error: Error) => reject(error));
            else {
                settings.lastModifiedDate = new Date();
                this.appointmentSettingsRepo.findOneAndUpdate(settings)
                    .then(result => resolve(new Settings(result)))
                    .catch((error: Error) => reject(error));
            }
        });
    }

    getAppointmentSettings() {
        return new Promise<Settings>((resolve, reject) => {
            this.appointmentSettingsRepo.getSettings()
                .then(result => resolve(result))
                .catch((error: Error) => reject(error));
        });
    }

    // endregion settings

    getAppointmentSettingsAndTypes() {
        return new Promise<{ settings: Settings, types: AppointmentType[] }>((resolve, reject) => {
            Promise.all([this.getAppointmentSettings(), this.getAllAppointmentTypes()]).then((values) => {
                return resolve({
                    settings: values[0],
                    types: values[1]
                });
            }).catch((error: Error) => reject(error));
        });
    }
}