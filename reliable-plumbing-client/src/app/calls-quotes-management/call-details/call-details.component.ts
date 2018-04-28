import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { getCustomerFullName } from '../../utils/call-helpers';
import { AppointmentStatus, Role } from '../../models/enums';
import { buildImagesObjectsForLightBox } from '../../utils/files-helpers';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { QuoteService, AlertifyService, AppointmentService, EnvironmentService } from '../../services/services.exports';
import { isAnyEligible } from '../../utils/user-helpers';
import { OverlayPanel } from 'primeng/primeng';
import { convertTimeTo12String } from '../../utils/date-helpers';
import * as moment from 'moment';

@Component({
  selector: 'call-details',
  templateUrl: './call-details.component.html',
  styleUrls: ['./call-details.component.scss']
})
export class CallDetailsComponent implements OnInit, OnChanges {

  @Input() call;
  mappedCall;
  isReadOnly;
  technicians;
  mappedTechnicians;
  selectedtech;
  loading = true;
  overlayLoading = false;
  quickAddModalRef: NgbModalRef

  constructor(private modalService: NgbModal, private quoteService: QuoteService, private alertifyService: AlertifyService,
    private callService: AppointmentService, private environmentService: EnvironmentService) { }

  ngOnInit() {
    this.isReadOnly = !isAnyEligible(this.environmentService.currentUser, [Role.Admin, Role.Supervisor, Role.SystemAdmin]);
  }

  ngOnChanges() {
    if (this.call) {
      this.loading = true;
      this.mappedCall = this.mapCall(this.call);
      this.getTechsStatuses();
    }
  }

  //#region API Services Calls

  getTechsStatuses() {
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
      assignees: !this.isReadOnly ? [] : this.mapTechnicians(call.assignees),
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
      let techObj = this.isReadOnly ? tech : tech.technician;
      techObj.name = techObj.firstName + ' ' + (techObj.lastName ? techObj.lastName : '')
      return {
        technician: techObj,
        status: this.isReadOnly ? null : tech.status,
        calls: this.isReadOnly ? null : tech.appointments.map(call => this.mapTechCall(call)),
      }
    });

    if (!this.isReadOnly) {
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
}
