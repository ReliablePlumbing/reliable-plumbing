import { JsonController, Param, QueryParam, Body, Get, Post, Put, Delete, Authorized, BodyParam, UploadedFiles } from "routing-controllers";
import { dependencies } from '../../5-cross-cutting/cross-cutting.module';
import { Inject } from 'typedi';
import { CollaborationManager } from "../../2-business/business.module";
import { Comment } from "../../3-domain/domain-module";

@JsonController('/collaboration')
export class CollaborationController {

    @Inject(dependencies.CollaborationManager)
    private collaborationManager: CollaborationManager;

    @Post('/addComment')
    addComment(@Body() commentModel) {
        let comment = new Comment(commentModel);
        return new Promise<any>((resolve, reject) => {
            this.collaborationManager
                .addComment(comment)
                .then(result => resolve(result.toLightModel()))
                .catch((error: Error) => reject(error));
        });
    }

    @Get('/getCommentsChronologicallyPaged')
    @Authorized()
    getCommentsChronologicallyPaged(@QueryParam('objectId') objectId: string, @QueryParam('page') page: number, @QueryParam('pageSize') pageSize: number) {
        return new Promise<any>((resolve, reject) => {
            this.collaborationManager.getCommentsChronologicallyPaged(objectId, page, pageSize)
                .then(result => {
                    let comments = result.entities.map(comment => comment.toLightModel());
                    result.entities = comments;
                    resolve(result);
                })
                .catch((error: Error) => reject(error));
        })
    }

}