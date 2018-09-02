import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { getCustomerFullName, isCallOpened } from '../../utils/call-helpers';
import { AppointmentStatus, Role, Permission, ObjectType } from '../../models/enums';
import { buildImagesObjectsForLightBox } from '../../utils/files-helpers';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { QuoteService, AlertifyService, AppointmentService, EnvironmentService, EventsService } from '../../services/services.exports';
import { isAnyEligible } from '../../utils/user-helpers';
import { OverlayPanel } from 'primeng/primeng';
import { convertTimeTo12String } from '../../utils/date-helpers';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'call-details',
  templateUrl: './call-details.component.html',
  styleUrls: ['./call-details.component.scss']
})
export class CallDetailsComponent implements OnInit, OnChanges {

  @Input() call;
  objectType = ObjectType.Appointment;
  mappedCall;
  technicians;
  mappedTechnicians;
  selectedtech;
  loading = true;
  overlayLoading = false;
  quickAddModalRef: NgbModalRef;
  permissions: {
    attachQuote: boolean,
    updateAssignees: boolean,
    collaborate: boolean,
    checkIn: boolean,
  };
  mapMarker: any = { lat: 36.778259, lng: -119.417931 }; // california coordinates
  supscription: Subscription;

  constructor(private modalService: NgbModal, private quoteService: QuoteService, private alertifyService: AlertifyService,
    private callService: AppointmentService, private environmentService: EnvironmentService, private eventsService: EventsService) { }

  ngOnInit() {
    this.supscription = this.eventsService.callUpdated.subscribe(call => this.callChanged());
  }

  initPermissions() {
    let isCallOpen = isCallOpened(this.call)
    this.permissions = {
      attachQuote: this.environmentService.hasPermission(Permission.AttachQuote) && isCallOpen,
      updateAssignees: this.environmentService.hasPermission(Permission.UpdateAssignees) && isCallOpen,
      collaborate: this.environmentService.hasPermission(Permission.Collaborate),
      checkIn: this.environmentService.hasPermission(Permission.CheckIn) && isCallOpen
    }
  }

  ngOnChanges() {
    this.callChanged();
  }

