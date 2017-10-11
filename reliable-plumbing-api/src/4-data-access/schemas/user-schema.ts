import { Schema } from "mongoose";
import { genericSchema } from './generic-schema';

export var userSchema: genericSchema = {
    schema: new Schema({
        hashedPassword: { type: String, required: true },
        salt: { type: String, required: true },
        firstName: { type: String, required: false },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        isEmailVerfied: { type: Boolean, required: true, default: false },
        mobile: { type: String, required: true },
        roles: { type: Array, required: true },
        creationDate: { type: Date, required: true },
        createdByUserId: { type: String, required: false }
    }),
    collectionName: 'users'
};

