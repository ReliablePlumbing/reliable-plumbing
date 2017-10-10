import { Service } from 'typedi';
import { Repo } from './repo';
import { userSchema } from '../schemas/user-schema';
import { MongoContext } from '../mongo-context';
import { User } from '../../3-domain/domain-module';

export class UserRepo extends Repo<User> {

    constructor(){
        super(userSchema)
    }
    
    findByUserName(username: string): Promise<User | null> {
        let model = this.createSet();
        return new model().collection.findOne({ username: username });
    }

}