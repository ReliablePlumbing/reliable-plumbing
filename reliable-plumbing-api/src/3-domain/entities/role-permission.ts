import { BaseEntity } from './base/base-entity';
import { Role } from '../enums/role';
import { Permission } from '../enums/permission';

export class RolePermission extends BaseEntity {

    role: Role;
    permissions: Permission[];

    constructor(rolePermission?: any) {
        super();
        if (rolePermission != null) {
            this.role = rolePermission.role;
            this.permissions = rolePermission.permissions;
           
        }
    }

    toLightModel() {
        let rolePermissionDto = {};
        rolePermissionDto [this.role] = this.permissions;
        return rolePermissionDto;
        // {
        //     role: this.role,
        //     permissions: this.permissions           
        // }
    }
}