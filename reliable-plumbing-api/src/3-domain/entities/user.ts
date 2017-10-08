import { Role } from '../enums/role';
import { BaseEntity } from './base/base-entity';
export class User extends BaseEntity {
  username: string;
  hashedPassword?: string;
  password: string;
  salt: string;
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerfied: boolean;
  mobile: string;
  tel: string;
  roles?: Role[];
  creationDate: Date;
  createdByUserId?: string 

  toLightModel() {
    return {
      id: this.id,
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      isEmailVerfied: this.isEmailVerfied,
      mobile: this.mobile,
      tel: this.tel,
      roles: this.roles,
      creationDate: this.creationDate
    }
  }
}