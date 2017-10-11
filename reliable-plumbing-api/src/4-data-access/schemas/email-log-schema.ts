import { Schema } from "mongoose";
import { genericSchema } from './generic-schema';

export var emailLogSchema: genericSchema = {
    schema: new Schema({
        sendingDate: { type: Date, required: true },
        from: { type: String, required: true },
        to: { type: String, required: true },
        subject: { type: String, required: true },
        content: { type: String, required: true },
        status: { type: Number, required: true },
        errorMessage: { type: String, required: false }
    }),
    collectionName: 'emailLogs'
};

