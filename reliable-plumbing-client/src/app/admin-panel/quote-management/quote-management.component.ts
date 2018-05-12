import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { QuoteStatus, CallsQuotesMode } from '../../models/enums';
import { QuoteService, AlertifyService } from '../../services/services.exports';

@Component({
  selector: 'rb-quote-management',
  templateUrl: './quote-management.component.html',
  styleUrls: ['./quote-management.component.scss']
})
export class QuoteManagementComponent implements OnInit {
  modes = { listing: 1, addQuote: 2, msg: 3 };
  callsQuotesMode: CallsQuotesMode = CallsQuotesMode.quote;
  mode = this.modes.listing;
  quotes;
  loading = true;
  selectedQuote = null;

  constructor(private quoteService: QuoteService, private alertifyService: AlertifyService) { }

  ngOnInit() {
    this.getQuotes();
  }

  getQuotes() {
    this.loading = true;
    this.quoteService.getQuotesFilteredByStatus([])
      .subscribe(results => {
        this.quotes = results;
        this.loading = false;
      })
  }

  quoteSelected = quote => this.selectedQuote = quote;

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
