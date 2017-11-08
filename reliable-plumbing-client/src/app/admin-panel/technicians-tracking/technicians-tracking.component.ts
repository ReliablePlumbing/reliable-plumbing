import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketsService, UserManagementService } from '../../services/services.exports';

@Component({
  selector: 'rb-technicians-tracking',
  templateUrl: './technicians-tracking.component.html',
  styleUrls: ['./technicians-tracking.component.scss']
})
export class TechniciansTrackingComponent implements OnInit, OnDestroy {

  markers: any[] = [];
  loading;
  technicians;

  constructor(private socketService: SocketsService, private userManagementService: UserManagementService) { }

  ngOnInit() {
    this.userManagementService.getAllTechniciansWithLocations().subscribe(results => {
      console.log('from tracking page', results)
      this.technicians = results.technicians;
      this.markOnlineOffLinetechnicians(results.onlineTechniciansWithLocations);
    })

    this.socketService.listenToLocationUpdates(
      (location) => this.addUpdateTrackedUserClient(location), // subscibe to tracking
      (userDetails) => this.removeTrackedUser(userDetails)  // unsubscribe from tracking
    );
  }

  addUpdateTrackedUserClient(location) {
    let clientIndex = this.markers.findIndex(m => m.clientId == location.clientId);

    let technician = null;
    for (let tech of this.technicians)
      if (tech.id == location.userId) {
        technician = tech;
        let clientIndex = tech.clients.findIndex(c => c == location.clientId);
        if (!~clientIndex)
          tech.clients.push(location.clientId);

        tech.online = true;
      }
    if (!~clientIndex) {
      this.markers.push({
        userId: location.userId,
        clientId: location.clientId,
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng),
        name: technician == null? '' : technician.firstName + ' ' + technician.lastName,
        timestamp: location.timestamp
      });
    }
    else {
      let marker = this.markers[clientIndex];

      marker.lat = parseFloat(location.lat);
      marker.lng = parseFloat(location.lng);
      marker.timestamp = location.timestamp;
      marker.name = technician == null? '' : technician.firstName + ' ' + technician.lastName;      
    }
  }

  markOnlineOffLinetechnicians(onlineTechniciansWithLocations) {
    for (let tech of this.technicians) {

      let technicinClients = onlineTechniciansWithLocations[tech.id];

      if (technicinClients != null && technicinClients.length > 0) {
        tech.online = true;
        tech.clients = technicinClients.map(techClient => techClient.clientId);
        for (let userClient of technicinClients) {
          this.addUpdateTrackedUserClient(userClient);
        }
      } else {
        tech.online = false;
        tech.clients = [];

      }
    }
  }

  removeTrackedUser(userDetails) {
    for (let tech of this.technicians) {
      if (tech.id == userDetails.userId) {
        tech.clients = tech.clients.filter(c => c != userDetails.clientId);
        tech.online = tech.clients.length > 0;
        break;
      }
    }

    this.markers = this.markers.filter(m => m.clientId != userDetails.clientId);
  }

  ngOnDestroy() {
    this.socketService.removeLocationUpdatesListeners();
  }

}
