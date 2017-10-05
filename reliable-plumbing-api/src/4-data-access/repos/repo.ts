import { BaseEntity } from '../../3-domain/domain-module';
import { Inject } from 'typedi';
import { dependcies } from '../../5-cross-cutting/cross-cutting.module';
import { MongoContext } from '../mongo-context';
import * as mongodb from 'mongodb';
import * as bluebird from 'bluebird';
import { Model } from '../models/model';
import { genericSchema } from '../schemas/generic-schema';

export class Repo<T extends BaseEntity>{

    @Inject(dependcies.unitOfWork)
    private mongoUnitOfWork: MongoContext;

    private customSchema : genericSchema

    constructor(schema: genericSchema) {
        this.customSchema = schema;
     }

    add(entity: T) {

        return this.createSet().collection.insertOne(entity)
            .then((result: mongodb.InsertOneWriteOpResult) => {
                entity.id = result.insertedId;
                return entity;
            })
    }

    find(entity: T): Promise<T> {

        return this.createSet().collection.findOne(entity.id);

    }



    createSet(): Model<T> {
        return this.mongoUnitOfWork.createModel<T>(this.customSchema);
    }

}