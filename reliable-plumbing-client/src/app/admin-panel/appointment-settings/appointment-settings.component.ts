import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { LookupsService, AlertifyService, EnvironmentService } from '../../services/services.exports';
import { convertTimeTo24, convertTimeTo12 } from '../../utils/date-helpers';

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
    workHours: { from: { h: 12, min: 0, amPm: 1 }, to: { h: 12, min: 0, amPm: 1 } },
    timeSpan: 30
  }
  days = [
    { id: 1, day: 'Monday', checked: false }, { id: 2, day: 'Tuesday', checked: false }, { id: 3, day: 'Wednesday', checked: false },
    { id: 4, day: 'Thursday', checked: false }, { id: 5, day: 'Friday', checked: false }, { id: 6, day: 'Saturday', checked: false }, { id: 7, day: 'Sunday', checked: false }
  ];

  constructor(private lookupsService: LookupsService, private modalService: NgbModal,
    private alertifyService: AlertifyService, private environmentService: EnvironmentService) { }

  ngOnInit() {
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
    let from = this.settings.workHours.from,
      to = this.settings.workHours.to;
    this.settings.workHours.from = convertTimeTo12(from.h, from.min);
    this.settings.workHours.to = convertTimeTo12(to.h, to.min);
  }

  saveAppointmentSettings() {
    let workDays = [];
    for (let day of this.days)
      if (day.checked) workDays.push(day.id);
    this.settings.workDays = workDays;
    let from = this.settings.workHours.from,
      to = this.settings.workHours.to;
    this.settings.workHours.from = convertTimeTo24(from.h, from.min, from.amPm);
    this.settings.workHours.to = convertTimeTo24(to.h, to.min, to.amPm);
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
