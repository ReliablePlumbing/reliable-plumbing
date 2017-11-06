export interface Config {
    authorization: {
        tokenKey: string,
        tokenExpiration: string
    };

    db: {
        mongoConnectionString: string
    };

    mailSettings: {
        service: string,
        auth: {
            user: string,
            pass: string
        }
    };

    activationMailUrl: string;

    socketsSettings: {
        registerConnection: string,
        notificationsEvent: string,
        updateLocation: string,
        updateTrackingMap: string,
        trackingsubscription: string,
        trackedUserDisconnected: string,
        removeTrackingSubscription: string
    };

    notification: {
        messages: {
            appointmentCreated: string,
            assgineeAdded: string,
            assgineeRemoved: string,
            appointmentChanged: string,
            appointmentCheckedIn: string
        }
    }

    socialMedia: {
        facebook: {
            clientId: string,
            clientSecret: string,
            accessTokenUrl: string,
            graphApiUrl: string,
            profileFields: string[]
        },
        google: {
            clientId: string,
            accessTokenUrl: string,
            peopleApiUrl: string,
            clientSecret: string,
            grantType: string,
            profileFields: string[]
        }
    }
}
