import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs';
import { HttpExtensionService } from './http-extension.service';
import { environment } from '../../environments/environment';

@Injectable()
export class CollaborationService {

  protected basePath = environment.apiUrl + 'collaboration/';

  constructor(private httpService: HttpExtensionService) { }

  addComment(comment): Observable<any> {
    return this.httpService.post(this.basePath + 'addComment', comment)
      .map((response: Response) => response.json());
  }

  getCommentsChronologicallyPaged(objectId, page, pageSize): Observable<any> {
    return this.httpService.get(this.basePath + 'getCommentsChronologicallyPaged?objectId=' + objectId + '&page=' + page + '&pageSize=' + pageSize)
      .map((response: Response) => response.json());
  }
}
