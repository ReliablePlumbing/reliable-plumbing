export enum Role {
    Supervisor = 1,
    Technician,
    Customer,
    Admin,
    SystemAdmin
}

export enum RegistrationMode {
    addSystemUser = 1,
    editSystemUser,
    signup,
    addCustomer,
    completeProfile,
    edit,
}

export enum CallsQuotesMode {
    call = 1,
    quote
}

export enum regControls {
    email = 1,
    mobile,
    firstName,
    lastName,
    password,
    roles,
    address,
    accountType
  }

export enum AppointmentStatus {
    Pending = 1,
    Confirmed,
    Rejected,
    Canceled,
    Completed
}

export enum QuoteStatus {
    Open = 1,
    Pending,
    Approved,
    Rejected,
    Closed
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