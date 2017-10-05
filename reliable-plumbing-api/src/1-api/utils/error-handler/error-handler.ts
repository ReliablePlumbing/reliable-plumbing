import {Middleware, ExpressErrorMiddlewareInterface} from "routing-controllers";
import { Response } from 'express';
@Middleware({ type: "after" })
export class CustomErrorHandler implements ExpressErrorMiddlewareInterface {

    error(error: any, request: any, response: Response, next: (err: any) => any) {
        // console.log("do something...");
        response.statusCode = error.httpCode != null ? error.httpCode : 400;
        response.send(error.message);
       // next('error from handler');
    }

}