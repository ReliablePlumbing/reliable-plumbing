import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { LookupsService, AlertifyService, EnvironmentService } from '../../services/services.exports';

// todo: priority ordering edit, display all info
@Component({
  selector: 'rb-appointment-settings',
  templateUrl: './appointment-settings.component.html',
  styleUrls: ['./appointment-settings.component.scss']
})
export class AppointmentSettingsomponent implements OnInit {

  loaders = [];
  types = [];
  addEditTypeModalRef: NgbModalRef;
  addEditType: any = {};
  settings: any = {
    workDays: [1, 2, 3, 4, 5],
    workHours: { from: { hour: 0, minute: 0 }, to: { hour: 0, minute: 0 } },
    timeSpan: 30
  }
  days = [
    { id: 1, day: 'Monday', checked: false }, { id: 2, day: 'Tuesday', checked: false }, { id: 3, day: 'Wednesday', checked: false },
    { id: 4, day: 'Thursday', checked: false }, { id: 5, day: 'Friday', checked: false }, { id: 6, day: 'Saturday', checked: false }, { id: 7, day: 'Sunday', checked: false }
  ];

  constructor(private lookupsService: LookupsService, private modalService: NgbModal,
    private alertifyService: AlertifyService, private environmentService: EnvironmentService) { }

  timeto: FormControl;
  timeFrom: FormControl;
  ngOnInit() {
    this.timeto = this.timeFrom = new FormControl('', (control: FormControl) => {
      let from = this.settings.workHours.from;
      let to = this.settings.workHours.to;

      if (to.hour < from.hour)
        return { afterFrom: true };
      else if (from.hour == to.hour) {
        if (to.minute < from.minute)
          return { afterFrom: true };
      }

      return null;
    });
    this.loaders.push(true);
    this.lookupsService.getAllAppointmentTypes().subscribe((results: any[]) => {
      this.types = results.sort((a, b) => {
        if (a.priority == b.priority)
          return 0;
        return a.priority - b.priority;
      });
      this.loaders.pop();
    });

    this.loaders.push(true);
    this.lookupsService.getAppointmentSettings().subscribe(settings => {
      if (settings != null)
        this.settings = settings;
      this.mapSettings(this.settings);
      this.loaders.pop();
    })
  }

  // region settings

  mapSettings(settings) {
    for (let day of settings.workDays)
      this.days[day - 1].checked = true;
  }

  saveAppointmentSettings() {
    let workDays = [];
    for (let day of this.days)
      if (day.checked) workDays.push(day.id);
    this.settings.workDays = workDays;
    this.settings.lastModifiedBy = this.environmentService.currentUser.id;
    this.lookupsService.saveAppointmentSettings(this.settings).subscribe(result => {
      this.settings = result;
      this.mapSettings(this.settings);
      this.alertifyService.success('Settings saved successfully');
    })
  }

  toggleCheck(day) {
    day.checked = !day.checked
  }
  // endregion settings

  // region appointment types
  openAddEditTypePopup(template, type = null) {
    let isNew = type == null;
    if (!isNew)
      this.addEditType = Object.assign({}, type);
    this.addEditTypeModalRef = this.modalService.open(template, { size: 'sm' })
  }

  saveAppointmentType() {
    let isNew = this.addEditType.id == null;
    let currentUserId = this.environmentService.currentUser.id;
    if (isNew)
      this.addEditType.createdBy = currentUserId;
    else
      this.addEditType.lastModifiedBy = currentUserId;

    this.lookupsService.addEditAppointmentType(this.addEditType).subscribe(result => {
      if (isNew && result != null && result.id != null)
        this.types.push(result);
      else if (result == true) {
        let index = this.types.findIndex(t => t.id == this.addEditType.id);
        this.types[index] = this.addEditType;
      }
      else {
        this.alertifyService.error('unknown error happened, please try again');
        return;
      }
      this.addEditType = {};
      this.addEditTypeModalRef.close();
      this.alertifyService.success('Appointment Type has been successfully saved');
    })
  }

  deleteType(appointype) {
    this.alertifyService.confirmDialog('Confirm delete', () => {
      appointype.lastModifiedBy = this.environmentService.currentUser.id;
      appointype.isDeleted = true;
      this.lookupsService.addEditAppointmentType(appointype).subscribe(result => {
        if (result == true) {
          this.types = this.types.filter(t => t.id != appointype.id);
          this.alertifyService.success('Appointment Type has been successfully deleted');
        }
        else
          this.alertifyService.error('unknown error happened, please try again');
      });
    });
  }
  // endregion appointment types
}
