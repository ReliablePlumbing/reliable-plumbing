import { ProductionConfig } from './config-contract';

export const config: ProductionConfig = {
    production: true,
    authorization: {
        tokenKey: process.env.TOKEN_KEY,
        tokenExpiration: "1 day"
    },
    db: {
        mongoConnectionString: process.env.MONGO_CONNECTION
    },
    mailSettings: {
        service: "gmail",
        auth: {
            user: "beartoenodemailer@gmail.com",
            pass: process.env.MAIL_PASSWORD
        }
    },
    activationMailUrl: "http://ec2-18-217-44-139.us-east-2.compute.amazonaws.com/activate-mail?token=",
    socialMedia: {
        facebook: {
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        },
        google: {
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }
    }
}