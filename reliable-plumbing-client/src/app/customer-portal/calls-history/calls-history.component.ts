import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CallsQuotesMode, AppointmentStatus } from '../../models/enums';
import { AlertifyService, EnvironmentService, AppointmentService, LookupsService } from '../../services/services.exports';
import { getEnumEntries } from '../../utils/date-helpers';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal/modal';

@Component({
  selector: 'rb-calls-history',
  templateUrl: './calls-history.component.html',
  styleUrls: ['./calls-history.component.scss']
})
export class CallsHistoryComponent implements OnInit {

  quoteDetailsModalRef: NgbModalRef;
  selectedQuote = null;
  callsQuotesMode: CallsQuotesMode = CallsQuotesMode.call;
  modes = {
    history: 1,
    addCall: 2,
    msg: 3,

  }
  mode = this.modes.history;
  pills = [];
  mappedCalls = {};
  calls;
  loading;
  lookups;
  statusEnum = AppointmentStatus;

  constructor(private alertifyService: AlertifyService, private environmentService: EnvironmentService, private modalService: NgbModal,
    private appointmentService: AppointmentService, private lookupsService: LookupsService) { }

  ngOnInit() {
    this.loading = true;
    let loadingArr = [true, true];
    this.pills = getEnumEntries(AppointmentStatus);

    let filters = {
      userIds: [this.environmentService.currentUser.id],
      // status: [AppointmentStatus.Pending, AppointmentStatus.Confirmed]
    };

    this.lookupsService.getAppointmentSettingsAndTypes().subscribe(results => {
      this.lookups = {
        types: this.mapTypes(results.types),
      };
      loadingArr.pop();
      this.loading = loadingArr.length > 0;
    });

    this.appointmentService.getAppointmentsFiltered(filters).subscribe(results => {
      this.calls = results;
      this.mappedCalls = this.mapAndGroupCalls(results);
      loadingArr.pop();
      this.loading = loadingArr.length > 0;
    })

  }

  mapTypes(types) {
    if (types == null)
      return [];

    let mappedTypes = [];
    for (let type of types) {
      mappedTypes.push({
        id: type.id,
        text: type.name
      });
    }

    return mappedTypes;
  }

  mapAndGroupCalls(calls: any[]) {
    let mappedCalls = {};
    this.pills.forEach(pill => {
      if (pill.id == AppointmentStatus.Confirmed)
        mappedCalls[pill.id] = { done: [], upcoming: [], length: 0 };
      else
        mappedCalls[pill.id] = []
    })

    for (let call of calls) {
      let customer = call.user ? call.user : call.customerInfo;
      call.fullName = customer.firstName + ' ' + (customer.lastName ? customer.lastName : '');
      let typeIndex = this.lookups.types.findIndex(t => t.id == call.typeId)
      if (typeIndex != -1)
        call.typeObj = this.lookups.types[typeIndex];
      call.quoteTotalEstimate = this.calculateTotalQuoteEstimate(call);

      if (call.status == AppointmentStatus.Confirmed) {
        mappedCalls[call.status].length++;
        if (new Date(call.date) < new Date())
          mappedCalls[call.status].done.push(call);
        else
          mappedCalls[call.status].upcoming.push(call);
      }
      else
        mappedCalls[call.status].push(call);
    }

    return mappedCalls;
  }

  calculateTotalQuoteEstimate(appointment) {
    if (!appointment.quote)
      return null;

    let totalEstimate = 0;
    appointment.quote.estimateFields.forEach(f => totalEstimate += parseFloat(f.cost));

    return totalEstimate;
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

  openQuoteDetails(quote, template) {
    this.selectedQuote = quote;
    this.quoteDetailsModalRef = this.modalService.open(template, { size: 'lg' });
    this.quoteDetailsModalRef.result.then(_ => this.selectedQuote = null, _ => this.selectedQuote = null);
  }

  closeQuoteDetailsModal = () => this.quoteDetailsModalRef.close();

  changeCallStatus(call, newStatus) {
    if (newStatus == AppointmentStatus.Completed && !call.rate) {
      this.alertifyService.alert('please, rate your experience with this appointment, thanks');
    }
    else if (newStatus == AppointmentStatus.Completed) {
      this.updateCall(call, newStatus);
    }
    else if (newStatus == AppointmentStatus.Canceled) {
      this.alertifyService.confirmDialog('Are you sure you want to cancel this call', () => {
        this.updateCall(call, newStatus);
      });
    }
  }

  updateCall(call, newStatus) {
    this.loading = true;
    call.status = newStatus;
    call.statusHistory.push({
      status: newStatus,
      createdByUserId: this.environmentService.currentUser.id
    })
    this.appointmentService.updateAppointmentStatusAndAssignees(call).subscribe(result => {
      if (result) {
        this.loading = false;
        this.mappedCalls = this.mapAndGroupCalls(this.calls);
        this.alertifyService.success('Call has completed successfully');
      }
    });
  }
}


