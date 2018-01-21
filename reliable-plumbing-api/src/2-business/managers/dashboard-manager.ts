import { Inject, Service } from 'typedi';
import {
    AppError, ErrorType, Appointment, QuoteStatus, NotificationType,
    Notification, ObjectType, Role, TechnicianStatus, User, StatusHistory, Quote, AppointmentStatus
} from '../../3-domain/domain-module';
import { QuoteRepo, UserRepo, AppointmentRepo, SettingsRepo } from '../../4-data-access/data-access.module';
import { NotificationManager } from './notification-manager';
import { FilesManager } from './files-manager';
import { AccountSecurity, dependencies, TokenManager } from '../../5-cross-cutting/cross-cutting.module';
import * as moment from 'moment';
import config from '../../config';
import { LookupsManager } from '../business.module';

@Service()
export class DashboardManager {

    @Inject(dependencies.QuoteRepo) private quoteRepo: QuoteRepo;
    @Inject(dependencies.LookupsManager) private lookupsManager: LookupsManager;
    @Inject(dependencies.AppointmentRepo) private callsRepo: AppointmentRepo;
    @Inject(dependencies.UserRepo) private userRepo: UserRepo;
    @Inject(dependencies.NotificationManager) private notificationManager: NotificationManager;


    async getServicesStats() {
        let calls = await this.callsRepo.getAppointmentsFilteredByDatesAndStatusAndType(null, null, [AppointmentStatus.Completed]);
        let services = await this.lookupsManager.getAllAppointmentTypes();

        let servicesDic = {};
        services.forEach(s => {
            servicesDic[s.id] = s;
            servicesDic[s.id].callsCount = 0;
        });

        for (let call of calls) {
            if (call.typeId)
                servicesDic[call.typeId].callsCount++;
            else if (call.quote && call.quote.typeId)
                servicesDic[call.quote.typeId].callsCount++;

        }

        let servicesStats = [];
        for (let serviceId in servicesDic)
            servicesStats.push(servicesDic[serviceId]);

        return servicesStats;
    }

}