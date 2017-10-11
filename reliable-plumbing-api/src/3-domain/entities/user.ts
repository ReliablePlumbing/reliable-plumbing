import { Role } from '../enums/role';
import { BaseEntity } from './base/base-entity';

export class User extends BaseEntity {

  hashedPassword?: string;
  password: string;
  salt: string;
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerfied: boolean;
  mobile: string;
  roles?: Role[];
  creationDate: Date;
  createdByUserId?: string

  constructor(user?: any) {
    super();
    if (user != null) {
      this.id = user.id;
      this.firstName = user.firstName;
      this.lastName = user.lastName;
      this.email = user.email;
      this.isEmailVerfied = user.isEmailVerfied;
      this.mobile = user.mobile;
      this.roles = user.roles;
      this.creationDate = user.creationDate;
      this.hashedPassword = user.hashedPassword;
      this.password = user.password;
      this.salt = user.salt;
      this.createdByUserId = user.createdByUserId;
    }
  }

  toLightModel() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      isEmailVerfied: this.isEmailVerfied,
      mobile: this.mobile,
      roles: this.mapRoles(),
      creationDate: this.creationDate
    }
  }

  mapRoles(){
    if(this.roles == null)
      return [];
    let rolesObjects = [];
    for(let role of this.roles){
      rolesObjects.push({
        roleId: role,
        name: Role[role]
      });
    }

    return rolesObjects;
  }
}