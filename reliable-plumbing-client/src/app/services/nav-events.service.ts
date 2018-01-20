import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class NavEventsService {

  private navSource: Subject<any> = new Subject<any>()
  nav: Observable<any> = this.navSource.asObservable();

  navCicked = () => this.navSource.next();

}
