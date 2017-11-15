import * as nodemailer from 'nodemailer';
import { Inject, Container, Service } from 'typedi';
import { MailLog, MailStatus, Notification, User, ObjectType, NotificationType, Appointment } from '../../3-domain/domain-module';
import { ConfigService, dependencies } from '../../5-cross-cutting/cross-cutting.module';
import { MailLogRepo, UserRepo } from '../../4-data-access/data-access.module';
import { NotificationBroadcastingService } from './notification-broadcasting-service';

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

            for (let user of users) {
                if (~notification.notifierIds.indexOf(user.id))
                    notifiers.push(user);
                else if (~notifeeIds.indexOf(user.id))
                    notifees.push(user);
            }

            let mailContent = this.buildEmail(notification, notifiers, notifees);
            this.bulkSendEmails(notifees.map(n => n.email), mailContent.subject, mailContent.content);

        }).catch((error: Error) => console.log(error));


    }

    sendMail(to: string, subject: string, content: string) {
        let mailSettings = ConfigService.config.mailSettings;
        let transporter = nodemailer.createTransport({
            service: mailSettings.service,
            auth: {
                user: mailSettings.auth.user,
                pass: mailSettings.auth.pass
            }
        });
        let from = mailSettings.auth.user;
        let mailOptions = {
            from: from,
            to: to,
            subject: subject,
            html: content
        };

        transporter.sendMail(mailOptions, (error, info) => {
            let mailLog: MailLog = new MailLog();
            mailLog.sendingDate = new Date(),
                mailLog.from = from,
                mailLog.to = to,
                mailLog.subject = subject,
                mailLog.content = content,
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

    bulkSendEmails(emails: string[], subject: string, content: string) {
        for (let email of emails)
            this.sendMail(email, subject, content);
    }


    private buildEmail(notification: Notification, notifiers: User[], notifees: User[]) {
        let objectType = notification.objectType;
        let mailContent = { subject: '', content: '' };
        switch (objectType) {
            case ObjectType.Appointment:
                mailContent = this.buildAppointmentMailContent(notification, notifiers);
                break;

            default:
                break;
        }

        return mailContent;
    }

    private buildAppointmentMailContent(notification: Notification, notifiers: User[]) {
        let appoint = <Appointment>notification.object;
        let mailContent = {
            subject: '',
            content: ''
        }
        switch (notification.type) {
            case NotificationType.AppointmentCreated:
                mailContent.subject = 'New Call';
                if (appoint.userId == null)
                    mailContent.content += appoint.fullName + '(anonymus) ';
                else if (notifiers.length > 0)
                    mailContent.content += notifiers[0].firstName + ' ' + notifiers[0].lastName + ' ';

                mailContent.content += 'has scheduled a new call at ' + appoint.date.toLocaleDateString() + ' \n'
                mailContent.content += 'you will find the appointment in schedule management in control panel'
                break;
            // todo: list all other cases
            default:
                break;
        }

        return mailContent;
    }
}