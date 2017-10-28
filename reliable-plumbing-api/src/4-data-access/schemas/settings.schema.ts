import { Schema } from "mongoose";
import { genericSchema } from './generic-schema';

export var settingsSchema: genericSchema = {
    schema: new Schema({
        workDays: { type: [], required: true },
        workHours: {
            type: {
                from: { hour: Number, minute: Number },
                to: { hour: Number, minute: Number }
            }, required: true
        },
        timeSpan: { type: Number, required: true },
        lastModifiedDate: { type: Date, required: false },
        lastModifiedBy: { type: String, required: false }
    }),
    collectionName: 'settings'
};