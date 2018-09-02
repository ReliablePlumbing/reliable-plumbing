import { Config } from './config-contract';
import * as path from 'path';

const config: Config = {
    production: false,
    host: process.env.host,
    authorization: {
        tokenKey: "nodeStarterTokenKeyShouldBeUniqueAndLongString",
        tokenExpiration: "1 day"
    },
    db: {
        mongoConnectionString: process.env.MONGO_CONNECTION,
        showMongoLogs: false
    },
    mailSettings: {
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD
        },
        templates: {
            callCreated: 'generic-blue-bg',
            callStatusChanged: 'generic-blue-bg',
            assigneeAdded: 'generic-blue-bg',
            assigneeRemoved: 'generic-red-bg',
            verficationMail: 'generic-blue-bg',
            quoteCreated: 'generic-blue-bg',
            quoteStatusChanged: 'generic-blue-bg',
        }
    },
    activationMailUrl: process.env.clientUrl + "/activate-mail?token=",
    forgotPasswordUrl: process.env.clientUrl + "/forgot-password?token=",
    socketsSettings: {
        registerConnection: "registerConnectionWithUserId",
        notificationsEvent: "notifications",
        updateLocation: "updateLocation",
        updateTrackingMap: "updateTrackingMap",
        trackingsubscription: "trackingsubscription",
        removeTrackingSubscription: "removeTrackingSubscription",
        trackedUserDisconnected: "trackedUserDisconnected"
    },
    notification: {
        messages: {
            appointmentCreated: "New call has been scheduled",
            assgineeAdded: "You have been assigned",
            assgineeRemoved: "You have been unassigned",
            appointmentChanged: "Appointment changed",
            appointmentCheckedIn: "Appointment Checked in",
            quoteCreated: "New Quote has been requested",
            quoteChanged: "Quote Changed"
        }
    },
    socialMedia: {
        facebook: {
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            accessTokenUrl: "https://graph.facebook.com/v2.5/oauth/access_token",
            graphApiUrl: "https://graph.facebook.com/v2.5/me?fields=",
            profileFields: ["id", "email", "first_name", "last_name"]
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            accessTokenUrl: "https://www.googleapis.com/oauth2/v4/token",
            peopleApiUrl: "https://www.googleapis.com/oauth2/v3/userinfo?fields=",
            grantType: "authorization_code",
            profileFields: ["email", "given_name", "family_name", "hd", "email_verified", "name", "locale"]
        }
    },
    outlookIntegration: {
        clientId: process.env.OUTLOOK_CLIENT_ID,
        thumbprint: process.env.THUMBPRINT,
        authorityUrl: process.env.AUTHORITY_URL,
        resource: 'https://outlook.office.com',
        certFilePath: path.join(__dirname, process.env.certFilePath),
        mail: process.env.OUTLOOK_MAIL,
        outlookApiEndPoint: 'https://outlook.office.com/api/v2.0',
        mainCalendarEmail: process.env.OUTLOOK_MAIN_CALEMDAR_MAIL
    },
    filesSettings: {
        basePath: path.join(__dirname, '..\\files'),
        enableGetFiles: true,
        imageMaxHeight: null,
        imageMaxWidth: 750,
        thumbnailWidth: null,
        thumbnailHeight: 50,
        thumbnailExtension: '_thumbnail'
    },
    portalLinks: {
        dateParamFormat: 'MM-DD-YYYY',
        paramsDelimiter: ';',
        scheduleManagement: {
            url: process.env.clientUrl + 'control-panel/schedule-management',
            params: {
                fromDate: 'from',
                toDate: 'to',
                callId: 'id'
            },

        },
        callsHistory: process.env.clientUrl + 'customer-portal/calls-history'
    }
}

export default config;