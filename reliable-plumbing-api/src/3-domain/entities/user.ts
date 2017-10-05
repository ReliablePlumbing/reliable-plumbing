import { Role } from '../enums/role';
import { BaseEntity } from './base/base-entity';
export class User extends BaseEntity {
  username: string;
  hashedPassword?: string;
  password: string;
  salt: string;
  roles?: Role[];


  toModel() {
    return {
      id: this.id.toString(),
      username: this.username,

    }
  }
}