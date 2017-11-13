import * as mongoose from 'mongoose';
import * as promise from 'bluebird';
import { GenericModel } from './models/model';
import { userSchema } from './schemas/user-schema';
import { Service } from 'typedi';
import { ConfigService } from '../5-cross-cutting/cross-cutting.module';
import { genericSchema } from './schemas/generic-schema';
import * as fs from 'fs';
import * as path from 'path';

export class MongoContext {

    private connectionString = ConfigService.config.db.mongoConnectionString;
    private connection: mongoose.Connection;

    constructor() {
        this.connection = mongoose.createConnection(this.connectionString);
        (<any>mongoose.Promise) = promise;

        // bootstrap schemas
        let schemasPath = path.join(__dirname, './', 'schemas');
        fs.readdirSync(schemasPath).forEach(file => {
            if (~file.indexOf('schema.js') && file.indexOf('generic-schema.js') == -1) {
                let schema = require(schemasPath + '/' + file);
                Object.getOwnPropertyNames(schema).forEach(prop => {
                    if (prop != '__esModule')
                        mongoose.model(schema[prop].collectionName, schema[prop].schema);
                });
            }
        });
    }

    createModel<T>(schema: genericSchema): mongoose.Model<GenericModel<T>> {
        mongoose.set('debug', function (coll, method, query, doc) {
            console.log(coll + " " + method + " " + JSON.stringify(query) + " " + JSON.stringify(doc));
           });
        let entity = this.connection.model<GenericModel<T>>(schema.collectionName, schema.schema);

        return entity;
    }
}