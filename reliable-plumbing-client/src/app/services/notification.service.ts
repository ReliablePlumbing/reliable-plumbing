import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { EnvironmentService } from './environment.service';
import { AlertifyService } from './alertify.service';
import { HttpExtensionService } from "./http-extension.service";
import { environment } from '../../environments/environment';

@Injectable()
export class NotificationService {

  baseUrl = environment.apiUrl + 'notifications/'

  constructor(private environmentService: EnvironmentService, private alertifyService: AlertifyService,
    private httpService: HttpExtensionService) { }

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


  getUserNotifications(id) {
    return this.httpService.get(this.baseUrl + 'getUserNotifications?id=' + id)
      .map((response: Response) => response.json());
  }
}
