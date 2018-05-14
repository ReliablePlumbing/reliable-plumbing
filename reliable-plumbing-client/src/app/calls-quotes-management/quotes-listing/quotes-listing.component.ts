import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { getEnumEntries } from '../../utils/date-helpers';
import { QuoteStatus } from '../../models/enums';
import { QuoteService, AlertifyService } from '../../services/services.exports';

@Component({
  selector: 'quotes-listing',
  templateUrl: './quotes-listing.component.html',
  styleUrls: ['./quotes-listing.component.scss']
})
export class QuotesListingComponent implements OnInit {

  @Input() quotes = [];
  @Output() quoteSelected: EventEmitter<any> = new EventEmitter<any>();
  mappedQuotes;
  statusTabs = [];
  selectedQuote;
  permissions;
  activeTabId;

  constructor(private quoteService: QuoteService, private alertifyService: AlertifyService) { }

  ngOnInit() {
    this.initPermissions();
    this.statusTabs = this.getStatusIcons(this.statusTabs.concat(getEnumEntries(QuoteStatus)));
    this.mapAndGroupQuotes(this.quotes);
  }

  initPermissions() {
    // this.permissions = {
    //   confirmCall: this.environmentService.hasPermission(Permission.ConfirmCall),
    //   rejectCall: this.environmentService.hasPermission(Permission.RejectCall),
    //   completeCall: this.environmentService.hasPermission(Permission.CompleteCall),
    //   cancelCall: this.environmentService.hasPermission(Permission.CancelCall),
    // }
  }

  mapAndGroupQuotes(quotes: any[], setSelectedTab = true) {
    this.mappedQuotes = {};
    this.statusTabs.forEach(tab => this.mappedQuotes[tab.id] = [])

    for (let quote of quotes) {
      let customer = quote.user ? quote.user : quote.customerInfo;
      quote.fullName = customer.firstName + ' ' + (customer.lastName ? customer.lastName : '');
      quote.totalEstimate = quote.status == QuoteStatus.Open ? null : this.sumEstimateFields(quote);
      quote.actions = this.getQuoteActions(quote);
      this.mappedQuotes[quote.status].push(quote);
    }
    if (setSelectedTab) {
      for (let tabId in this.mappedQuotes) {
        if (this.mappedQuotes[tabId].length > 0) {
          this.activeTabId = tabId.toString();
          this.selectedQuote = this.mappedQuotes[tabId][0];
          this.quoteSelected.emit(this.selectedQuote);
          break;
        }
      }
    }
    else {
      if (this.mappedQuotes[this.activeTabId].findIndex(q => q.id == this.selectedQuote.id) == -1){
        this.selectedQuote = this.mappedQuotes[this.activeTabId].length > 0 ? this.mappedQuotes[this.activeTabId][0] : null;
        this.quoteSelected.emit(this.selectedQuote);
      }
    }
  }

  getQuoteActions(quote) {
    let actions = [];
    switch (quote.status) {
      case QuoteStatus.Open:
        actions.push({ status: QuoteStatus.Pending, label: 'Send', cssClass: 'btn-primary' });
        actions.push({ status: QuoteStatus.Approved, label: 'Approve', cssClass: 'btn-success' });
        break;
      case QuoteStatus.Pending:
        actions.push({ status: QuoteStatus.Approved, label: 'Approve', cssClass: 'btn-success' });
        actions.push({ status: QuoteStatus.Rejected, label: 'Reject', cssClass: 'btn-danger' });
        break;
      case QuoteStatus.Approved:
        actions.push({ status: QuoteStatus.Closed, label: 'Close', cssClass: 'btn-info' });
        break;
    }
    return actions;
  }

  changeQuoteStatus(quote, nextStatus) {
    if (quote.status == QuoteStatus.Open && quote.estimateFields.length == 0) {
      this.alertifyService.alert('Quote should have at least one estimated item.');
      return;
    }
    quote.status = nextStatus;
    this.quoteService.updateQuote(quote).subscribe(result => {
      if (result) {
        this.alertifyService.success('Quote has been updated successfully');
        this.mapAndGroupQuotes(this.quotes, false);
      }
    })
  }

  sumEstimateFields(quote) {
    let total = 0;
    quote.estimateFields.forEach(f => total += f.cost);

    return total;
  }

  getStatusIcons(statusArr: any[]) {
    return statusArr.map(x => {
      switch (parseInt(x.id, 10)) {
        case QuoteStatus.Open:
          x.icon = 'fa fa-folder-open gray';
          break;
        case QuoteStatus.Pending:
          x.icon = 'fa fa-hourglass-half gray';
          break;
        case QuoteStatus.Approved:
          x.icon = 'fa fa-circle green';
          break;
        case QuoteStatus.Rejected:
          x.icon = 'fa fa-ban red';
          break;
        case QuoteStatus.Closed:
          x.icon = 'fa fa-check-circle green';
          break;
        default:
          break;
      }
      return x;
    })
  }


  selectQuote(quote) {
    this.selectedQuote = quote;
    this.quoteSelected.emit(quote);
  }
  
  selectedTabChanged(tab) {
    this.activeTabId = tab.nextId;
    this.selectedQuote = this.mappedQuotes[this.activeTabId].length > 0 ? this.mappedQuotes[this.activeTabId][0] : null;
    this.quoteSelected.emit(this.selectedQuote);
  }

}
