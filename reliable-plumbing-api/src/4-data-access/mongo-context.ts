import * as mongoose from 'mongoose';
import * as promise from 'bluebird';
import { GenericModel } from './models/model';
import { userSchema } from './schemas/user-schema';
import { Service } from 'typedi';
import { ConfigService } from '../5-cross-cutting/cross-cutting.module';
import { genericSchema } from './schemas/generic-schema';

export class MongoContext {

    private connectionString = ConfigService.config.db.mongoConnectionString;

    private connection = mongoose.createConnection(this.connectionString);

    constructor() {
        (<any>mongoose.Promise) = promise;
    }

    createModel<T>(schema: genericSchema): mongoose.Model<GenericModel<T>> {
        let entity = this.connection.model<GenericModel<T>>(schema.collectionName, schema.schema);

        return entity;
    }
}