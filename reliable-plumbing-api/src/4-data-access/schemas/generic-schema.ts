import { Schema } from "mongoose";

export interface genericSchema {
    schema: Schema;
    collectionName: string;
}