import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class EventsService {

  // Nav Event
  private navSource: Subject<any> = new Subject<any>()
  nav: Observable<any> = this.navSource.asObservable();
  navCicked = () => this.navSource.next();

  // Loggin Event
  private loginSource: Subject<any> = new Subject<any>()
  loggedIn: Observable<any> = this.loginSource.asObservable();
  login = () => this.loginSource.next();
  
  // Call Events
  private callSource: Subject<any> = new Subject<any>()
  callUpdated: Observable<any> = this.callSource.asObservable();
  updateCall = (call) => this.callSource.next(call);
  
  // quote Events
  private quoteSource: Subject<any> = new Subject<any>()
  quoteUpdated: Observable<any> = this.quoteSource.asObservable();
  updateQuote = (call) => this.quoteSource.next(call);

}
