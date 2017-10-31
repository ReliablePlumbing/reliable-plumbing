import { Pipe, PipeTransform } from '@angular/core';
import { TechnicianStatus } from '../../models/enums';

@Pipe({ name: 'technicianStatusColor' })
export class TechnicianStatusColor implements PipeTransform {

    transform(status: TechnicianStatus) {
        switch (status) {
            case TechnicianStatus.Available:
                return 'green';
            case TechnicianStatus.Busy:
                return 'red';
            case TechnicianStatus.PossibleBusy:
                return 'yellow';
            case TechnicianStatus.HardlyBusy:
                return 'orange';

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