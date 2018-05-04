import { Inject, Service } from 'typedi';
import { dependencies } from '../../5-cross-cutting/cross-cutting.module';
import { RolePermissionRepo, UserRepo } from '../../4-data-access/data-access.module';
import { Role, RolePermission, Permission } from '../../3-domain/domain-module';

@Service()
export class SecurityManager {

    @Inject(dependencies.RolePermissionRepo) private rolePermissionRepo: RolePermissionRepo;
    @Inject(dependencies.UserRepo) private userRepo: UserRepo;

    async getRolePermissionByEmail(email: string): Promise<RolePermission[]>{
        let user = await this.userRepo.findByEmail(email)
        let rolePermission = await this.rolePermissionRepo.getRolePermissionsByRoles(user.roles);

        return rolePermission;
    }

    async getPermissionsByRoles(roles: Role[]): Promise<Permission[]>{
        let rolePermissions = await this.rolePermissionRepo.getRolePermissionsByRoles(roles);
        let permissions: Permission[] = [];
        rolePermissions.map(rolePerm => {
            rolePerm.permissions.forEach(perm => {
                if (permissions.indexOf(perm) == -1)
                    permissions.push(perm);
            })
        })
        return permissions;
    }
}