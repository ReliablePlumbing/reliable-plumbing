import { Observable, Subject } from '@reactivex/rxjs';
import { Service } from 'typedi';
import { Notification } from '../../3-domain/domain-module';

@Service()
export class NotificationBroadcastingService {


    private broadcastingSource$: Subject<Notification> = new Subject<Notification>();

    notificationBroadcasted: Observable<Notification> = this.broadcastingSource$.asObservable();

    broadcast(notification: Notification) {

        this.broadcastingSource$.next(notification);
    }

}