import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QuoteStatus, CallsQuotesMode } from '../../models/enums';
import { QuoteService, AlertifyService, EnvironmentService } from '../../services/services.exports';
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

  constructor(private quoteService: QuoteService, private alertifyService: AlertifyService, private modalService: NgbModal,
    private environemntService: EnvironmentService) { }

  ngOnInit() {
    this.tabs = getEnumEntries(QuoteStatus).filter(t => t.id != QuoteStatus.Open);

    this.quoteService.getQuotesFilteredByStatus([QuoteStatus.Pending, QuoteStatus.Approved, QuoteStatus.Rejected], this.environemntService.currentUser.id)
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
      quote.totalEstimate = quote.status == QuoteStatus.Open ? null : this.sumEstimateFields(quote)
      mappedQuotes[quote.status].push(quote);
    }

    return mappedQuotes;
  }

  sumEstimateFields(quote) {
    let total = 0;
    quote.estimateFields.forEach(f => total += f.cost);

    return total;
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

  quoteUpdated(quote) {
    let index = this.quotes.filter(q => q.id == quote.id);

    this.quotes[index] = quote;
    this.mappedQuotes = this.mapAndGroupQuotes(this.quotes);

    this.closeQuoteDetailsModal();
  }

  setMode = (currentMode) => this.mode = currentMode;

  quoteSubmitted(quote) {

    this.quoteService.addQuote(quote.obj, quote.images).subscribe(result => {
      if (result.id != null) {
        this.mode = this.modes.msg;
        this.alertifyService.success('Your quote has been submitted');
        setTimeout(() => this.mode = this.modes.history, 5000);
      }
    });

  }
}
