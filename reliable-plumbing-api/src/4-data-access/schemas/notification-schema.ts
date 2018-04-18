import { Schema } from "mongoose";
import { genericSchema, toObjectOptions } from './generic-schema';

export var notificationSchema: genericSchema = {
    schema: new Schema(
        {
            creationDate: { type: Date, required: true },
            type: { type: Number, required: true },
            message: { type: String, required: true },
            notifees: {
                type: [{
                    userId: { type: String, required: true, ref: 'users' },
                    seen: { type: Boolean, required: true, default: false },
                    seenDate: { type: Date, required: false }
                }], required: true
            },
            notifierIds: { type: [], required: false },
            seen: { type: Boolean, required: true, default: false },
            seenDate: { type: Date, required: false },
            objectType: { type: Number, required: false },
            objectId: { type: String, required: false }
        },
        {
            toObject: toObjectOptions
        }
    ),
    collectionName: 'notifications'
};

