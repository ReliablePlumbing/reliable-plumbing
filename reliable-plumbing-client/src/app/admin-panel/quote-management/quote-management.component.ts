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
  responsiveModes = { split: 1, listing: 2, details: 3 }
  responsiveMode;
  screenWidth;

  constructor(private quoteService: QuoteService, private alertifyService: AlertifyService) { }

  ngOnInit() {
    this.getQuotes();
    this.screenWidth = screen.width;
    this.responsiveMode = screen.width >= 800 ? this.responsiveModes.split : this.responsiveModes.listing;
  }

  getQuotes() {
    this.loading = true;
    this.quoteService.getQuotesFilteredByStatus([])
      .subscribe(results => {
        this.quotes = results;
        this.loading = false;
        if (this.quotes && this.quotes.length > 0)
          this.selectedQuote = this.quotes[0];
      })
  }

  quoteSelected(quote) {
    if (screen.width < 800)
      this.responsiveMode = this.responsiveModes.details;

    this.selectedQuote = quote;
  }


  backFromDetails() {
    this.responsiveMode = this.responsiveModes.listing;
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


  ngAfterContentChecked() {
    if (this.screenWidth == screen.width)
      return;
    this.responsiveMode = screen.width >= 800 ? this.responsiveModes.split : this.responsiveModes.listing;
    this.screenWidth = screen.width;
  }
}
