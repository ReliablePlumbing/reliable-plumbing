import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { buildImagesObjects, buildImagesObjectsForLightBox } from '../../utils/files-helpers';
import { QuoteService, AlertifyService, EnvironmentService, EventsService } from '../../services/services.exports';
import { QuoteStatus, ObjectType, Permission } from '../../models/enums';
import { isSystemUser } from '../../utils/user-helpers';
import { isQuoteOpen } from '../../utils/call-helpers';

@Component({
  selector: 'quote-details',
  templateUrl: './quote-details.component.html',
  styleUrls: ['./quote-details.component.scss']
})
export class QuoteDetailsComponent implements OnInit {

  @Input() quote;
  objectType = ObjectType.Quote;
  mappedQuote;
  loading = true;
  overlayLoading = false;
  estimates = {
    fields: [{ desc: null, cost: '0' }],
    total: 0
  };
  statusEnum = QuoteStatus;
  @Output() quoteUpdated: EventEmitter<any> = new EventEmitter<any>();
  @Output() close: EventEmitter<any> = new EventEmitter<any>();
  permissions;

  constructor(private QuoteService: QuoteService, private alertifyService: AlertifyService, private environmentService: EnvironmentService,
    private eventsService: EventsService) { }

  ngOnInit() {
    this.eventsService.callUpdated.subscribe(call => this.quoteChanged());
  }
  
  initPermissions() {
    let isQuoteOpened = isQuoteOpen(this.quote)
    this.permissions = {
      collaborate: this.environmentService.hasPermission(Permission.Collaborate),
      updateQuoteEstimate: this.environmentService.hasPermission(Permission.UpdateQuoteEstimate) && isQuoteOpened
    }
  }

  ngOnChanges() {
    this.quoteChanged();
  }

  quoteChanged() {
    if (this.quote) {
      this.initPermissions();
      this.mappedQuote = this.mapQuote(this.quote);
      this.loading = false;
    }
  }

  mapQuote(quote) {
    if (quote.estimateFields && quote.estimateFields.length > 0) {
      this.estimates.fields = quote.estimateFields;
      this.sumFields();
    }
    return {
      fullName: quote.fullName,
      address: this.getAddress(quote),
      contact: this.getCustomerContact(quote),
      images: buildImagesObjectsForLightBox(quote.id, quote.relatedFileNames),
      message: quote.message,
      actions: this.getQuoteActions(quote)
    }
  }

  getQuoteActions(quote) {
    let actions = [];
    switch (quote.status) {
      case QuoteStatus.Open:
        actions.push({ status: QuoteStatus.Pending, label: 'Send', cssClass: 'btn-primary' });
        actions.push({ status: QuoteStatus.Approved, label: 'Save As Approved', cssClass: 'btn-success' });
        break;
      case QuoteStatus.Pending:
        actions.push({ status: QuoteStatus.Approved, label: 'Approve', cssClass: 'btn-success' });
        actions.push({ status: QuoteStatus.Rejected, label: 'Reject', cssClass: 'btn-danger' });
        break;
      case QuoteStatus.Approved:
        actions.push({ status: QuoteStatus.Closed, label: 'Close', cssClass: 'btn-info' });
        break;
    }
    return actions;
  }

  getCustomerContact(quote) {
    let user = quote.user ? quote.user : quote.customerInfo;

    return user.email + ' - ' + user.mobile;
  }

  getAddress(quote) {
    let site = quote.user ? quote.user.sites.find(x => x.id == quote.siteId) : quote.customerInfo;

    return site.street + ' - ' + site.city + ' - ' + site.state;
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
    if (this.quote.status == QuoteStatus.Open) {
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
