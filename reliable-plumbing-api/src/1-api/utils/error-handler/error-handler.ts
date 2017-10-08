import { Middleware, ExpressErrorMiddlewareInterface } from "routing-controllers";
import { Response } from 'express';

@Middleware({ type: "after" })
export class CustomErrorHandler implements ExpressErrorMiddlewareInterface {

    error(error: any, request: any, response: Response, next: (err: any) => any) {
        let statusCode = 500;
        let body = error.message; // check for the environemt here

        if (error.errorType != null) {
            statusCode = 400;
            body = {
                errorType: error.errorType,
                message: error.message
            };
        }

        response.statusCode = statusCode;
        response.send(body);
    }

}