import { Config } from './config-contract';

export const config: Config = {
    production: false,
    authorization: {
        tokenKey: "nodeStarterTokenKeyShouldBeUniqueAndLongString",
        tokenExpiration: "1 day"
    },
    db: {
        mongoConnectionString: "mongodb://localhost:27017/developmentDb"
    },
    mailSettings: {
        service: "gmail",
        auth: {
            user: "beartoenodemailer@gmail.com",
            pass: "asdasd123123"
        }
    },
    activationMailUrl: "http://localhost:4200/activate-mail?token=",
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
            appointmentCheckedIn: "Appointment Checked in"
        }
    },
    socialMedia: {
        facebook: {
            clientId: "1865444587114627",
            clientSecret: "09920adfd1bfed688845dd150d7db605",
            accessTokenUrl: "https://graph.facebook.com/v2.5/oauth/access_token",
            graphApiUrl: "https://graph.facebook.com/v2.5/me?fields=",
            profileFields: ["id", "email", "first_name", "last_name"]
        },
        google: {
            clientId: "683536496260-v9qshpnrqn1t83m2mle5f449rap989e7.apps.googleusercontent.com",
            accessTokenUrl: "https://www.googleapis.com/oauth2/v4/token",
            peopleApiUrl: "https://www.googleapis.com/oauth2/v3/userinfo?fields=",
            clientSecret: "3Zp7e-4lwDnq0zb16u9mvYRQ",
            grantType: "authorization_code",
            profileFields: ["email", "given_name", "family_name", "hd", "email_verified", "name", "locale"]
        }
    }
}