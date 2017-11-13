import { BaseEntity } from '../../3-domain/domain-module';
import { Inject } from 'typedi';
import { dependencies } from '../../5-cross-cutting/cross-cutting.module';
import { MongoContext } from '../mongo-context';
import * as bluebird from 'bluebird';
import { GenericModel } from '../models/model';
import { genericSchema } from '../schemas/generic-schema';
import * as mongoose from 'mongoose';

export class Repo<T extends BaseEntity>{

    @Inject(dependencies.MongoContext)
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
        return new Promise<boolean>((resolve, reject) => {
            let model = this.createSet();
            model.update({ _id: entity.id }, entity).then(res => {
                return resolve(res.ok == 1)
            }).catch((error: Error) => reject(error));
        })
    }

    // findOneAndUpdate(entity: T) {
    //     return new Promise<any>((resolve, reject) => {
    //         let model = this.createSet();
    //         model.update()
    //         new model(entity).update(entity).then(res => {
    //             let success = true;
    //             if (res.nModified == 0)
    //                 success = false;
    //             return resolve(success)
    //         });
    //     })
    // }

    findOneAndUpdate(entity: T) {
        let model = this.createSet();
        return new Promise<any>((resolve, reject) => {
            model.findOneAndUpdate({ _id: entity.id }, entity, { new: true }, (err, result) => {
                if (err != null)
                    return reject(err);
                return resolve(result);
            });
        });
    }

    deleteById(id: string) {
        return new Promise<boolean>((resolve, reject) => {
            let model = this.createSet();
            model.findByIdAndRemove(id, (err, res) => {
                if (err != null)
                    return reject(err);
                return resolve(true);
            })
        });
    }
    // find(entity: T): Promise<T> {
    //     return this.model.collection.findOne(entity.id);
    // }

    protected createSet(): mongoose.Model<GenericModel<T>> {
        return this.mongoContext.createModel<T>(this.customSchema);
    }

}