import { Service } from 'typedi';
import { UserLogin } from '../../3-domain/domain-module';
import { Repo } from './repo';
import { userLoginSchema } from '../schemas/user-login-schema';
import { MongoContext } from '../mongo-context';
import { Types } from 'mongoose';

export class UserLoginRepo extends Repo<UserLogin> {

    constructor() {
        super(userLoginSchema)
    }

    // findLogin(email: string, id: string): Promise<UserLogin | null> {
    //     let model = this.createSet();
    //     return model.findOne({ id: id });
    // }

    findLogin(id: string): Promise<UserLogin | null> {
        let model = this.createSet();
        return new Promise<UserLogin>((resolve, reject) => {
            model.findById(id, (err, result) => {
                if (err != null)
                    return reject(err);
                let userLogin = new UserLogin(result.toObject({ transform: Object }));
                return resolve(userLogin);
            })
        })
    }
}