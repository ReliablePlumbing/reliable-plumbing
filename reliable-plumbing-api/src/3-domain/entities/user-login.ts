import { BaseEntity } from './base/base-entity';
export class UserLogin extends BaseEntity {

    email: string;
    selector: string;
    hashedValidator: string;
    validator: string;
    creationDate: Date;

    constructor(userLogin?: any) {
        super();
        if (userLogin != null) {
            this.email = userLogin.email;
            this.selector = userLogin.selector ? userLogin.selector : userLogin.id;
            this.validator = userLogin.validator;
            this.hashedValidator = userLogin.hashedValidator;
            this.creationDate = userLogin.creationDate;
        }
    }

    toLightModel() {
        return {
            email: this.email,
            selector: this.selector ? this.selector : this.id,
            validator: this.validator,
            creationDate: this.creationDate
        }
    }
}