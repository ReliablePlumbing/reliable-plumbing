import { Container } from 'typedi';
import * as domain from '../../../3-domain/domain-module';
import * as business from '../../../2-business/business.module';
import * as data from '../../../4-data-access/data-access.module';
import { dependcies } from '../../../5-cross-cutting/cross-cutting.module';

/*** simulate singletone pattern ***/
const dbContext: data.MongoContext = new data.MongoContext();

export function registerDependencies() {

    /*** Business ***/
    Container.registerService({ id: dependcies.UserManager, type: business.UserManager });
    Container.registerService({ id: dependcies.mailNotifierManager, type: business.MailNotifierManager });
    Container.registerService({ id: dependcies.AppointmentManager, type: business.AppointmentManager });
    Container.registerService({ id: dependcies.LookupsManager, type: business.LookupsManager });

    /*** Data Access ***/
    Container.registerService({ id: dependcies.MongoContext, type: data.MongoContext, instance: dbContext });
    Container.registerService({ id: dependcies.UserRepo, type: data.UserRepo });
    Container.registerService({ id: dependcies.UserLoginRepo, type: data.UserLoginRepo });
    Container.registerService({ id: dependcies.MailLogRepo, type: data.MailLogRepo });
    Container.registerService({ id: dependcies.AppointmentRepo, type: data.AppointmentRepo });
    Container.registerService({ id: dependcies.AppointmentTypeRepo, type: data.AppointmentTypeRepo });
}