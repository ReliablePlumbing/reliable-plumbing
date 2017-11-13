import { Repo } from './repo';
import { userSchema } from '../schemas/user-schema';
import { User, Role } from '../../3-domain/domain-module';
import { GenericModel } from '../models/model';

export class UserRepo extends Repo<User> {

    constructor() {
        super(userSchema)
    }

    findByEmail(email: string): Promise<User | null> {
        return new Promise<User | null>((resolve, reject) => {
            let model = this.createSet();
            return model.findOne({ email: email }, (err, result) => {
                if (err != null)
                    return reject(err);

                if (result == null)
                    return resolve(null);
                let user = new User(result.toObject({ transform: Object }));
                return resolve(user);

            });
        });
    }

    getUsersByRoles(roles: Role[]): Promise<User[]> {
        let model = this.createSet();

        return new Promise<User[]>((resolve, reject) => {
            model.find({ roles: { $in: roles } }, (err, results) => {
                if (err != null)
                    return reject(err);
                let users = [];
                for (let userModel of results) {
                    let user = new User(userModel.toObject({ transform: Object }));
                    users.push(user);

                }
                return resolve(users);
            })
        })
    }

    findUsersByIds(ids) {
        let model = this.createSet();
        return new Promise<User[]>((resolve, reject) => {
            model.find({ _id: { $in: ids } }, (err, results) => {
                if (err != null)
                    return reject(err);

                let users = this.mapModelsToEntities(results);
                return resolve(users);
            })

        });
    }

    private mapModelToEntity(userModel: GenericModel<User>) {
        let userObj = userModel.toObject({ transform: Object });

        return new User(userObj);
    }

    private mapModelsToEntities(userModels: GenericModel<User>[]) {
        let users = [];
        for (let userModel of userModels) {
            users.push(this.mapModelToEntity(userModel))
        }
        return users;
    }
}