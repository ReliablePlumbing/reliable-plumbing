export var queryParams = {
    fromDate: 'from',
    toDate: 'to',
    urlDateFormat: 'MM-DD-YYYY',
    callId: 'id'
}


export var localStrg = {

}

export var sessionStrg = {
    socialMediaLoginProvider: 'socialMediaLoginProvider'
}

export const systemRoutes = {
    home: '/',
    // control panel
    controlPanel: 'control-panel',
    scheduleManagement: 'schedule-management',
    quoteManagement: 'quote-management',
    settings: 'appointment-settings',
    systemUsers: 'system-users-management',
    users: 'users-management',
    myAppointments: 'my-appointments',
    tracking: 'technicians-tracking',
    dashboard: 'dashboard',

    activateMail: 'activate-mail',
    socialMediaAuthenticate: 'social-media-authenticate',
    forgotPassword: 'forgot-password',
    register: 'register',
    editProfile: 'edit-profile',
    scheduleCall: 'schedule-call',
    requestQuote: 'request-quote',

    // customer portal
    customerPortal: 'customer-portal',
    callsHistory: 'calls-history',
    quotesHistory: 'quotes-history',

    // shared in customer & control panels
    myProfile: 'my-profile',
    changePassword: 'change-password'
}