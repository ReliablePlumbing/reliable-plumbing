import { Component, OnInit } from '@angular/core';
import { CallsQuotesMode } from '../../models/enums';
import { AlertifyService, EnvironmentService, AppointmentService } from '../../services/services.exports';

@Component({
  selector: 'rb-calls-history',
  templateUrl: './calls-history.component.html',
  styleUrls: ['./calls-history.component.scss']
})
export class CallsHistoryComponent implements OnInit {

  callsQuotesMode: CallsQuotesMode = CallsQuotesMode.call;
  modes = {
    history: 1,
    addCall: 2,
    msg: 3,

  }
  mode = this.modes.history;

  constructor(private alertifyService: AlertifyService, private environmentService: EnvironmentService,
    private appointmentService: AppointmentService) { }

  ngOnInit() {
  }

  callSubmitted(call) {

    this.appointmentService.addAppointment(call.obj, call.images).subscribe(result => {
      if (result.id != null) {
        this.mode = this.modes.msg;
        this.alertifyService.success('Your call has been submitted');
      }
    });

  }

  setMode = (currentMode) => this.mode = currentMode;

}


