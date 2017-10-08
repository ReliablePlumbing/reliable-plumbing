import * as mongoose from 'mongoose';
import { GenericModel } from './models/model';
import { userSchema } from './schemas/user-schema';
import { Service } from 'typedi';
import * as promise from 'bluebird';
import { ConfigService } from '../5-cross-cutting/cross-cutting.module';
import { genericSchema } from './schemas/generic-schema';

export class MongoContext {

    private connectionString = ConfigService.config.db.mongoConnectionString;
    
    connection: mongoose.Connection = mongoose.createConnection(this.connectionString,{
        promiseLibrary: promise
    });

    createModel<T>(schema: genericSchema): mongoose.Model<GenericModel<T>> {
        (<any>mongoose.Promise) = promise;
        let entity = this.connection.model<GenericModel<T>>(schema.collectionName, schema.schema);

        return entity;
    }
}