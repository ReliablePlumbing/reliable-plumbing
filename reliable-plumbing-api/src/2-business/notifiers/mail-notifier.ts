import * as nodemailer from 'nodemailer';
import { Inject, Container, Service } from 'typedi';
import { MailLog, MailStatus, Notification, User, ObjectType, NotificationType, Appointment, Quote, AppointmentStatus, QuoteStatus, Role } from '../../3-domain/domain-module';
import { dependencies } from '../../5-cross-cutting/cross-cutting.module';
import { MailLogRepo, UserRepo } from '../../4-data-access/data-access.module';
import { NotificationBroadcastingService } from './notification-broadcasting-service';
import config from '../../config';
import * as path from 'path';
import * as dns from 'dns';
const hbs = require('nodemailer-express-handlebars');

@Service()
export class MailNotifier {

    @Inject(dependencies.MailLogRepo)
    private emailLogRepo: MailLogRepo

    @Inject(dependencies.UserRepo)
    private userRepo: UserRepo

    constructor(broadcastingService: NotificationBroadcastingService) {
        broadcastingService.notificationBroadcasted.subscribe((notification: Notification) => {
            this.handleBroadcast(notification);
        })
    }

    handleBroadcast(notification: Notification) {
        let notifeeIds = notification.notifees.map(n => n.userId);
        let userIds = notification.notifierIds.concat(notifeeIds);

        let repo: UserRepo = Container.get(dependencies.UserRepo);
        repo.findUsersByIds(userIds).then(users => {
            let notifiers: User[] = [];
            let notifees: User[] = [];

            users.forEach(user => {
                if (~notification.notifierIds.indexOf(user.id))
                    notifiers.push(user);
                else if (~notifeeIds.indexOf(user.id))
                    notifees.push(user);
            });

            let mailsDetails = this.buildEmails(notification, notifees, notifiers);
            this.bulkSendEmails(mailsDetails);

        }).catch((error: Error) => console.log(error));


    }

    private buildEmails(notification: Notification, notifees: User[], notifiers: User[]) {
        let objectType = notification.objectType;
        let mailsDetails = [];
        switch (objectType) {
            case ObjectType.Appointment:
                notifees.forEach(notifee => mailsDetails.push(this.buildCallMailContent(notification, notifee, notifiers)));
                break;
            case ObjectType.Quote:
                notifees.forEach(notifee => mailsDetails.push(this.buildQuoteMailContent(notification, notifee, notifiers)));
                break;

            default:
                break;
        }

        return mailsDetails;
    }

    private buildCallMailContent(notification: Notification, notifee: User, notifiers: User[]) {
        let call = <Appointment>notification.object;
        let mailContent: any = {
            to: notifee.email,
            subject: '',
            template: '',
            context: {
            }
        }
        switch (notification.type) {
            case NotificationType.CallCreated:
                mailContent.subject = 'Reliable Plumbing - New Work Order';
                mailContent.template = config.mailSettings.templates.callCreated;
                mailContent.context.notifeeName = notifee.firstName + ' ' + (notifee.lastName ? notifee.lastName : '');
                mailContent.context.firstLine = 'A new work order has been added to your portal.';
                mailContent.context.secondLine = 'Please login your admin portal now to view your work order.';
                mailContent.context.btnLbl = 'View Work Order';
                mailContent.context.link = config.mailSettings.links.scheduleManagement;
                break;
            case NotificationType.CallStatusChanged:
                mailContent.subject = 'Reliable Plumbing - Call ' + AppointmentStatus[call.status];
                mailContent.template = config.mailSettings.templates.callStatusChanged;
                mailContent.context.notifeeName = notifee.firstName + ' ' + (notifee.lastName ? notifee.lastName : '');
                mailContent.context.firstLine = 'Your call has been ' + AppointmentStatus[call.status];
                mailContent.context.secondLine = 'Please login to view your upcoming calls.';
                mailContent.context.btnLbl = 'View Call';
                notifee.roles.forEach(role => {
                    switch (role) {
                        case Role.Admin:
                        case Role.SystemAdmin:
                        case Role.Supervisor:
                            mailContent.context.link = config.mailSettings.links.scheduleManagement;
                            break;
                        case Role.Technician:
                            mailContent.context.link = config.mailSettings.links.myCalls;
                            break;
                        case Role.Customer:
                            mailContent.context.link = config.mailSettings.links.callsHistory;
                            break;
                    }
                })
                mailContent.context.link = config.mailSettings.links.myCalls;
                break;
            case NotificationType.AssigneeAdded:
                mailContent.subject = 'Reliable Plumbing - Call Assigned';
                mailContent.template = config.mailSettings.templates.assigneeAdded;
                mailContent.context.notifeeName = notifee.firstName + ' ' + (notifee.lastName ? notifee.lastName : '');
                mailContent.context.firstLine = 'A new call has been assigned to you';
                mailContent.context.secondLine = 'Please login to view your assigned calls.';
                mailContent.context.btnLbl = 'View Call';
                mailContent.context.link = config.mailSettings.links.myCalls;
                break;
            case NotificationType.AssigneeRemoved:
                mailContent.subject = 'Reliable Plumbing - Unassigned Call';
                mailContent.template = config.mailSettings.templates.assigneeRemoved;
                mailContent.context.notifeeName = notifee.firstName + ' ' + (notifee.lastName ? notifee.lastName : '');
                mailContent.context.firstLine = 'You have been unassigned from call';
                mailContent.context.secondLine = 'Please login to view your assigned calls.';
                mailContent.context.btnLbl = 'View My Calls';
                mailContent.context.link = config.mailSettings.links.myCalls;
                break;
            default:
                break;
        }

        return mailContent;
    }

