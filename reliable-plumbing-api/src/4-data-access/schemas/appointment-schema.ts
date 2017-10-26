import { Schema } from "mongoose";
import { genericSchema } from './generic-schema';

export var appointmentSchema: genericSchema = {
    schema: new Schema({
        creationDate: { type: Date, required: true },
        fullName: { type: String, required: false },
        email: { type: String, required: false },
        mobile: { type: String, required: false },
        userId: { type: String, required: false, ref: 'users' },
        date: { type: Date, required: true },
        typeId: { type: String, required: true },
        status: { type: Number, required: true },
        assigneeIds: [{ type: String, required: false, ref: 'users' }],
        statusHistory: [new Schema({
            status: { type: Number, required: true },
            creationDate: { type: Date, required: true },
            createdByUserId: { type: String, required: false, ref: 'users' },
        })],

    }),
    collectionName: 'appointments'
};