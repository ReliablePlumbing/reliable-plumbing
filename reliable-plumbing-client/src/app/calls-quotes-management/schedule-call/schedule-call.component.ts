import { Component, OnInit } from '@angular/core';
import { AlertifyService, EnvironmentService, AppointmentService } from '../../services/services.exports';
import { CallsQuotesMode } from '../../models/enums';
import { Router } from '@angular/router';

@Component({
  selector: 'rb-schedule-call',
  templateUrl: './schedule-call.component.html',
  styleUrls: ['./schedule-call.component.scss']
})
export class ScheduleCallComponent implements OnInit {

  mode: CallsQuotesMode = CallsQuotesMode.call;
  showMsg = false;
  loading = false;

  constructor(private alertifyService: AlertifyService, private environmentService: EnvironmentService,
    private appointmentService: AppointmentService, private router: Router) { }


  ngOnInit() {

  }

  callSubmitted(call) {
    this.loading = true;
    this.appointmentService.addAppointment(call.obj, call.images).subscribe(result => {
      this.loading = false;
      this.showMsg = true;
      if (result.id != null) {
        this.alertifyService.success('Your call has been submitted');
        setTimeout(() => this.router.navigate(['/']), 3000);
      }
    });

  }


}

