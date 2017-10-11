import { Service } from 'typedi';
import { Repo } from './repo';
import { userSchema } from '../schemas/user-schema';
import { MongoContext } from '../mongo-context';
import { User, Role } from '../../3-domain/domain-module';
import { GenericModel } from '../models/model';
import * as mongoose from 'mongoose';

export class UserRepo extends Repo<User> {

    constructor() {
        super(userSchema)
    }

    findByEmail(email: string): Promise<User | null> {
        let model = this.createSet();
        return new model().collection.findOne({ email: email });
    }

    getUserWithRoles(roles: Role[]): Promise<User[]> {
        let model = this.createSet();

        return new Promise<User[]>((resolve, reject) => {
            let aa = model.find({ roles: { $in: roles } }, (err, results) => {

                // .then(results => {
                let users = [];
                for (let userModel of results) {
                    let user = new User(userModel.toObject({transform: Object}));
                    users.push(user);

                }
                return resolve(users)
            })
                .catch(err => {
                    let aa = err;
                })
        })
    }

}