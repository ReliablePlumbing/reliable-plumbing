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
                street: { type: String, required: false },
                city: { type: String, required: false },
                state: { type: String, required: false },
                zipCode: { type: String, required: false }
            },
            required: false
        },
        userId: { type: String, required: false, ref: 'users' },
        siteId: { type: String, required: false },
        rate: { type: Number, required: false, default: null },
        quoteId: { type: String, required: false, ref: 'quotes' },
        date: { type: Date, required: true },
        typeId: { type: String, required: false, ref: 'appointmentTypes' },
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