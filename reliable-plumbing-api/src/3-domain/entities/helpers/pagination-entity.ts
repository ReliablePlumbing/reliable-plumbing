export class PaginationEntity {
    totalCount: number;
    entities: any[];

    constructor(totalCount: number, entities: any[]){
        this.totalCount = totalCount;
        this.entities = entities;
    }
}