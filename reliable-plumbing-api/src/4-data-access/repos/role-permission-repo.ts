import { Repo } from './repo';
import { GenericModel } from '../models/model';
import { RolePermissionSchema } from '../schemas/role-permission-schema';
import { Role, RolePermission } from '../../3-domain/domain-module';


export class RolePermissionRepo extends Repo<RolePermission> {

    constructor() {
        super(RolePermissionSchema)
    }

    getRolePermissionsByRoles(roles: Role[]): Promise<RolePermission[]> {
        let model = this.createSet();
        return new Promise<RolePermission[]>((resolve, reject) => {
            model.find({ role: { $in: roles } }, (err, results) => {
                if (err != null)
                    return reject(err);

                return resolve(this.mapModelsToEntities(results));
            });

        });
    }

    private mapModelsToEntities(rolePermissionModels: GenericModel<RolePermission>[]) {
        if (rolePermissionModels == null)
            return [];
        let rolePermissions = [];
        for (let rolePermissionModel of rolePermissionModels)
            rolePermissions.push(this.mapModelToEntity(rolePermissionModel.toObject()));

        return rolePermissions;
    }

    private mapModelToEntity(rolePermissionModel) {
        if (rolePermissionModel == null)
            return null;
        let rolePermission = new RolePermission(rolePermissionModel);

        return rolePermission;
    }
}