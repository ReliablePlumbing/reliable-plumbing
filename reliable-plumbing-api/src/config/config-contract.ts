export interface Config {
    production: boolean,
    host: string,
    authorization: {
        tokenKey: string,
        tokenExpiration: string
    };

    db: {
        mongoConnectionString: string,
        showMongoLogs: boolean
    };

    mailSettings: {
        service: string,
        auth: {
            user: string,
            pass: string
        },
        templates: {
            callCreated: string,
            callStatusChanged: string,
            assigneeAdded: string,
            assigneeRemoved: string,
            verficationMail: string,
            quoteCreated: string,
            quoteStatusChanged: string
        }
    };

    activationMailUrl: string;
    forgotPasswordUrl: string;

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
            appointmentCheckedIn: string,
            quoteCreated: string,
            quoteChanged: string
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

    outlookIntegration: {
        clientId: string,
        thumbprint: string,
        certFilePath: string,
        resource: string,
        authorityUrl: string,
        mail: string,
        outlookApiEndPoint: string,
        mainCalendarEmail: string
    }

    filesSettings: {
        basePath: string,
        enableGetFiles: boolean,
        imageMaxHeight: number,
        imageMaxWidth: number,
        thumbnailWidth: number,
        thumbnailHeight: number,
        thumbnailExtension: string
    },
    portalLinks: {
        paramsDelimiter: string,
        dateParamFormat: string
        scheduleManagement: {
            url: string,
            params: {
                fromDate: string,
                toDate?: string,
                callId: string
            }
        },
        callsHistory: string
    }
}