import { JsonController, Param, QueryParam, Body, Get, Post, Put, Delete, Authorized, UseInterceptor } from "routing-controllers";
import config from '../../config';

@JsonController('/settings')
export class SettingsController {

    @Get('/socketsSettings')
    @Authorized()
    getSocketsSettings() {
        return config.socketsSettings;
    }

}