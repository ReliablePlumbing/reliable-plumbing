import { Schema } from "mongoose";
import { genericSchema } from './generic-schema';

export var appointmentSettingsSchema: genericSchema = {
    schema: new Schema({
        workDays: { type: [], required: true },
        workHours: {
            type: {
                from: { h: Number, min: Number },
                to: { h: Number, min: Number }
            }, required: true
        },
        timeSpan: { type: Number, required: true },
        lastModifiedDate: { type: Date, required: false },
        lastModifiedBy: { type: String, required: false }
    }),
    collectionName: 'appointmentSettings'
};