import { Inject, Service } from 'typedi';
import { dependencies } from '../../5-cross-cutting/cross-cutting.module';
import { CommentRepo } from '../../4-data-access/data-access.module';
import { Comment } from '../../3-domain/domain-module';
import { PaginationEntity } from '../../3-domain/entities/helpers/pagination-entity';


@Service()
export class CollaborationManager {

    @Inject(dependencies.CommentRepo) private commentRepo: CommentRepo;

    async addComment(comment: Comment) {
        comment.creationDate = new Date();
        let addedComment = await this.commentRepo.add(comment);

        return addedComment;
    }

    async getCommentsChronologicallyPaged(objectId, page, pageSize): Promise<PaginationEntity> {
        let comments = await this.commentRepo.getCommentsPaged(objectId, page, pageSize, 'creationDate');
        let totalCount = await this.commentRepo.getCommentsCount(objectId);

        return new PaginationEntity(totalCount, comments);
    }
}