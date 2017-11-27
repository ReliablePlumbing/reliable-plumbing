import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { EnvironmentService } from './environment.service';
import { AlertifyService } from './alertify.service';
import { HttpExtensionService } from "./http-extension.service";
import { environment } from '../../environments/environment';
import { NotificationType } from "../models/enums";
import * as moment from 'moment';
import { systemRoutes } from '../models/constants';
import { Response } from '@angular/http';

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
    notification.url = this.getNotificationUrl(notification);
    this.alertifyService.notify(notification);
    this.notificationRecieverSource$.next(notification);
  }


  getUserNotifications(id) {
    return this.httpService.get(this.baseUrl + 'getUserNotifications?id=' + id)
      .map((response: Response) => response.json());
  }

  getFullNotification(notification) {
    let objectType = notification.objectType;
    let objectId = notification.objectId;
    return this.httpService.get(this.baseUrl + 'getNotificationObject?objectType=' + objectType + '&objectId=' + objectId)
      .map((response: Response) => {
        let object = response.json()

        notification.object = object;
        notification.url = this.getNotificationUrl(notification);

        return notification;
      });
  }

  private getNotificationUrl(notification) {
    switch (notification.type) {
      case NotificationType.AppointmentCreated:
        let appointmentDate = moment(notification.object.date).format('YYYY-M-D');
        return '/' + systemRoutes.controlPanel + '/' + systemRoutes.scheduleManagement + ';dFrom=' + appointmentDate + ';dTo=null;id=' + notification.object.id;

      default:
        break;
    }
  }
}
