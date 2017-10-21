import { Schema } from "mongoose";
import { genericSchema } from './generic-schema';

export var appointmentSchema: genericSchema = {
    schema: new Schema({
        creationDate: { type: Date, required: true },
        fullName: { type: String, required: false },
        email: { type: String, required: false },
        mobile: { type: String, required: false },
        userId: { type: String, required: false },
        date: { type: Date, required: true },
        typeId: { type: String, required: true },
        status: { type: Number, required: true }
    }),
    collectionName: 'appointments'
};