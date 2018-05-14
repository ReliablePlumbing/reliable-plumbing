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
    fields: [],
    total: 0,
    isEdit: false
  };
  statusEnum = QuoteStatus;
  permissions: {
    collaborate: boolean,
    updateQuoteEstimate: boolean
  };

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
    this.mapEstimateFields();
    return {
      fullName: quote.fullName,
      address: this.getAddress(quote),
      contact: this.getCustomerContact(quote),
      images: buildImagesObjectsForLightBox(quote.id, quote.relatedFileNames),
      message: quote.message,
      estimateTotal: this.sumFields(quote.estimateFields),
      estimateFields: quote.estimateFields
    }
  }

  mapEstimateFields() {
    this.estimates.fields = this.quote.estimateFields.map(f => {
      return { desc: f.desc, cost: f.cost };
    });
    this.estimates.fields.push({ desc: null, cost: '0' });
    this.estimates.total = this.sumFields(this.estimates.fields);
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
    this.estimates.total = this.sumFields(this.estimates.fields);
  }

  removeField(index) {
    let filteredFields = [];
    for (let i = 0; i < this.estimates.fields.length; i++)
      if (i != index)
        filteredFields.push(this.estimates.fields[i]);

    this.estimates.fields = filteredFields;
    this.estimates.total = this.sumFields(this.estimates.fields);
  }

  sumFields(fields) {
    let total = 0;
    this.estimates.fields.forEach(f => total += parseFloat(f.cost));

    return total;
  }

  fieldChanged() {
    this.estimates.total = this.sumFields(this.estimates.fields);
  }

  updateQuoteEstimates() {
    if (!this.permissions.updateQuoteEstimate)
      return;
    this.overlayLoading = true;
    this.quote.estimateFields = this.estimates.fields
      .filter(f => f.desc != null || parseFloat(f.cost) > 0)
      .map(f => {
        return {
          desc: f.desc,
          cost: (f.cost == null || parseFloat(f.cost) < 0) ? 0 : parseFloat(f.cost)
        }
      });
    this.save().then(updatedQuote => {
      this.mappedQuote = this.mapQuote(this.quote);
      this.estimates.isEdit = false;
      this.overlayLoading = false;
    });
  }

  cancelEstimatesChanges() {
    this.estimates.isEdit = false;
    this.mapEstimateFields();
  }

  save() {

    return new Promise<boolean>((resolve, reject) => {
      // quote service
      this.QuoteService.updateQuote(this.quote).subscribe(result => {
        if (result) {
          this.alertifyService.success('Quote has been updated successfully');
          resolve(result);
        }
      })
    });
  }
}
