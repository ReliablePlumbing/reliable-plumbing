export const dependencies = {

    // business
    UserManager: 'business.UserManager',
    AppointmentManager: 'business.AppointmentManager',
    QuoteManager: 'business.QuoteManager',
    LookupsManager: 'business.LookupsManager',
    NotificationManager: 'business.NotificationManager',
    FilesManager: 'business.FilesManager',
    DashboardManager: 'business.DashboardManager',
    
    // business notifiers
    NotificationBroadcastingService: 'business.notifier.NotificationBroadcastingService',
    SocketsNotifier: 'business.notifier.SocketsNotifier',
    mailNotifier: 'business.MailNotifier',
    outlookNotifier: 'business.OutlookNotifier',

    // data
    MongoContext: 'data.MongoContext',
    UserRepo: 'data.UserRepo',
    UserLoginRepo: 'data.UserLoginRepo',
    MailLogRepo: 'data.MailLogRepo',
    AppointmentRepo: 'data.AppointmentRepo',
    QuoteRepo: 'data.QuoteRepo',
    AppointmentTypeRepo: 'data.AppointmentTypeRepo',
    NotificationRepo: 'data.NotificationRepo',
    SettingsRepo: 'data.SettingsRepo',
}