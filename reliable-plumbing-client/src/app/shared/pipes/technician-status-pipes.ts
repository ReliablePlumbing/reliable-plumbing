import { Pipe, PipeTransform } from '@angular/core';
import { TechnicianStatus } from '../../models/enums';

@Pipe({ name: 'technicianStatusColor' })
export class TechnicianStatusColor implements PipeTransform {

    transform(status: TechnicianStatus) {
        switch (status) {
            case TechnicianStatus.Available:
                return 'greenBg';
            case TechnicianStatus.Busy:
                return 'redBg';
            case TechnicianStatus.PossibleBusy:
                return 'yellowBg';
            case TechnicianStatus.HardlyBusy:
                return 'orangeBg';

            default:
                break;
        }
    }
}

@Pipe({ name: 'technicianStatusTxt' })
export class TechnicianStatusTxt implements PipeTransform {

    transform(status: TechnicianStatus) {
        switch (status) {
            case TechnicianStatus.Available:
                return 'Available';
            case TechnicianStatus.Busy:
                return 'Busy';
            case TechnicianStatus.PossibleBusy:
                return 'Possible Busy';
            case TechnicianStatus.HardlyBusy:
                return 'Hardly Busy';

            default:
                break;
        }
    }
}