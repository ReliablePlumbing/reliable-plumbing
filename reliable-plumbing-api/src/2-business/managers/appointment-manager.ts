import { AppError, ErrorType, Appointment } from '../../3-domain/domain-module';
import { AppointmentRepo } from '../../4-data-access/data-access.module';
import { MailNotifierManager } from '../mail-notifier/mail-notifier-manager';
import { AccountSecurity, dependcies, TokenManager, ConfigService } from '../../5-cross-cutting/cross-cutting.module';
import { Inject, Service } from 'typedi';

@Service()
export class AppointmentManager {

    @Inject(dependcies.AppointmentRepo)
    private appointmentRepo: AppointmentRepo;

    addAppointment(appointment: Appointment) {
        if (appointment == null)
            throw new Error('appointment can\'t be null');

        // todo: validate availablilty
        let errors = this.validateAppointment(appointment);
        if (errors.length > 0)
            throw new AppError(errors, ErrorType.validation);

        // initialize appointment data creation date, initial status etc..
        appointment.creationDate = new Date();

        return new Promise<Appointment>((resolve, error) => {
            this.appointmentRepo.add(appointment).then(result => {

                return resolve(result);
            });

        });
    }

    private validateAppointment(appointment: Appointment) {
        let errors = [];

        if (appointment.userId == null) {
            if (appointment.email == null)
                errors.push('email type cann\'t be empty');
            if (appointment.fullName == null)
                errors.push('name type cann\'t be empty');
        }
        if (appointment.date == null)
            errors.push('appointment date cann\'t be empty');
        if (appointment.typeId == null)
            errors.push('appointment type cann\'t be empty');

        return errors;
    }
}