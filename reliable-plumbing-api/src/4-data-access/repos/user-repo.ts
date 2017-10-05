import { User } from '../../3-domain/domain-module';
import { Repo } from './repo';
import { Service } from 'typedi';
import { dependcies } from '../../5-cross-cutting/cross-cutting.module';
import { userSchema } from '../schemas/user-schema';

export class UserRepo extends Repo<User> {

    constructor(){
        super(userSchema)
    }
    
    findByUserName(user: User): Promise<User> {

        return this.createSet().collection.findOne({ username: user.username });
    }

}