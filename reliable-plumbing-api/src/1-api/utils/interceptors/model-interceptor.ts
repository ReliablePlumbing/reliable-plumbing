import { Interceptor, InterceptorInterface, Action } from "routing-controllers";
import { BaseEntity } from '../../../3-domain/domain-module';
import { ObjectId } from 'bson';

export class ToModelInterceptor implements InterceptorInterface {

    intercept(action: Action, entity: BaseEntity) {
        // let aa = content;
        // debugger;
        return entity.toModel();
    }

}

export class FromModelInterceptor implements InterceptorInterface {
    intercept(action: Action, model: BaseEntity) {
        model.id = new ObjectId(model.id);

        return model;
    }


}