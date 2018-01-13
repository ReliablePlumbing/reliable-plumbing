import { Component, OnInit } from '@angular/core';
import { AlertifyService, EnvironmentService, QuoteService } from '../../services/services.exports';
import { CallsQuotesMode } from '../../models/enums';

@Component({
  selector: 'rb-request-quote',
  templateUrl: './request-quote.component.html',
  styleUrls: ['./request-quote.component.scss']
})
export class RequestQuoteComponent implements OnInit {

  mode = CallsQuotesMode.quote;

  constructor(private alertifyService: AlertifyService, private environmentService: EnvironmentService,
    private quoteService: QuoteService) { }


  ngOnInit() {

  }

  quoteSubmitted(quote) {

    this.quoteService.addQuote(quote.obj, quote.images).subscribe(result => {
      if (result.id != null) {
        this.alertifyService.success('Your quote has been submitted');
      }
    });

  }
}
