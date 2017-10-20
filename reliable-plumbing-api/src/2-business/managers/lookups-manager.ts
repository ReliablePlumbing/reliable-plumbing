import { AppError, ErrorType, AppointmentType, Notification, NotificationType } from '../../3-domain/domain-module';
import { AppointmentTypeRepo } from '../../4-data-access/data-access.module';
import { MailNotifierManager } from '../mail-notifier/mail-notifier-manager';
import { AccountSecurity, dependencies, TokenManager, ConfigService } from '../../5-cross-cutting/cross-cutting.module';
import { Inject, Service } from 'typedi';


@Service()
export class LookupsManager {

    @Inject(dependencies.AppointmentTypeRepo)
    private appointmentTypeRepo: AppointmentTypeRepo;


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
                    this.appointmentTypeRepo.add(appointmentType).then(addedType => resolve(addedType));
                });
            else
                this.appointmentTypeRepo.update(appointmentType).then(success => resolve(success));
        });
    }

    getAllAppointmentTypes() {
        return this.appointmentTypeRepo.getAllAppointments();
    }

    // endregion appointment types
}