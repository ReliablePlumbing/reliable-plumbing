import { Schema } from "mongoose";
import { genericSchema } from './generic-schema';

export var quoteSchema: genericSchema = {
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
        userId: { type: String, required: false, ref: 'users' },
        typeId: { type: String, required: true, ref: 'appointmentTypes' },
        message: { type: String, required: false },
        status: { type: Number, required: true },
        statusHistory: [new Schema({
            status: { type: Number, required: true },
            creationDate: { type: Date, required: true },
            createdByUserId: { type: String, required: false, ref: 'users' },
        })],
        relatedFileNames: [{ type: String, required: false }]
    }),
    collectionName: 'quotes'
};