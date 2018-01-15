import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { QuoteStatus } from '../../models/enums';
import { getEnumEntries } from '../../utils/date-helpers';
import { QuoteService, AlertifyService } from '../../services/services.exports';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'rb-quote-management',
  templateUrl: './quote-management.component.html',
  styleUrls: ['./quote-management.component.scss']
})
export class QuoteManagementComponent implements OnInit {

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

    this.quoteService.getQuotesFilteredByStatus([QuoteStatus.Approved, QuoteStatus.Open, QuoteStatus.Pending, QuoteStatus.Rejected])
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

  sumEstimateFields(quote){
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

}
