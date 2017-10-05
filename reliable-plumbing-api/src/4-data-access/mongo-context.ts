import * as mongoose from 'mongoose';
import { Model } from './models/model';
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

    createModel<T>(schema: genericSchema): Model<T> {
        let entity = this.connection.model<Model<T>>(schema.collectionName, schema.schema);

        return new entity();

    }

    users: mongoose.Collection;
}