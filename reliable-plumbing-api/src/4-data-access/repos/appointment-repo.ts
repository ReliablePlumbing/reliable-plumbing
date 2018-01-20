import { Repo } from './repo';
import { appointmentSchema } from '../schemas/appointment-schema';
import { Appointment, AppointmentStatus, User, StatusHistory, AppointmentType, Quote } from '../../3-domain/domain-module';
import { GenericModel } from '../models/model';


export class AppointmentRepo extends Repo<Appointment> {

    constructor() {
        super(appointmentSchema)
    }

    getAppointmentsFilteredByDatesAndStatusAndType(from?: Date, to?: Date, status?: AppointmentStatus[], typeids?: string[], userIds?: string[]) {
        let model = this.createSet();

        let filterObj: any = {};

        if (from != null)
            filterObj.date = { $gt: from };
        if (to != null)
            filterObj.date.$lt = to;
        if (status != null && status.length > 0)
            filterObj.status = { $in: status };
        if (typeids != null && typeids.length > 0)
            filterObj.typeId = { $in: typeids };
        if (userIds && userIds.length > 0)
            filterObj.userId = { $in: userIds };

        return new Promise<Appointment[]>((resolve, reject) => {

            model.find(filterObj).populate('userId').populate('quoteId').exec((err, results) => {
                if (err != null)
                    return reject(err);

                return resolve(this.mapModelToEntities(results));
            });
        });
    }

    findById(id) {
        let model = this.createSet();
        return new Promise<Appointment>((resolve, reject) => {
            model.findById(id, (err, result) => {
                if (err != null)
                    return reject(err);

                return resolve(this.mapModelToEntity(result));
            });
        });
    }

    updateAppointment(appointment) {
        let model = this.createSet();
        return new Promise<Appointment>((resolve, reject) => {
            model.findOneAndUpdate({ _id: appointment.id }, appointment, { new: true }, (err, result) => {
                if (err)
                    return reject(err);
                return resolve(this.mapModelToEntity(result));
            });
        });
    }

    getAppointmentsFilteredByAssigneesAndDates(assigneeIds: string[], from?: Date, to?: Date) {

        let model = this.createSet();

        let filterObj: any = {
            assigneeIds: { $in: assigneeIds }
        }
        if (from != null) {
            if (filterObj.date == null)
                filterObj.date = {};
            filterObj.date.$gt = from;
        }

        if (to != null) {
            if (filterObj.date == null)
                filterObj.date = {};
            filterObj.date.$lt = to;
        }

        return new Promise<Appointment[]>((resolve, reject) => {

            model.find(filterObj).populate('userId').populate('typeId').exec((err, results) => {
                if (err != null)
                    return reject(err);

                return resolve(this.mapModelToEntities(results));
            });
        });
    }

    private mapModelToEntity(appointmentModel: GenericModel<Appointment>) {
        let obj: any = appointmentModel.toObject({ transform: Object });
        let appointment = new Appointment(obj);
        if (obj.userId != null && typeof obj.userId == 'object') {
            appointment.user = new User(obj.userId);
            appointment.userId = appointment.user.id;
        }
        else
            appointment.userId = obj.userId;

        if (obj.typeId != null && typeof obj.typeId == 'object') {
            appointment.type = new AppointmentType(obj.typeId);
            appointment.typeId = appointment.type.id;
        }
        else
            appointment.typeId = obj.typeId;

        if (obj.quoteId != null && typeof obj.quoteId == 'object') {
            appointment.quote = new Quote(obj.quoteId);
            appointment.quoteId = appointment.quote.id;
        }
        else
            appointment.quoteId = obj.quoteId;

        appointment.statusHistory = this.mapStatusHistory(obj.statusHistory)

        return appointment;
    }

    private mapStatusHistory(statusHistory: any[]) {
        if (statusHistory == null || statusHistory.length == 0)
            return [];
        return statusHistory.map(s => {
            let status = new StatusHistory(s);
            if (s.createdByUserId != null && typeof s.createdByUserId == 'object') {
                status.createdBy = new User(s.createdByUserId);
                status.createdByUserId = status.createdBy.id;
            }
            else
                status.createdByUserId = s.createdByUserId;

            return status;
        })
    }

    private mapModelToEntities(appointmentModels: GenericModel<Appointment>[]) {
        let appointments = [];
        for (let appointmentModel of appointmentModels)
            appointments.push(this.mapModelToEntity(appointmentModel));

        return appointments;
    }

}