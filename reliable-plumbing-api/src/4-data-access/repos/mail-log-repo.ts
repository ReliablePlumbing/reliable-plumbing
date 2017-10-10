import { Service } from 'typedi';
import { MailLog } from '../../3-domain/domain-module';
import { Repo } from './repo';
import { emailLogSchema } from '../schemas/email-log-schema';
import { MongoContext } from '../mongo-context';

export class MailLogRepo extends Repo<MailLog> {

    constructor(){
        super(emailLogSchema)
    }
}