import { BaseEntity } from '../../3-domain/domain-module';
import { Inject } from 'typedi';
import { dependcies } from '../../5-cross-cutting/cross-cutting.module';
import { MongoContext } from '../mongo-context';
import * as bluebird from 'bluebird';
import { GenericModel } from '../models/model';
import { genericSchema } from '../schemas/generic-schema';
import * as mongoose from 'mongoose';

export class Repo<T extends BaseEntity>{

    @Inject(dependcies.MongoContext)
    private mongoContext: MongoContext;
    private customSchema: genericSchema

    constructor(schema: genericSchema) {
        this.customSchema = schema;
    }

    add(entity: T) {
        return new Promise<T>((resolve, reject) => {
            let model = this.createSet();
            new model(entity).save().then(res => {
                entity.id = res.id;
                return resolve(entity);
            }).catch(err => reject(err));
        });
    }

    update(entity: T) {
        return new Promise<any>((resolve, reject) => {
            let model = this.createSet();
            new model(entity).update(entity).then(res => {
                let success = true;
                if (res.nModified == 0)
                    success = false;
                return resolve(success)
            });
        })
    }

    // find(entity: T): Promise<T> {
    //     return this.model.collection.findOne(entity.id);
    // }

    createSet(): mongoose.Model<GenericModel<T>> {
        return this.mongoContext.createModel<T>(this.customSchema);
    }

}