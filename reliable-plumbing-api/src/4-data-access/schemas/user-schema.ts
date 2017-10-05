import { Schema } from "mongoose";
import { genericSchema } from './generic-schema';

export var userSchema: genericSchema = {
    schema: new Schema({
        username: { type: String, required: true },
        hashedPassword: { type: String, required: true },
        salt: { type: String, required: true },
        // roles: { type: Number, required: false }
    }),
    collectionName: 'users'
};

