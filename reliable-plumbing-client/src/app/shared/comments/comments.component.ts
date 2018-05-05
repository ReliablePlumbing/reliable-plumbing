import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { CollaborationService, EnvironmentService } from '../../services/services.exports';

@Component({
  selector: 'comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit, OnChanges {

  @Input() objectId;
  @Input() objectType;
  page = 1;
  pageSize = 5;
  comments = [];
  newComment;
  totalCount = 0;

  constructor(private collaborationService: CollaborationService, private environmentService: EnvironmentService) { }

  ngOnInit() {
  }

  ngOnChanges(){
    this.page = 1;
    this.totalCount = 0;
    this.newComment = null;
    this.comments = [];
    this.getComments();
  }

  getComments() {
    this.collaborationService.getCommentsChronologicallyPaged(this.objectId, this.page, this.pageSize).subscribe(newComments => {
      this.totalCount = newComments.totalCount;
      this.mapAndPushComments(newComments.entities, true);
    });
  }

  loadMore() {
    this.page += 1;
    this.getComments();
  }

  mapAndPushComments(newComments, pushInEnd = false) {
    for (let comment of newComments) {
      comment.userFullName = comment.user.firstName + ' ' + (comment.user.lastName ? comment.user.lastName : '');
      if (pushInEnd)
        this.comments.push(comment);
      else
        this.comments.splice(0, 0, comment);
    }
  }

  addComment() {
    if (!this.newComment)
      return;

    let comment = {
      text: this.newComment,
      objectId: this.objectId,
      objectType: this.objectType,
      userId: this.environmentService.currentUser.id
    };

    this.collaborationService.addComment(comment).subscribe(newComment => {
      newComment.user = this.environmentService.currentUser;
      this.mapAndPushComments([newComment])
      this.newComment = null;
      this.totalCount += 1;
      if (this.comments.length > (this.page * this.pageSize))
        this.comments.pop();
    });
  }

}
