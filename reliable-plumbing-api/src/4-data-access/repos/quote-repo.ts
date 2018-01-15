import { Repo } from './repo';
import { quoteSchema } from '../schemas/quote-schema';
import { Quote, AppointmentStatus, User, AppointmentType, QuoteStatus } from '../../3-domain/domain-module';
import { GenericModel } from '../models/model';
import { StatusHistory } from '../../3-domain/domain-module';


export class QuoteRepo extends Repo<Quote> {

    constructor() {
        super(quoteSchema);
    }

    getQuotesFilteredByStatus(statuses: QuoteStatus[]) {
        let model = this.createSet();

        return new Promise<Quote[]>((resolve, reject) => {

            model.find({ status: { $in: statuses } }).populate('userId').populate('typeId').exec((err, results) => {
                if (err != null)
                    return reject(err);

                return resolve(this.mapModelToEntities(results));
            });

        });
    }

    updateQuote(quote) {
        let model = this.createSet();
        return new Promise<Quote>((resolve, reject) => {
            model.findOneAndUpdate({ _id: quote.id }, quote, { new: true }, (err, result) => {
                if (err)
                    return reject(err);
                return resolve(this.mapModelToEntity(result));
            });
        });
    }

    // getAppointmentsFilteredByDatesAndStatusAndType(from: Date, to: Date, status: AppointmentStatus[], typeids: string[]) {
    //     let model = this.createSet();

    //     let filterObj: any = {
    //         date: { $gt: from },
    //     };
    //     if (to != null)
    //         filterObj.date.$lt = to;
    //     if (status != null && status.length > 0)
    //         filterObj.status = { $in: status };
    //     if (typeids != null && typeids.length > 0)
    //         filterObj.typeId = { $in: typeids };

    //     return new Promise<Quote[]>((resolve, reject) => {

    //         model.find(filterObj).populate('userId').exec((err, results) => {
    //             if (err != null)
    //                 return reject(err);

    //             return resolve(this.mapModelToEntities(results));
    //         });
    //     });
    // }

    findById(id) {
        let model = this.createSet();
        return new Promise<Quote>((resolve, reject) => {
            model.findById(id, (err, result) => {
                if (err != null)
                    return reject(err);

                return resolve(this.mapModelToEntity(result));
            });
        });
    }

    // updateAppointment(quote) {
    //     let model = this.createSet();
    //     return new Promise<Appointment>((resolve, reject) => {
    //         model.findOneAndUpdate({ _id: quote.id }, quote, { new: true }, (err, result) => {
    //             if (err)
    //                 return reject(err);
    //             return resolve(this.mapModelToEntity(result));
    //         });
    //     });
    // }

    // getAppointmentsFilteredByAssigneesAndDates(assigneeIds: string[], from?: Date, to?: Date) {

    //     let model = this.createSet();

    //     let filterObj: any = {
    //         assigneeIds: { $in: assigneeIds }
    //     }
    //     if (from != null) {
    //         if (filterObj.date == null)
    //             filterObj.date = {};
    //         filterObj.date.$gt = from;
    //     }

    //     if (to != null) {
    //         if (filterObj.date == null)
    //             filterObj.date = {};
    //         filterObj.date.$lt = to;
    //     }

    //     return new Promise<Appointment[]>((resolve, reject) => {

    //         model.find(filterObj).populate('userId').populate('typeId').exec((err, results) => {
    //             if (err != null)
    //                 return reject(err);

    //             return resolve(this.mapModelToEntities(results));
    //         });
    //     });
    // }

    private mapModelToEntity(quoteModel: GenericModel<Quote>) {
        let obj: any = quoteModel.toObject({ transform: Object });
        let quote = new Quote(obj);
        if (obj.userId != null && typeof obj.userId == 'object') {
            quote.user = new User(obj.userId);
            quote.userId = quote.user.id;
        }
        else
            quote.userId = obj.userId;

        if (obj.typeId != null && typeof obj.typeId == 'object') {
            quote.type = new AppointmentType(obj.typeId);
            quote.typeId = quote.type.id;
        }
        else
            quote.typeId = obj.typeId;

        quote.statusHistory = this.mapStatusHistory(obj.statusHistory);

        return quote;
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

    private mapModelToEntities(appointmentModels: GenericModel<Quote>[]) {
        let quotes = [];
        for (let quoteModel of appointmentModels)
            quotes.push(this.mapModelToEntity(quoteModel));

        return quotes;
    }

}