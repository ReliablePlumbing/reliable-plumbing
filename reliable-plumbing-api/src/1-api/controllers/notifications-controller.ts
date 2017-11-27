import { JsonController, Param, QueryParam, Body, Get, Post, Put, Authorized } from "routing-controllers";
import { Notification, ObjectType } from '../../3-domain/domain-module';
import { NotificationManager } from '../../2-business/business.module';
import { dependencies } from '../../5-cross-cutting/cross-cutting.module';
import { Inject } from 'typedi';

@JsonController('/notifications')
export class notificationController {

    @Inject(dependencies.NotificationManager)
    private notificationManager: NotificationManager;


    @Get('/getUserNotifications')
    @Authorized()
    getUserNotifications( @QueryParam('id') id: string) {
        return new Promise<any[]>((resolve, reject) => {
            this.notificationManager.getUserNotifications(id).then(results => {
                let models = results.map(notf => notf.toLightModel());
                return resolve(models);
            }).catch((error: Error) => reject(error));
        });

    }

    @Get('/getNotificationObject')
    @Authorized()
    getNotificationObject( @QueryParam('objectType') objectType: ObjectType, @QueryParam('objectId') objectId: string) {

        return new Promise<any>((resolve, reject) => {
            this.notificationManager.getNotificationObject(objectType, objectId)
                .then(result => resolve(result.toLightModel()))
                .catch((error: Error) => reject(error));

        });
    }

}