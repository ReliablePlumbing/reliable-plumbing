import { Injectable } from '@angular/core';
import { EnvironmentService } from './environment.service';
import { Subject, Observable } from 'rxjs'

@Injectable()
export class NotificationService {

  constructor(private environmentService: EnvironmentService) { }

  private connectionSource$: Subject<any> = new Subject<any>();
  connectionRequested: Observable<any> = this.connectionSource$.asObservable();
  connectSockets() {
    this.connectionSource$.next();
  }

  private notificationRecieverSource$: Subject<any> = new Subject<any>();
  notificationRecieved: Observable<any> = this.notificationRecieverSource$.asObservable();

  broadcastNotification(notification) {
    alert(notification.message);
    this.notificationRecieverSource$.next(notification);
  }
}
