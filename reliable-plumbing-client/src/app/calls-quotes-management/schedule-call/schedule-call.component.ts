import { Component, OnInit } from '@angular/core';
import { AlertifyService, EnvironmentService, AppointmentService } from '../../services/services.exports';
import { CallsQuotesMode } from '../../models/enums';

@Component({
  selector: 'rb-schedule-call',
  templateUrl: './schedule-call.component.html',
  styleUrls: ['./schedule-call.component.scss']
})
export class ScheduleCallComponent implements OnInit {

  mode: CallsQuotesMode = CallsQuotesMode.call;

  constructor(private alertifyService: AlertifyService, private environmentService: EnvironmentService,
    private appointmentService: AppointmentService) { }


  ngOnInit() {

  }

  callSubmitted(call) {

    this.appointmentService.addAppointment(call.obj, call.images).subscribe(result => {
      if (result.id != null) {
        this.alertifyService.success('Your call has been submitted');
      }
    });

  }


}

