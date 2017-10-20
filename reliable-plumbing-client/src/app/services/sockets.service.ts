import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import * as io from 'socket.io-client';
import { environment } from '../../environments/environment';
import { HttpExtensionService } from './http-extension.service';
import { EnvironmentService } from './environment.service';
import { NotificationService } from './notification.service';

@Injectable()
export class SocketsService {

  private apiUrl = environment.apiUrl;
  private socketsUrl = environment.socketsUrl;
  private socketsSettings = null;
  private socketsonnection;

  constructor(private httpService: HttpExtensionService, private environmentService: EnvironmentService,
    private notificationService: NotificationService) {
    this.notificationService.connectionRequested.subscribe(_ => this.connectToSockets());
  }

  connectToSockets() {
    if (!this.environmentService.isUserLoggedIn) {
      console.error('user is not logged in');
      return;
    }

    let currentUser = this.environmentService.currentUser;

    this.httpService.get(this.apiUrl + 'settings/socketsSettings')
      .map((response: Response) => response.json())
      .subscribe(settings => {
        this.socketsSettings = settings;

        this.socketsonnection = io.connect(this.socketsUrl);
        this.socketsonnection.emit(this.socketsSettings.registerConnection, currentUser.id);

        this.socketsonnection.on('reconnect', () => {
          console.log('Reconnected to the server');
          this.socketsonnection.emit(this.socketsSettings.registerConnection, currentUser.id);
        });

        this.socketsonnection.on('disconnect', _ => console.log('disconnected'))

        this.socketsonnection.on(this.socketsSettings.notificationsEvent, notification => {
          this.notificationService.broadcastNotification(notification);
        });
      });
  }
}
