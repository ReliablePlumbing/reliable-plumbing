import { Service, Inject, Container } from 'typedi';
import { NotificationBroadcastingService } from './notification-broadcasting-service';
import { Notification, NotificationType } from '../../3-domain/domain-module';
import config from '../../config';
import * as outlook from 'node-outlook';
import * as adal from 'adal-node';
import * as fs from 'fs';
@Service()
export class OutlookNotifier {

  constructor(broadcastingService: NotificationBroadcastingService) {
    broadcastingService.notificationBroadcasted.subscribe((notification: Notification) => {
      this.handleBroadcast(notification);
    })
  }

  handleBroadcast(notification: Notification) {
    // if (notification.type != NotificationType.AssigneeAdded)
    //   return;

    // let clientId = config.outlookIntegration.clientId,
    //   thumbprint = config.outlookIntegration.thumbprint,
    //   certFilePath = config.outlookIntegration.certFilePath,
    //   authorityUrl = config.outlookIntegration.authorityUrl,
    //   resource = config.outlookIntegration.resource,
    //   privateKey = fs.readFileSync(certFilePath, { encoding: 'utf8' });

    // let AuthenticationContext = adal.AuthenticationContext;
    // let context = new AuthenticationContext(authorityUrl);

    // context.acquireTokenWithClientCertificate(resource, clientId, privateKey, thumbprint,
    //   (error, tokenResponse: any) => {
    //     if (error)
    //       console.log('ERROR acquiring token: ' + error.stack);
    //     else {
    //       // switch for notification type, if creating, removing or updating event 
    //       this.createCalendarEvent(tokenResponse.accessToken);
    //     }
    //   });
  }

  createCalendarEvent(token) {
    outlook.base.setApiEndpoint(config.outlookIntegration.outlookApiEndPoint);

    var newEvent = {
      "Subject": "Discuss the Calendar REST API",
      "Body": {
        "ContentType": "HTML",
        "Content": "I think it will meet our requirements!"
      },
      "Start": {
        "DateTime": "2017-11-19T18:00:00",
        "TimeZone": "Eastern Standard Time"
      },
      "End": {
        "DateTime": "2017-11-19T19:00:00",
        "TimeZone": "Eastern Standard Time"
      },
      "Attendees": [
        {
          "EmailAddress": {
            "Address": "ahmed_hig90@outlook.com",
            "Name": "Ahmed Hussein"
          },
          "Type": "Required"
        }
      ]
    };

    // Pass the user's email address
    var userInfo = {
      email: config.outlookIntegration.mail
    };

    outlook.calendar.createEvent({ token: token, event: newEvent, user: userInfo },
      function (error, result) {
        if (error) 
          console.log('createEvent returned an error: ' + error);
        
        else if (result) {
          console.log(JSON.stringify(result, null, 2));
        }
      });
  }

}