    private buildQuoteMailContent(notification: Notification, notifee: User, notifiers: User[]) {
        let quote = <Quote>notification.object;
        let mailContent: any = {
            to: notifee.email,
            subject: '',
            template: '',
            context: {
            }
        }
        switch (notification.type) {
            case NotificationType.QuoteCreated:
                mailContent.subject = 'Reliable Plumbing - New Quote';
                mailContent.template = config.mailSettings.templates.quoteCreated;
                mailContent.context.notifeeName = notifee.firstName + ' ' + (notifee.lastName ? notifee.lastName : '');
                mailContent.context.firstLine = 'A new Quote has been requested and added to your portal.';
                mailContent.context.secondLine = 'Please login your admin portal now to view the new Quote.';
                mailContent.context.btnLbl = 'View Quote';
                mailContent.context.link = '';
                break;
            case NotificationType.QuoteStatusChanged:
                mailContent.subject = 'Reliable Plumbing - Quote ' + QuoteStatus[quote.status];
                mailContent.template = config.mailSettings.templates.quoteStatusChanged;
                mailContent.context.notifeeName = notifee.firstName + ' ' + (notifee.lastName ? notifee.lastName : '');
                let promise: Promise<any> = null;
                switch (quote.status) {
                    case QuoteStatus.Pending:
                        mailContent.context.firstLine = 'Your quote has been estimated and needs your approval.';
                        mailContent.context.secondLine = 'Please login to your portal to approve the Quote.';
                        break;
                    case QuoteStatus.Approved:
                        mailContent.context.firstLine = 'A quote has been approved.';
                        mailContent.context.secondLine = 'Please login your admin portal now to view the new Quote.';
                        break;
                    case QuoteStatus.Rejected:
                        mailContent.context.firstLine = 'A quote has been rejected.';
                        mailContent.context.secondLine = 'Please login your admin portal now to view the new Quote.';
                        break;
                }
                mailContent.context.btnLbl = 'View Quote';
                mailContent.context.link = '';
                break;

            default:
                break;
        }

        return mailContent;
    }


    sendMail(mail) {
        let mailSettings = config.mailSettings;
        let transporter = nodemailer.createTransport({
            service: mailSettings.service,
            auth: {
                user: mailSettings.auth.user,
                pass: mailSettings.auth.pass
            }
            // debug: true,
            // host: 'remote.sdreliableplumbing.com',
            // port: 25,
            // secure: false,
            // auth: {
            //     user: 'SDRP\\NoReply',//mailSettings.auth.user,
            //     pass: '##Welcome2018!!', //mailSettings.auth.pass
            // }
        });

        transporter.use('compile', hbs({
            viewEngine: { extname: '.hbs' },
            viewPath: path.join(__dirname, '../../assets', 'mail-templates'),
            extName: '.hbs'
        }));
        // let from = 'NoReply@SDReliablePlumbing.com'; //mailSettings.auth.user;
        let from = mailSettings.auth.user;
        let mailOptions = {
            from: from,
            // to: 'NoReply@SDReliablePlumbing.com',// to,
            to: mail.to,
            subject: mail.subject,
            template: mail.template,
            context: mail.context
        };
        mailOptions.context.host = config.host;

        transporter.sendMail(mailOptions, (error, info) => {
            let mailLog: MailLog = new MailLog();
            mailLog.sendingDate = new Date(),
                mailLog.from = from,
                mailLog.to = mail.to,//to,
                mailLog.subject = mail.subject,
                mailLog.status = MailStatus.success

            if (error) {
                mailLog.status = MailStatus.fail;
                mailLog.errorMessage = error.name + ': ' + error.message;
            }

            this.emailLogRepo.add(mailLog).then(res => {
                // send notification here that mail has been sent to activate
                console.log(res);
            })
        });
    }

    bulkSendEmails(mailsDetails: any[]) {
        for (let mail of mailsDetails)
            this.sendMail(mail);
    }

}