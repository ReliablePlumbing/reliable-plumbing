import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { buildImagesObjects } from '../../utils/files-helpers';
import { QuoteService, AlertifyService } from '../../services/services.exports';
import { QuoteStatus } from '../../models/enums';

@Component({
  selector: 'rb-quote-details',
  templateUrl: './quote-details.component.html',
  styleUrls: ['./quote-details.component.scss']
})
export class QuoteDetailsComponent implements OnInit {

  @Input() quote;
  mappedQuote;
  showImages = false;
  estimates = {
    fields: [{ desc: null, cost: '0' }],
    total: 0
  };
  statusEnum = QuoteStatus;

  @Output() quoteUpdated: EventEmitter<any> = new EventEmitter<any>();
  @Output() close: EventEmitter<any> = new EventEmitter<any>();

  constructor(private QuoteService: QuoteService, private alertifyService: AlertifyService) { }

  ngOnInit() {

    this.mappedQuote = this.mapQuote(this.quote);

  }

  mapQuote(quote) {
    if (quote.estimateFields && quote.estimateFields.length > 0) {
      this.estimates.fields = quote.estimateFields;
      this.sumFields();
    }
    return {
      images: buildImagesObjects(quote.id, quote.relatedFileNames),
      fullName: quote.fullName,
      message: quote.message,

    }
  }

  addAnotherField() {
    this.estimates.fields.push({ desc: null, cost: '0' });
    this.sumFields();
  }

  removeField(index) {
    let filteredFields = [];
    for (let i = 0; i < this.estimates.fields.length; i++)
      if (i != index)
        filteredFields.push(this.estimates.fields[i]);

    this.estimates.fields = filteredFields;
    this.sumFields();
  }

  sumFields() {
    this.estimates.total = 0;
    this.estimates.fields.forEach(f => this.estimates.total += parseFloat(f.cost));

  }

  save() {
    this.quote.estimateFields = this.estimates.fields
      .filter(f => f.desc != null || parseFloat(f.cost) > 0)
      .map(f => {
        return {
          desc: f.desc,
          cost: (f.cost == null || parseFloat(f.cost) < 0) ? 0 : parseFloat(f.cost)
        }
      });
    this.quote.status = QuoteStatus.Pending;
    this.QuoteService.updateQuote(this.quote).subscribe(result => {
      if (result) {
        this.alertifyService.success('Quote sent to the customer');
        this.quoteUpdated.emit(this.quote);
      }
    })
  }

  closeModal() {
    this.close.emit();
  }

}
