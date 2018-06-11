import { ProductionConfig } from './config-contract';

export const config: ProductionConfig = {
    production: true,
    host: process.env.host,
    authorization: {
        tokenKey: process.env.TOKEN_KEY,
        tokenExpiration: "1 day"
    },
    db: {
        mongoConnectionString: process.env.MONGO_CONNECTION,
        showMongoLogs: false
    },
    mailSettings: {
        service: "gmail",
        auth: {
            user: "beartoenodemailer@gmail.com",
            pass: process.env.MAIL_PASSWORD
        }
    },
    activationMailUrl: process.env.host + "/activate-mail?token=",
    forgotPasswordUrl: process.env.host + "/forgot-password?token=",
    socialMedia: {
        facebook: {
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        },
        google: {
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }
    },
    outlookIntegration: {
        clientId: '36d37613-08a1-480c-b5e0-28da63cdbcc1',
        thumbprint: process.env.THUMBPRINT,
        authorityUrl: 'https://login.microsoftonline.com/ddd9198a-14e9-4f1b-9f26-f9392049e25a',
        mail: 'ahmed@testRb.onmicrosoft.com',
    }
}