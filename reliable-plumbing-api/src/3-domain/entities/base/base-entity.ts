export abstract class BaseEntity {
    id: string | undefined;

    abstract toLightModel(): any;
}