import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QuoteStatus, CallsQuotesMode } from '../../models/enums';
import { QuoteService, AlertifyService, EnvironmentService, AppointmentService } from '../../services/services.exports';
import { getEnumEntries } from '../../utils/date-helpers';

@Component({
  selector: 'rb-quotes-history',
  templateUrl: './quotes-history.component.html',
  styleUrls: ['./quotes-history.component.scss']
})
export class QuotesHistoryComponent implements OnInit {

  modes = {
    history: 1,
    addQuote: 2,
    msg: 3,
    addCall: 4
  };
  mode = this.modes.history;
  callsQuotesMode: CallsQuotesMode = CallsQuotesMode.quote;
  tabs = [];
  quotes;
  mappedQuotes;
  loading = true;
  @ViewChild('quoteDetails') quoteDetailsTemplate: ElementRef;
  quoteDetailsModalRef: NgbModalRef;
  selectedQuote = null;
  statusEnum = QuoteStatus;
  callSelectedQuote;

  constructor(private quoteService: QuoteService, private alertifyService: AlertifyService, private modalService: NgbModal,
    private environemntService: EnvironmentService, private appointmentService: AppointmentService) { }

  ngOnInit() {
    this.tabs = getEnumEntries(QuoteStatus).filter(t => t.id != QuoteStatus.Open);

    this.quoteService.getQuotesFilteredByStatus([QuoteStatus.Pending, QuoteStatus.Approved, QuoteStatus.Rejected, QuoteStatus.Closed], this.environemntService.currentUser.id)
      .subscribe(results => {
        this.quotes = results;
        this.mappedQuotes = this.mapAndGroupQuotes(results);
        this.loading = false;
      })
  }

  mapAndGroupQuotes(quotes: any[]) {
    let mappedQuotes = {};
    this.tabs.forEach(tab => mappedQuotes[tab.id] = [])

    for (let quote of quotes) {
      let customer = quote.user ? quote.user : quote.customerInfo;
      quote.fullName = customer.firstName + ' ' + (customer.lastName ? customer.lastName : '');
      quote.totalEstimate = quote.status == QuoteStatus.Open ? null : this.sumEstimateFields(quote);
      quote.actions = this.getQuoteActions(quote);
      mappedQuotes[quote.status].push(quote);
    }

    return mappedQuotes;
  }

  sumEstimateFields(quote) {
    let total = 0;
    quote.estimateFields.forEach(f => total += f.cost);

    return total;
  }

  getQuoteActions(quote) {
    let actions = [];
    switch (quote.status) {
      case QuoteStatus.Pending:
        actions.push({ status: QuoteStatus.Approved, label: 'Approve', cssClass: 'btn-success' });
        actions.push({ status: QuoteStatus.Rejected, label: 'Reject', cssClass: 'btn-danger' });
        break;
      case QuoteStatus.Approved:
        actions.push({ status: QuoteStatus.Closed, label: 'Close Quote', cssClass: 'btn-info' });
        break;
    }
    return actions;
  }

  openQuoteDetailsModal(quote) {
    this.selectedQuote = quote;
    this.quoteDetailsModalRef = this.modalService.open(this.quoteDetailsTemplate, { size: 'lg' });
    this.quoteDetailsModalRef.result.then(_ => {

      this.selectedQuote = null;
    }, _ => {
      this.closeQuoteDetailsModal();
    });
  }

  closeQuoteDetailsModal() {
    this.selectedQuote = null;
    this.quoteDetailsModalRef.close();
  }

  updateQuote(quote, nextStatus) {
    quote.status = nextStatus;
    this.quoteService.updateQuote(quote).subscribe(result => {
      if (result) {

        this.mappedQuotes = this.mapAndGroupQuotes(this.quotes);
    
        this.closeQuoteDetailsModal();
        this.alertifyService.success('Quote updated Successfully.')
      }
    })

  }

  setMode = (currentMode, selectedQuote = null) => {
    switch (currentMode) {
      case this.modes.addQuote:
        this.callsQuotesMode = CallsQuotesMode.quote;
        break;
      case this.modes.addCall:
        this.callsQuotesMode = CallsQuotesMode.call;
        this.selectedQuote = selectedQuote;
        break;
    }
    this.mode = currentMode
  };

  quoteSubmitted(quote) {
    this.quoteService.addQuote(quote.obj, quote.images).subscribe(result => {
      if (result.id != null) {
        this.mode = this.modes.msg;
        this.alertifyService.success('Your quote has been submitted');
        setTimeout(() => this.mode = this.modes.history, 2000);
      }
    });
  }

  callSubmitted(call) {
    call.obj.quoteIds = [this.selectedQuote.id];
    call.obj.preferedContactType = this.selectedQuote.preferedContactType;
    call.obj.typeId = this.selectedQuote.typeId;
    call.obj.siteId = this.selectedQuote.siteId;
    this.appointmentService.addAppointment(call.obj, call.images).subscribe(result => {
      if (result.id != null) {
        this.selectedQuote.appointmentId = result.id;
        this.selectedQuote = null;
        this.mode = this.modes.msg;
        this.alertifyService.success('Your call has been submitted');
        setTimeout(() => this.mode = this.modes.history, 2000);
      }
    });
  }


}
