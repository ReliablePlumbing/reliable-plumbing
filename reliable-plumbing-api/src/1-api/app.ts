import "reflect-metadata"; // this shim is required
import { createExpressServer, Action, useContainer } from "routing-controllers";
import { UserController } from './controllers/user-controller'
import { Container } from "typedi";
import { Role } from '../3-domain/domain-module'
import { AuthorizationProvider } from './authorization/authorization-provider';
import { registerDependencies } from './utils/dependency-manager/dependency-manager';
import { CustomErrorHandler } from './utils/error-handler/error-handler';

export class App {

    constructor() { }

    createServer() {
        registerDependencies();
        useContainer(Container);
        return createExpressServer({
            routePrefix: '/api',
            cors: {
                allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "X-Access-Token", "authorization"],
                // "Access-Control-Allow-Origin","Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type", "CORELATION_ID"],
                credentials: true,
                methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
                origin: '*', // allow only for angular app when deployment, social media login
                preflightContinue: false
            },
            defaultErrorHandler: false,
            controllers: this.registerControllers(),
            middlewares: [CustomErrorHandler],
            authorizationChecker: async (action: Action, roles: Role[]) => {
                let token = action.request.headers["authorization"];
                return await AuthorizationProvider.validateToken(token, roles)
            }
        });
    }

    private registerControllers(): Function[] | string[] {
        return [
            __dirname + "/controllers/**/*.js"
        ]
    }

}

//export default new App().Options;