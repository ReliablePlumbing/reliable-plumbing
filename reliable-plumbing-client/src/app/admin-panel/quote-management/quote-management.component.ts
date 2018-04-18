import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { QuoteStatus, CallsQuotesMode } from '../../models/enums';
import { getEnumEntries } from '../../utils/date-helpers';
import { QuoteService, AlertifyService } from '../../services/services.exports';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'rb-quote-management',
  templateUrl: './quote-management.component.html',
  styleUrls: ['./quote-management.component.scss']
})
export class QuoteManagementComponent implements OnInit {
  modes = { listing: 1, addQuote: 2, msg: 3 };
  callsQuotesMode: CallsQuotesMode = CallsQuotesMode.quote;
  mode = this.modes.listing;
  tabs = [];
  quotes;
  mappedQuotes;
  loading = true;
  @ViewChild('quoteDetails') quoteDetailsTemplate: ElementRef;
  quoteDetailsModalRef: NgbModalRef;
  selectedQuote = null;
  statusEnum = QuoteStatus;

  constructor(private quoteService: QuoteService, private alertifyService: AlertifyService, private modalService: NgbModal) { }

  ngOnInit() {
    this.tabs = getEnumEntries(QuoteStatus);

    this.getQuotes();
  }


  getQuotes() {
    this.loading = true;
    this.quoteService.getQuotesFilteredByStatus([])
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

  quoteSubmitted(quote) {
    this.quoteService.addQuote(quote.obj, quote.images).subscribe(result => {
      if (result.id != null) {
        this.mode = this.modes.msg;
        setTimeout(() => {
          this.mode = this.modes.listing
          this.getQuotes();
        }, 5000);
        this.alertifyService.success('Your call has been submitted');
      }
    });
  }

  setMode = (currentMode) => this.mode = currentMode;
}
