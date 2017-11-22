import { Observable, Subject } from '@reactivex/rxjs';
import { Service, Inject, Container } from 'typedi';
import { Notification, ObjectType } from '../../3-domain/domain-module';
import { dependencies } from '../../5-cross-cutting/cross-cutting.module';
import { AppointmentRepo } from '../../4-data-access/data-access.module';

@Service()
export class NotificationBroadcastingService {

    @Inject(dependencies.AppointmentRepo)
    private appointmentRepo: AppointmentRepo;

    private broadcastingSource$: Subject<Notification> = new Subject<Notification>();

    notificationBroadcasted: Observable<Notification> = this.broadcastingSource$.asObservable();

    broadcast(notification: Notification) {
        this.getNotificationObject(notification).then((result: any) => {
            notification.object = result;
            this.broadcastingSource$.next(notification);

        }).catch((error: Error) => {

            console.log(error)
            this.broadcastingSource$.next(notification);
        });
    }

    getNotificationObject(notification: Notification) {
        let objectType = notification.objectType;
        let objectId = notification.objectId;

        let promise = null;
        switch (objectType) {
            case ObjectType.Appointment:
                let repo: AppointmentRepo = Container.get(dependencies.AppointmentRepo);
                promise = repo.findById(objectId);
                break;
        }
        return new Promise<any>((resolve, reject) => {

            return promise.then((result: any) => {
                resolve(result)
            })
                .catch((error: Error) => reject(error));
        });
    }

}