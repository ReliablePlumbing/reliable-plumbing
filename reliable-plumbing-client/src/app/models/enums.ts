export enum Role {
    Supervisor = 1,
    Technician,
    Customer,
    Admin, 
    SystemAdmin
}

export enum RegistrationMode {
    signup,
    admin,
    completeProfile,
    edit
}

export enum AppointmentStatus {
    Pending = 1,
    Confirmed,
    NotAvailable,
    Rescheduled,
    Canceled,
    Rejected
}

export enum TechnicianStatus {
    Available = 1,
    Busy,
    PossibleBusy,
    HardlyBusy
}

export enum SocialMediaProvider {
    Facebook = 1,
    Google
}

export enum NotificationType {
    ActivateMail = 1,
    AppointmentCreated,
    AppointmentChanged,
    AppointmentCheckedIn,
    MailActivated,
    AssigneeAdded,
    AssigneeRemoved,

}