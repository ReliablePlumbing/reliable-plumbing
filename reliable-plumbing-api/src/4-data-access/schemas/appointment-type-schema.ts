import { Schema } from "mongoose";
import { genericSchema } from './generic-schema';

export var appointmentTypeSchema: genericSchema = {
    schema: new Schema({
        name: { type: String, required: true },
        description: { type: String, required: false },
        priority: { type: Number, required: true },
        createdBy: { type: String, required: true },
        creationDate: { type: Date, required: true },
        lastModifiedDate: { type: Date, required: false },
        lastModifiedBy: { type: String, required: false },
        isDeleted: { type: Boolean, required: true, default: false },
    }),
    collectionName: 'appointmentTypes'
};