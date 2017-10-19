import { Container } from 'typedi';
// import * as domain from '../../3-domain/domain-module';
// import * as business from '../../2-business/business.module';
// import * as data from '../../4-data-access/data-access.module';


export const dependcies = {
    // business
    UserManager: 'business.UserManager',
    mailNotifierManager: 'business.MailNotifier',
    AppointmentManager: 'business.AppointmentManager',
    LookupsManager: 'business.LookupsManager',
    // data
    MongoContext: 'data.MongoContext',
    UserRepo: 'data.UserRepo',
    UserLoginRepo: 'data.UserLoginRepo',
    MailLogRepo: 'data.MailLogRepo',
    AppointmentRepo: 'data.AppointmentRepo',
    AppointmentTypeRepo: 'data.AppointmentTypeRepo',

}

    /*** simulate singletone pattern ***/
//     static dbContext: data.MongoContext = new data.MongoContext();

//     static registerDependencies() {

//         Container.provide([
//             /*** Business ***/
//             { id: this.dependcies.UserManager, value: Container.get(business.UserManager) },

//             /*** Data Access ***/
//             { id: this.dependcies.UserRepo, value: new data.UserRepo() },
//             { id: this.dependcies.unitOfWork, value: this.dbContext }


//         ])
//     }
// }