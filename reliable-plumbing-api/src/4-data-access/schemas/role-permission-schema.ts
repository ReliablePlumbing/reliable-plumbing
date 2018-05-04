import { Schema } from "mongoose";
import { genericSchema, toObjectOptions } from './generic-schema';

export var RolePermissionSchema: genericSchema = {
    schema: new Schema(
        {
            role: { type: Number, required: true },
            permissions: [{ type: Number, required: false }],
        },
        {
            toObject: toObjectOptions
        }
    ),
    collectionName: 'rolePermissions'
};