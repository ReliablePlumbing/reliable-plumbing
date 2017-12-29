import { Schema } from "mongoose";
import { genericSchema } from './generic-schema';

export var appointmentSchema: genericSchema = {
    schema: new Schema({
        creationDate: { type: Date, required: true },
        customerInfo: {
            type: {
                firstName: { type: String, required: true },
                lastName: { type: String, required: false },
                mobile: { type: String, required: true },
                email: { type: String, required: true },
                streetAddress: { type: String, required: false },
                city: { type: String, required: false },
                state: { type: String, required: false },
                zipCode: { type: String, required: false }
            },
            required: false
        },
        // fullName: { type: String, required: false },
        // email: { type: String, required: false },
        // mobile: { type: String, required: false },
        userId: { type: String, required: false, ref: 'users' },
        date: { type: Date, required: true },
        typeId: { type: String, required: true, ref: 'appointmentTypes' },
        message: { type: String, required: false },
        status: { type: Number, required: true },
        assigneeIds: [{ type: String, required: false, ref: 'users' }],
        statusHistory: [new Schema({
            status: { type: Number, required: true },
            creationDate: { type: Date, required: true },
            createdByUserId: { type: String, required: false, ref: 'users' },
        })],
        checkInDetails: {
            type: {
                date: { type: Date, required: true },
                lat: { type: Number, required: true },
                lng: { type: Number, required: true },
                userId: { type: String, required: true, ref: 'users' },
            },
            required: false
        },
        relatedFileNames: [{ type: String, required: false }]
    }),
    collectionName: 'appointments'
};