import { JsonController, Param, QueryParam, Body, Get, Post, Put, Delete, Authorized, UseInterceptor } from "routing-controllers";
import { ConfigService } from '../../5-cross-cutting/cross-cutting.module';

@JsonController('/settings')
export class SettingsController {

    @Get('/socketsSettings')
    @Authorized()
    getSocketsSettings() {
        return ConfigService.config.socketsSettings;
    }

}