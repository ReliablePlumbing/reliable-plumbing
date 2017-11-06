import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import * as io from 'socket.io-client';
import { environment } from '../../environments/environment';
import { HttpExtensionService } from './http-extension.service';
import { EnvironmentService } from './environment.service';
import { NotificationService } from './notification.service';
import * as uuid from 'uuid';
import { Role } from '../models/enums';

@Injectable()
export class SocketsService {

  private apiUrl = environment.apiUrl;
  private socketsUrl = environment.socketsUrl;
  private socketsSettings = null;
  private socketsonnection;
  private watchId;
  private connectionDetails;
  private callbacks: any = {};

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

        this.connectionDetails = { clientId: uuid(), userId: currentUser.id };

        this.socketsonnection.emit(this.socketsSettings.registerConnection, this.connectionDetails);
        this.hookToGeoLocation(this.connectionDetails);

        this.socketsonnection.on('reconnect', () => {
          console.log('Reconnected to the server');
          if (!this.environmentService.isUserLoggedIn)
            return;

          this.socketsonnection.emit(this.socketsSettings.registerConnection, this.connectionDetails);
          this.hookToGeoLocation(this.connectionDetails);
        });

        this.socketsonnection.on('disconnect', _ => {
          console.log('disconnected')
          navigator.geolocation.clearWatch(this.watchId);
        })

        // listen to comming notifications
        this.socketsonnection.on(this.socketsSettings.notificationsEvent, notification => {
          this.notificationService.broadcastNotification(notification);
        });


        // subscribe when user logout to remove all listeners
        this.environmentService.userLoggedout.subscribe(_ => {
          this.socketsonnection.removeAllListeners(this.socketsSettings.registerConnection);
          this.socketsonnection.removeAllListeners(this.socketsSettings.updateTrackingMap);
          this.socketsonnection.disconnect()
        });

      });
  }

  listenToLocationUpdates(updateMapCallback, trackedUserCallback) {
    this.callbacks.updateMapCallback = updateMapCallback;
    this.callbacks.trackedUserCallback = trackedUserCallback;

    this.socketsonnection.emit(this.socketsSettings.trackingsubscription, {
      userId: this.environmentService.currentUser.id,
      clientId: this.connectionDetails.clientId
    })
    this.socketsonnection.on(this.socketsSettings.updateTrackingMap, updateMapCallback);
    this.socketsonnection.on(this.socketsSettings.trackedUserDisconnected, trackedUserCallback);
  }

  removeLocationUpdatesListeners() {
    // this.socketsonnection.removeListener(this.socketsSettings.updateTrackingMap, this.callbacks.updateMapCallback);
    // this.socketsonnection.removeListener(this.socketsSettings.trackedUserDisconnected, this.callbacks.trackedUserCallback);
    this.socketsonnection.emit(this.socketsSettings.removeTrackingSubscription, {
      userId: this.environmentService.currentUser.id,
      clientId: this.connectionDetails.clientId
    })
    this.socketsonnection.removeAllListeners(this.socketsSettings.updateTrackingMap);
    this.socketsonnection.removeAllListeners(this.socketsSettings.trackedUserDisconnected);
  }

  private hookToGeoLocation(connection) {
    let roles = this.environmentService.currentUser.roles;
    if (!~roles.indexOf(Role.Technician))
      return;

    if (navigator.geolocation != null)
      navigator.geolocation.getCurrentPosition(p => {
        let location = {
          userId: connection.userId,
          clientId: connection.clientId,
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          timestamp: p.timestamp
        };

        this.socketsonnection.emit(this.socketsSettings.updateLocation, location);
      })

    // this.watchId = navigator.geolocation.watchPosition((p) => {
    //   let location = {
    //     userId: connection.userId,
    //     clientId: connection.clientId,
    //     lat: p.coords.latitude,
    //     lng: p.coords.longitude,
    //     timestamp: p.timestamp
    //   };

    //   this.socketsonnection.emit(this.socketsSettings.updateLocation, location);
    // }, () => {
    //   debugger;
    // }, {
    //     timeout: Infinity,
    //     enableHighAccuracy: true,
    //   })
  }
}
