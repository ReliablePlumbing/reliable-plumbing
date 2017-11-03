import { Schema } from "mongoose";
import { genericSchema } from './generic-schema';

export var userSchema: genericSchema = {
    schema: new Schema({
        hashedPassword: { type: String, required: false },
        salt: { type: String, required: false },
        firstName: { type: String, required: false },
        lastName: { type: String, required: false },
        email: { type: String, required: true },
        isEmailVerfied: { type: Boolean, required: true, default: false },
        emailActivationDate: { type: Date, required: false },
        mobile: { type: String, required: true },
        roles: { type: Array, required: true },
        creationDate: { type: Date, required: true },
        createdByUserId: { type: String, required: false },
        isActivated: { type: Boolean, required: true },
        activationDate: { type: Date, required: false },
        address: {
            type: {
                coords: {
                    type: {
                        lat: { type: Number, required: true },
                        lng: { type: Number, required: true }
                    }, required: false
                },
                text: { type: String, required: true }

            }, required: true
        }
    }),
    collectionName: 'users'
};

