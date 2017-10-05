import "reflect-metadata"; // this shim is required
import { createExpressServer, Action, useContainer } from "routing-controllers";
import { UserController } from './controllers/user-controller'
import { Container } from "typedi";
import { Role } from '../3-domain/domain-module'
import { AuthorizationProvider } from './authorization/authorization-provider'
import { registerDependencies } from './utils/dependency-manager/dependency-manager';
import { CustomErrorHandler } from './utils/error-handler/error-handler';

export class App {

    constructor() { }

    createServer() {
        registerDependencies();
        useContainer(Container);
        return createExpressServer({
            routePrefix: '/api',
            cors: true, // for now but use express cors to configure certain cors for the api 
            defaultErrorHandler: false,
            controllers: this.registerControllers(),
            middlewares: [CustomErrorHandler],
            authorizationChecker: async (action: Action, roles: Role[]) => {
                let token = action.request.headers["authorization"];
                return await AuthorizationProvider.validateToken(token)


               // return false;
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