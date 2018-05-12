import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { getEnumEntries } from '../../utils/date-helpers';
import { QuoteStatus } from '../../models/enums';

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

  constructor() { }
  ngOnInit() {
    this.initPermissions();
    this.statusTabs = this.getStatusIcons(this.statusTabs.concat(getEnumEntries(QuoteStatus)));
    if (this.quotes && this.quotes.length > 0)
      this.selectedQuote = this.quotes[0];
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

  mapAndGroupQuotes(quotes: any[]) {
    this.mappedQuotes = {};
    this.statusTabs.forEach(tab => this.mappedQuotes[tab.id] = [])

    for (let quote of quotes) {
      let customer = quote.user ? quote.user : quote.customerInfo;
      quote.fullName = customer.firstName + ' ' + (customer.lastName ? customer.lastName : '');
      quote.totalEstimate = quote.status == QuoteStatus.Open ? null : this.sumEstimateFields(quote)
      this.mappedQuotes[quote.status].push(quote);
    }
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
          x.icon = 'fa fa-hourglass-half gray';
          break;
        case QuoteStatus.Pending:
        x.icon = 'fa fa-ban red';
        break;
        case QuoteStatus.Approved:
        x.icon = 'fa fa-circle green';
          break;
        case QuoteStatus.Rejected:
          x.icon = 'fa fa-circle red';
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


}
