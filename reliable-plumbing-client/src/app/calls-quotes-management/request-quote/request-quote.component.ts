import { Component, OnInit } from '@angular/core';
import { AlertifyService, EnvironmentService, QuoteService } from '../../services/services.exports';
import { CallsQuotesMode } from '../../models/enums';
import { Router } from '@angular/router';

@Component({
  selector: 'rb-request-quote',
  templateUrl: './request-quote.component.html',
  styleUrls: ['./request-quote.component.scss']
})
export class RequestQuoteComponent implements OnInit {

  mode = CallsQuotesMode.quote;
  showMsg = false;
  loading = false;

  constructor(private alertifyService: AlertifyService, private environmentService: EnvironmentService,
    private quoteService: QuoteService, private router: Router) { }


  ngOnInit() {

  }

  quoteSubmitted(quote) {
    this.loading = true;
    this.quoteService.addQuote(quote.obj, quote.images).subscribe(result => {
      this.loading = false;
      this.showMsg = true;
      if (result.id != null) {
        this.alertifyService.success('Your quote has been submitted');
        setTimeout(() => this.router.navigate(['/']), 3000);
      }
    });

  }
}
