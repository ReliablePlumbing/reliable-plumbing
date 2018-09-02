import config from '../../config';
import { Role, Appointment } from '../../3-domain/domain-module';
import * as moment from 'moment';

export function buildCallPortalUrl(roles: Role[], call: Appointment) {

    let url = '';
    roles.forEach(role => {
        switch (role) {
            case Role.Admin:
            case Role.SystemAdmin:
            case Role.Supervisor:
            case Role.Technician:
                let params = config.portalLinks.scheduleManagement.params;
                let fromDate = params.fromDate + '=' + moment(call.date).format(config.portalLinks.dateParamFormat);
                let callId = params.callId + '=' + call.id;
                let delimiter = config.portalLinks.paramsDelimiter;
                url = config.portalLinks.scheduleManagement.url + delimiter + fromDate + delimiter + callId;
                break;
            case Role.Customer:
                url = config.portalLinks.callsHistory;
                break;
        }
    });

    return url;
}