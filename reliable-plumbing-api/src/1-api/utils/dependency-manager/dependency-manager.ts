import { Container } from 'typedi';
import * as domain from '../../../3-domain/domain-module';
import * as business from '../../../2-business/business.module';
import * as data from '../../../4-data-access/data-access.module';
import { dependencies } from '../../../5-cross-cutting/cross-cutting.module';

/*** simulate singletone pattern ***/
const dbContext: data.MongoContext = new data.MongoContext();
const notificationBroadcastingService: business.NotificationBroadcastingService = new business.NotificationBroadcastingService();
const socketsNotifier: business.SocketsNotifier = new business.SocketsNotifier(notificationBroadcastingService);

export function registerDependencies() {

    /*** Business ***/
    Container.registerService({ id: dependencies.UserManager, type: business.UserManager });
    Container.registerService({ id: dependencies.mailNotifierManager, type: business.MailNotifierManager });
    Container.registerService({ id: dependencies.AppointmentManager, type: business.AppointmentManager });
    Container.registerService({ id: dependencies.LookupsManager, type: business.LookupsManager });
    Container.registerService({ id: dependencies.NotificationManager, type: business.NotificationManager });

    /*** Data Access ***/
    Container.registerService({ id: dependencies.MongoContext, type: data.MongoContext, instance: dbContext });
    Container.registerService({ id: dependencies.UserRepo, type: data.UserRepo });
    Container.registerService({ id: dependencies.UserLoginRepo, type: data.UserLoginRepo });
    Container.registerService({ id: dependencies.MailLogRepo, type: data.MailLogRepo });
    Container.registerService({ id: dependencies.AppointmentRepo, type: data.AppointmentRepo });
    Container.registerService({ id: dependencies.AppointmentTypeRepo, type: data.AppointmentTypeRepo });
    Container.registerService({ id: dependencies.NotificationRepo, type: data.NotificationRepo });

    /*** Business Notifiers ***/
    Container.registerService({ id: dependencies.NotificationBroadcastingService, type: business.NotificationBroadcastingService, instance: notificationBroadcastingService });
    Container.registerService({ id: dependencies.SocketsNotifier, type: business.SocketsNotifier, instance: socketsNotifier });
}