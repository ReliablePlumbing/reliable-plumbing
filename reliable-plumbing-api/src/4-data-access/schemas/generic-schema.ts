import { Schema } from "mongoose";

export interface genericSchema {
    schema: Schema;
    collectionName: string;
}

export var toObjectOptions = {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        delete ret._id;
        return ret;
    }
}