  callChanged() {
    if (this.call) {
      this.initPermissions();
      this.loading = true;
      this.mappedCall = this.mapCall(this.call);
      this.getTechsStatuses();
      if (this.permissions.checkIn) {
        navigator.geolocation.getCurrentPosition(position => {
          this.mapMarker = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            draggable: true,
            label: null
          }
        });
      }
    }
  }

  //#region API Services Calls

  getTechsStatuses() {
    if (!this.permissions.updateAssignees)
      return;

    return new Promise<boolean>((resolve, reject) => {
      this.callService.getTechniciansWithStatusInTime(this.call.id).subscribe(results => {
        this.technicians = results;
        this.mappedTechnicians = this.mapTechnicians(results);
        this.loading = false;
        resolve(true);
      });
    });
  }

  updateCall() {
    // map assignees
    this.call.assigneeIds = this.mappedCall.assignees.map(assignee => assignee.technician.id);

    return new Promise<boolean>((resolve, reject) => {
      // call service
      this.callService.updateAppointmentStatusAndAssignees(this.call).subscribe(x => resolve(x != null));
    });
  }
  //#endregion

  //#region Mapping Methods
  private mapCall(call) {
    let user = call.user ? call.user : call.customerInfo;
    return {
      customerName: getCustomerFullName(call),
      date: call.date,
      address: this.getAddress(call),
      email: user.email,
      mobile: user.mobile,
      status: { id: call.status, text: AppointmentStatus[call.status] },
      images: buildImagesObjectsForLightBox(call.id, call.relatedFileNames),
      rate: call.rate,
      // assignees: !this.permissions.updateAssignees ? [] : this.mapTechnicians(call.assignees),
      message: call.message,
      quotes: !call.quotes ? null : call.quotes.map(q => this.mapCallQuote(q))
    }
  }

  mapCallQuote(quote) {
    quote.total = quote.estimateFields.length > 0 ? 0 : '-';
    quote.estimateFields.forEach(f => quote.total += parseFloat(f.cost));

    return quote;
  }

  private mapTechnicians(technicians) {
    let mappedTechs;

    mappedTechs = technicians.map(tech => {
      let techObj = !this.permissions.updateAssignees ? tech : tech.technician;
      techObj.name = techObj.firstName + ' ' + (techObj.lastName ? techObj.lastName : '')
      return {
        technician: techObj,
        status: !this.permissions.updateAssignees ? null : tech.status,
        calls: !this.permissions.updateAssignees ? null : tech.appointments.map(call => this.mapTechCall(call)),
      }
    });
    this.mappedCall.assignees = [];
    if (this.permissions.updateAssignees) {
      for (let tech of mappedTechs) {
        for (let assigneeId of this.call.assigneeIds)
          if (assigneeId == tech.technician.id) {
            this.mappedCall.assignees.push(tech);
            tech.selected = true;
          }
      }
      mappedTechs = mappedTechs.filter(tech => !tech.selected)
    }
    return mappedTechs;
  }

  private mapTechCall(call) {
    let callDate = moment(call.date);
    return {
      date: call.date,
      time: convertTimeTo12String(callDate.hour(), callDate.minutes()),
      // status: { id: call.status, text: AppointmentStatus[call.status] },
    }
  }

  private getAddress(call) {
    let address = call.user ? call.user.sites.find(x => x.id == call.siteId) : call.customerInfo;

    return address.street + ' - ' + address.city + ' - ' + address.state;
  }
  //#endregion

  //#region Call Assignees Action Methods
  assign(tech) {
    this.overlayLoading = true;
    if (this.mappedCall.assignees == null)
      this.mappedCall.assignees = [];

    this.mappedTechnicians = this.mappedTechnicians.filter(x => x.technician.id != tech.technician.id);
    this.mappedCall.assignees.push(tech);
    this.updateCall().then(success => {
      if (success) {
        this.alertifyService.success('Technician Assigned Successfully');
        this.overlayLoading = false;
      }
    });
  }

  removeAssignee(assignee) {
    this.alertifyService.confirmDialog('Are You Sure Removing <b>' + assignee.technician.name + '</b>', () => {
      this.overlayLoading = true;
      this.mappedCall.assignees = this.mappedCall.assignees.filter(assign => assign.technician.id != assignee.technician.id);
      this.mappedTechnicians.splice(0, 0, assignee);
      this.updateCall().then(success => {
        this.getTechsStatuses().then(success => {
          this.alertifyService.success('Technician Assigned Successfully');
          this.overlayLoading = false;
        });
      });
    });
  }

  openTechCallsDetails(tech, techOverLayPanel: OverlayPanel, event) {
    this.selectedtech = tech;
    techOverLayPanel.toggle(event);
  }
  //#endregion

  //#region Map & check-in
  checkInMapModalRef;
  openCheckInMap(appointment, template) {
    this.checkInMapModalRef = this.modalService.open(template, { size: 'lg' });
    this.checkInMapModalRef.result.then(_ => { }, _ => {
      this.checkInMapModalRef.close();
    });
  }

  markerDragEnd(m, $event) {
    this.mapMarker.lat = $event.coords.lat;
    this.mapMarker.lng = $event.coords.lng;
  }

  checkIn() {
    let checkInDetails = {
      appointmentId: this.call.id,
      lat: this.mapMarker.lat,
      lng: this.mapMarker.lng,
      userId: this.environmentService.currentUser.id
    }
    this.callService.technicianCheckIn(checkInDetails).subscribe(success => {
      if (success) {
        this.checkInMapModalRef.close();
        this.alertifyService.success('check in completed successfully');
      }
      else
        this.alertifyService.error('unsuccessful check in, please try again');

    });
  }

  //#endregion

  //#region Quick Quote Modal & Methods
  openQuoteQuickAdd(template) {
    this.quickAddModalRef = this.modalService.open(template);
  }

  closeQuoteQuickAdd = () => this.quickAddModalRef.close();

  quickAddQuoteSubmitted(quote) {
    let attachedQuote = quote.obj;
    attachedQuote.appointmentId = this.call.id;
    attachedQuote.siteId = this.call.siteId;
    attachedQuote.preferedContactType = this.call.preferedContactType;
    if (this.call.userId)
      attachedQuote.userId = this.call.userId;
    else
      attachedQuote.customerInfo = this.call.customerInfo;

    this.quoteService.addQuote(attachedQuote, quote.images).subscribe(result => {
      if (result.id != null) {
        if (!this.call.quotes)
          this.call.quotes = [result];
        else
          this.call.quotes.push(result);
        this.mappedCall = this.mapCall(this.call);
        this.alertifyService.success('Your call has been submitted');
        this.quickAddModalRef.close();
      }
    });
  }
  //#endregion

  ngOnDestroy() {
    this.supscription.unsubscribe();
  }
}
