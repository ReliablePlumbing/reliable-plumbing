import { Container } from 'typedi';
import * as domain from '../../../3-domain/domain-module';
import * as business from '../../../2-business/business.module';
import * as data from '../../../4-data-access/data-access.module';
import { dependcies } from '../../../5-cross-cutting/dependency-manager/dependency-dictionary';

/*** simulate singletone pattern ***/
const dbContext: data.MongoContext = new data.MongoContext();

export function registerDependencies() {

    /*** Business ***/
    Container.registerService({ id: dependcies.UserManager, type: business.UserManager });

    /*** Data Access ***/
    Container.registerService({ id: dependcies.UserRepo, type: data.UserRepo });
    Container.registerService({ id: dependcies.unitOfWork, type: data.MongoContext, instance: dbContext });
}