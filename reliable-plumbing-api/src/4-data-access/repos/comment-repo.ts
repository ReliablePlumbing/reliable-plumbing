import { Repo } from './repo';
import { CommentSchema } from '../schemas/comment-schema';
import { Comment, User } from '../../3-domain/domain-module';
import { GenericModel } from '../models/model';


export class CommentRepo extends Repo<Comment> {

    constructor() {
        super(CommentSchema)
    }

    getCommentsPaged(objectId, page, pageSize, orderBy) {
        let model = this.createSet();
        let sort: any = {};
        sort[orderBy] = -1;
        return new Promise<Comment[]>((resolve, reject) => {
            model.find({ objectId: objectId }).limit(pageSize).skip((page - 1) * pageSize).sort(sort).populate('userId').exec((err, results) => {
                if (err != null)
                    return reject(err);

                return resolve(this.mapModelsToEntities(results));
            });
        });
    }

    getCommentsCount(objectId){
        let model = this.createSet();

        return new Promise<number>((resolve, reject) => {
            model.find({objectId: objectId}).count((err, count) => {
                if (err != null)
                return reject(err);

            return resolve(count);
            });        
        });
    }


    private mapModelsToEntities(commentModels: GenericModel<Comment>[]) {
        if (commentModels == null)
            return [];
        let comments = [];
        for (let commentModel of commentModels)
            comments.push(this.mapModelToEntity(commentModel));

        return comments;
    }

    private mapModelToEntity(commentModel: GenericModel<Comment>) {
        if (commentModel == null)
            return null;

        let obj: any = commentModel.toObject({ transform: Object });
        let comment = new Comment(obj);
        if (obj.userId != null && typeof obj.userId == 'object') {
            comment.user = new User(obj.userId);
            comment.userId = comment.user.id;
        }
        else
            comment.userId = obj.userId;

        return comment;
    }
}