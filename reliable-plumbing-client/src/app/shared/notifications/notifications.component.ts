import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { NotificationService, EnvironmentService } from '../../services/services.exports';
import { Router } from '@angular/router';

@Component({
  selector: 'notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  notifications = [];
  @Output() notificationClicked: EventEmitter<any> = new EventEmitter<any>()

  constructor(private notificationService: NotificationService, private environmentService: EnvironmentService, private router: Router) { }

  ngOnInit() {
    let currentUser: any = this.environmentService.currentUser;
    this.notificationService.getUserNotifications(currentUser.id).subscribe(results => {
      this.buildNotifications(results);
    })
    this.notificationService.notificationRecieved
      .subscribe(notification => this.handlePushedNotification(notification));
  }

  handlePushedNotification(notification) {
    let mappedNotification = this.buildNotification(notification);
    this.notifications.push(mappedNotification);
    this.sortNotifications();
  }


  buildNotification(notification) {
    let currentUserId = this.environmentService.currentUser.id;
    let notifee = notification.notifees.find(n => n.userId == currentUserId);
    notification.seen = notifee != null && notifee.seen;

    return notification;
  }

  buildNotifications(notifications) {
    for (let notification of notifications)
      this.notifications.push(this.buildNotification(notification));
    this.sortNotifications();
  }


  sortNotifications() {

    this.notifications = this.notifications.sort((n1, n2) => {
      if (n1.creationDate == n2.creationDate)
        return 0;
      else if (n1.creationDate > n2.creationDate)
        return -1;
      else if (n1.creationDate < n2.creationDate)
        return 1;
    })
  }

  navigateToNotificationLink(notification) {
    this.notificationService.getFullNotification(notification).subscribe(modifiedNotification => {
      this.notificationClicked.emit();
      this.router.navigateByUrl(modifiedNotification.url);

    })
  }

}
