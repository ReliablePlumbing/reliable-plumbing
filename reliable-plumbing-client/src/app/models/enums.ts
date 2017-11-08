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
    completeProfile
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