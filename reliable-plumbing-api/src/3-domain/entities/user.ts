import { BaseEntity } from './base/base-entity';
import { SocialMediaProvider } from '../enums/social-media-provider';
import { Role } from '../enums/role';

export class User extends BaseEntity {

  hashedPassword?: string;
  password: string;
  salt: string;
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerfied: boolean;
  emailActivationDate?: Date;
  mobile: string;
  roles?: Role[];
  creationDate: Date;
  createdByUserId?: string;
  isActivated: boolean;
  activationDate?: Date;
  socialMediaId?: string;
  SocialMediaProvider?: SocialMediaProvider;
  sites: [{
    coords: {
      lat: number,
      lng: number
    },
    streetAddress: string,
    city: string,
    state: string,
    zipCode: string
  }]

  constructor(user?: any) {
    super();
    if (user != null) {
      this.id = user.id;
      this.firstName = user.firstName;
      this.lastName = user.lastName;
      this.email = user.email;
      this.isEmailVerfied = user.isEmailVerfied;
      this.emailActivationDate = user.emailActivationDate;
      this.mobile = user.mobile;
      this.roles = user.roles;
      this.creationDate = user.creationDate;
      this.hashedPassword = user.hashedPassword;
      this.password = user.password;
      this.salt = user.salt;
      this.createdByUserId = user.createdByUserId;
      this.isActivated = user.isActivated;
      this.activationDate = user.activationDate;
      this.sites = user.sites;
      this.socialMediaId = user.socialMediaId;
      this.SocialMediaProvider = user.SocialMediaProvider == null ? SocialMediaProvider.None : user.SocialMediaProvider;
    }
  }

  toLightModel() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      isEmailVerfied: this.isEmailVerfied,
      emailActivationDate: this.emailActivationDate,
      mobile: this.mobile,
      roles: this.roles,
      rolesObj: this.mapRoles(),
      creationDate: this.creationDate,
      isActivated: this.isActivated,
      activationDate: this.activationDate,
      sites: this.sites,
      socialMediaId: this.socialMediaId,
      SocialMediaProvider: this.SocialMediaProvider
    }
  }

  mapRoles() {
    if (this.roles == null)
      return [];
    let rolesObjects = [];
    for (let role of this.roles) {
      rolesObjects.push({
        roleId: role,
        name: Role[role]
      });
    }

    return rolesObjects;
  }
}