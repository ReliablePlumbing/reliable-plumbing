import { ObjectId } from "bson";

export abstract class BaseEntity {
    id: ObjectId;

    abstract toModel(): any;
}