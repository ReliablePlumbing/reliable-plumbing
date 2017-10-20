export const dependencies = {

    // business
    UserManager: 'business.UserManager',
    mailNotifierManager: 'business.MailNotifier',
    AppointmentManager: 'business.AppointmentManager',
    LookupsManager: 'business.LookupsManager',
    NotificationManager: 'business.NotificationManager',

    // business notifiers
    NotificationBroadcastingService: 'business.notifier.NotificationBroadcastingService',
    SocketsNotifier: 'business.notifier.SocketsNotifier',

    // data
    MongoContext: 'data.MongoContext',
    UserRepo: 'data.UserRepo',
    UserLoginRepo: 'data.UserLoginRepo',
    MailLogRepo: 'data.MailLogRepo',
    AppointmentRepo: 'data.AppointmentRepo',
    AppointmentTypeRepo: 'data.AppointmentTypeRepo',
    NotificationRepo: 'data.NotificationRepo',
}