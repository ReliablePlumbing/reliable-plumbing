import { Schema, Types } from "mongoose";
import { genericSchema, toObjectOptions } from './generic-schema';

export var userLoginSchema: genericSchema = {
    schema: new Schema(
        {
            email: { type: String, required: true },
            hashedValidator: { type: String, required: true },
            creationDate: { type: Date, required: true }
        },
        {
            toObject: toObjectOptions
        }
    ),
    collectionName: 'userLogins'
};

