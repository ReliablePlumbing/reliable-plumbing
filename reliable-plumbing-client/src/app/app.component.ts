import { Component } from '@angular/core';
import { NotificationService, SocketsService } from './services/services.exports';
@Component({
  selector: 'rb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'rb';

  constructor(private socketsSerivce: SocketsService, private notificationService: NotificationService) { }

  ngOnInit() {
    this.notificationService.connectSockets();
  }
}
