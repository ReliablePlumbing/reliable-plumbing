import * as nodemailer from 'nodemailer';
import { Inject } from 'typedi';
import { MailLog, MailStatus } from '../../3-domain/domain-module';
import { ConfigService, dependcies } from '../../5-cross-cutting/cross-cutting.module';
import { MailLogRepo } from '../../4-data-access/data-access.module';

export class MailNotifierManager {

    @Inject(dependcies.MailLogRepo)
    private emailLogRepo: MailLogRepo

    constructor() {

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
}