import "reflect-metadata"; // this shim is required
import * as express from 'express';
import * as socketio from 'socket.io';
import * as http from 'http';
import { createExpressServer, Action, useContainer, useExpressServer } from "routing-controllers";
import { UserController } from './controllers/user-controller'
import { Container } from "typedi";
import { Role } from '../3-domain/domain-module'
import { AuthorizationProvider } from './authorization/authorization-provider';
import { registerDependencies } from './utils/dependency-manager/dependency-manager';
import { CustomErrorHandler } from './utils/error-handler/error-handler';

export class App {

    constructor() { }

    static createServer(expressApp) {

        registerDependencies();
        useContainer(Container);
        useExpressServer(expressApp, {
            routePrefix: '/api',
            cors: {
                allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "X-Access-Token", "authorization"],
                // "Access-Control-Allow-Origin","Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type", "CORELATION_ID"],
                credentials: true,
                methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
                origin: '*', // allow only angular app when deployment, social media login http://reliableplumbing.azurewebsites.net
                preflightContinue: false
            },
            defaultErrorHandler: false,
            controllers: [
                __dirname + "/controllers/**/*.js"
            ],
            middlewares: [CustomErrorHandler],
            authorizationChecker: async (action: Action, roles: Role[]) => {
                let token = action.request.headers["authorization"];
                return await AuthorizationProvider.validateToken(token, roles)
            }
        });
    }

    private staregisterControllers(): Function[] | string[] {
        return [
            __dirname + "/controllers/**/*.js"
        ]
    }

}