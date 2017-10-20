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
        notificationsEvent: string
    };
}
