import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs'
import { EnvironmentService } from './environment.service';
import { AlertifyService } from './alertify.service';

@Injectable()
export class NotificationService {

  constructor(private environmentService: EnvironmentService, private alertifyService: AlertifyService) { }

  private connectionSource$: Subject<any> = new Subject<any>();
  connectionRequested: Observable<any> = this.connectionSource$.asObservable();
  connectSockets() {
    this.connectionSource$.next();
  }

  private notificationRecieverSource$: Subject<any> = new Subject<any>();
  notificationRecieved: Observable<any> = this.notificationRecieverSource$.asObservable();

  broadcastNotification(notification) {
    this.alertifyService.notify(notification.message)
    this.notificationRecieverSource$.next(notification);
  }
}
