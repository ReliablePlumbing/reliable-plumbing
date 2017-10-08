import { User } from '../../3-domain/domain-module';
import { Repo } from './repo';
import { userSchema } from '../schemas/user-schema';

export class UserRepo extends Repo<User> {

    constructor(){
        super(userSchema)
    }
    
    findByUserName(user: User): Promise<User> {
        let model = this.createSet();
        return new model(user).collection.findOne({ username: user.username });
    }

}