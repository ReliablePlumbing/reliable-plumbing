import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { LookupsService, AlertifyService, EnvironmentService } from '../../services/services.exports';

// todo: priority ordering edit, display all info
@Component({
  selector: 'rb-appointment-types-management',
  templateUrl: './appointment-types-management.component.html',
  styleUrls: ['./appointment-types-management.component.scss']
})
export class AppointmentTypesManagementComponent implements OnInit {

  types = [];
  addEditTypeModalRef: NgbModalRef;
  addEditType: any = {};

  constructor(private lookupsService: LookupsService, private modalService: NgbModal,
    private alertifyService: AlertifyService, private environmentService: EnvironmentService) { }

  ngOnInit() {
    this.lookupsService.getAllAppointmentTypes().subscribe((results: any[]) => {
      this.types = results.sort((a, b) => {
        if (a.priority == b.priority)
          return 0;
        return a.priority - b.priority;
      })
    })
  }

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
        this.alertifyService.printErrorMessage('unknown error happened, please try again');
        return;
      }
      this.addEditType = {};
      this.addEditTypeModalRef.close();
      this.alertifyService.printSuccessMessage('Appointment Type has been successfully saved');
    })
  }

  deleteType(appointype) {
    this.alertifyService.confirmDialog('Confirm delete', () => {
      appointype.lastModifiedBy = this.environmentService.currentUser.id;
      appointype.isDeleted = true;
      this.lookupsService.addEditAppointmentType(appointype).subscribe(result => {
        if (result == true) {
          this.types = this.types.filter(t => t.id != appointype.id);
          this.alertifyService.printSuccessMessage('Appointment Type has been successfully deleted');
        }
        else
          this.alertifyService.printErrorMessage('unknown error happened, please try again');

      });
    });
  }
}
