import { Service, Inject, Container } from 'typedi';
import { NotificationBroadcastingService } from './notification-broadcasting-service';
import { Notification, NotificationType, Appointment, AppointmentType, Role } from '../../3-domain/domain-module';
import config from '../../config';
import * as outlook from 'node-outlook';
import * as adal from 'adal-node';
import * as fs from 'fs';
import * as request from 'request';
import * as moment from 'moment';
import { buildCallPortalUrl } from './notifiers.helpers';

@Service()
export class OutlookNotifier {

  constructor(broadcastingService: NotificationBroadcastingService) {
    broadcastingService.notificationBroadcasted.subscribe((notification: Notification) => {
      this.handleBroadcast(notification);
    })
  }

  handleBroadcast(notification: Notification) {
    if (notification.type != NotificationType.AssigneeAdded && notification.type != NotificationType.CallCreated)
      return;

    if (notification.type == NotificationType.CallCreated && !config.outlookIntegration.mainCalendarEmail)
      return;

    let clientId = config.outlookIntegration.clientId,
      thumbprint = config.outlookIntegration.thumbprint,
      certFilePath = config.outlookIntegration.certFilePath,
      authorityUrl = config.outlookIntegration.authorityUrl,
      resource = config.outlookIntegration.resource,
      privateKey = fs.readFileSync(certFilePath, { encoding: 'utf8' });

    let AuthenticationContext = adal.AuthenticationContext;
    let context = new AuthenticationContext(authorityUrl);


    context.acquireTokenWithClientCertificate(resource, clientId, privateKey, thumbprint,
      (error, tokenResponse: any) => {
        if (error)
          console.log('ERROR acquiring token: ' + error.stack);
        else {
          // switch for notification type, if creating, removing or updating event 
          let call = <Appointment>notification.object;
          let attendees = this.getAttendees(call, notification.type)
          this.createCalendarEvent(tokenResponse.accessToken, call, attendees);
        }
      });
  }

  createCalendarEvent(token, call: Appointment, attendees: any[]) {
    outlook.base.setApiEndpoint(config.outlookIntegration.outlookApiEndPoint);

    let userDetails = this.getUserDetails(call);
    let url = buildCallPortalUrl([Role.Technician], call);

    var newEvent = {
      "Subject": call.type.name,
      "Location": {
        "DisplayName": userDetails.address,
        "Address": null
      },
      "Body": {
        "ContentType": "HTML",
        "Content": `Point of contact: ${userDetails.fullName} <br/>
        Telephone number: ${userDetails.mobile} <br/>
        Description of job: ${call.message ? call.message : '---'} <br/>
        <div><a href="${url}">View Call</a></div>
        `
      },
      "Start": {
        "DateTime": call.date,
        "TimeZone": "UTC"
      },
      "End": {
        "DateTime": moment(call.date).add(2, 'hours').format('YYYY-MM-DD HH:mm:ss zZZ'),
        "TimeZone": "UTC"
      },
      "Attendees": attendees
    };

    // Pass the user's email address
    var userInfo = {
      email: config.outlookIntegration.mail
    };

    outlook.calendar.createEvent({ token: token, event: newEvent, user: userInfo },
      function (error, result) {
        if (error)
          console.log('createEvent returned an error: ' + error);

        //#region  accept on behalf of attendees code
        // else if (result) {
        //   // console.log(JSON.stringify(result, null, 2));
        //   let eventId = result.Id;
        //   var options = {
        //     method: 'POST',
        //     url: 'https://outlook.office.com/api/v2.0/Users/support@sdreliableplumbing.com/events/' + eventId + '/accept',
        //     headers: {
        //       'Content-Type': 'application/json'
        //     },
        //     auth: { 'bearer': token },
        //     json: true,
        //     body: {
        //       "SendResponse": "true"
        //     }
        //   };
        //   request(options, (error, response, body) => {
        //     if (error)
        //       console.log(error);
        //     else if (response)
        //       console.log(response);
        //   })

        // }
        //#endregion
      });
  }

  getUserDetails(call: Appointment) {
    let user: any = {};
    if (call.user) {
      let site = call.user.sites.find(s => s.id == call.siteId);
      user.fullName = call.user.firstName + ' ' + (call.user.lastName ? call.user.lastName : '');
      user.address = site.street + ' - ' + site.city + ' - ' + site.state;
      user.mobile = call.user.mobile;
    }
    else {
      user.fullName = call.customerInfo.firstName + ' ' + (call.customerInfo.lastName ? call.customerInfo.lastName : '');
      user.address = call.customerInfo.street + ' - ' + call.customerInfo.city + ' - ' + call.customerInfo.state;
      user.mobile = call.customerInfo.mobile;
    }

    return user;
  }

  getAttendees(call: Appointment, notificationType: NotificationType) {
    if (notificationType == NotificationType.AssigneeAdded) {
      return call.assignees.map(assignee => {
        return {
          EmailAddress: {
            Address: assignee.email,
            Name: assignee.firstName + ' ' + (assignee.lastName ? assignee.lastName : '')
          },
          Type: 'Required'
        }
      });
    }
    else if (notificationType == NotificationType.CallCreated) {
      return [
        {
          EmailAddress: {
            Address: config.outlookIntegration.mainCalendarEmail,
            Name: 'Main Calendar'
          },
          Type: 'Required'
        }
      ];
    }

    return [];
  }

}