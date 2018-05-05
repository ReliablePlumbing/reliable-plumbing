import { Schema } from "mongoose";
import { genericSchema, toObjectOptions } from './generic-schema';

export var CommentSchema: genericSchema = {
    schema: new Schema(
        {
            objectType: { type: Number, required: false },
            objectId: { type: String, required: false },
            userId: { type: String, required: true, ref: 'users' },
            creationDate: { type: Date, required: true },
            lastModifiedDate: { type: Date, required: false },
            isDeleted: { type: Boolean, required: true, default: false },
            text: { type: String, required: false },
        },
        {
            toObject: toObjectOptions
        }
    ),
    collectionName: 'comments'
};