import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { buildImagesObjects } from '../../utils/files-helpers';
import { QuoteService, AlertifyService, EnvironmentService } from '../../services/services.exports';
import { QuoteStatus } from '../../models/enums';
import { isSystemUser } from '../../utils/user-helpers';

@Component({
  selector: 'rb-quote-details',
  templateUrl: './quote-details.component.html',
  styleUrls: ['./quote-details.component.scss']
})
export class QuoteDetailsComponent implements OnInit {

  @Input() quote;
  isCustomer = false;
  mappedQuote;
  showImages = false;
  estimates = {
    fields: [{ desc: null, cost: '0' }],
    total: 0
  };
  statusEnum = QuoteStatus;

  @Output() quoteUpdated: EventEmitter<any> = new EventEmitter<any>();
  @Output() close: EventEmitter<any> = new EventEmitter<any>();

  constructor(private QuoteService: QuoteService, private alertifyService: AlertifyService, private environemntService: EnvironmentService) { }

  ngOnInit() {
    this.isCustomer = !isSystemUser(this.environemntService.currentUser);
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

  save(nextStatus) {
    if (nextStatus == QuoteStatus.Pending) {
      this.quote.estimateFields = this.estimates.fields
        .filter(f => f.desc != null || parseFloat(f.cost) > 0)
        .map(f => {
          return {
            desc: f.desc,
            cost: (f.cost == null || parseFloat(f.cost) < 0) ? 0 : parseFloat(f.cost)
          }
        });
    }
    this.quote.status = nextStatus;
    this.QuoteService.updateQuote(this.quote).subscribe(result => {
      if (result) {
        this.alertifyService.success('Quote has been updated successfully');
        this.quoteUpdated.emit(this.quote);
      }
    })
  }

  closeModal() {
    this.close.emit();
  }

}
