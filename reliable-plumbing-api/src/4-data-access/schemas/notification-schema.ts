import { Schema } from "mongoose";
import { genericSchema } from './generic-schema';

export var notificationSchema: genericSchema = {
    schema: new Schema({
        creationDate: { type: Date, required: true },
        type: { type: Number, required: true },
        message: { type: String, required: true },
        notifeeIds: { type: [], required: true },
        notifierIds: { type: [], required: false },
        seen: { type: Boolean, required: true, default: false },
        seenDate: { type: Date, required: false },
        objectType: { type: Number, required: false },
        objectId: { type: String, required: false }
    }),
    collectionName: 'notifications'
};
