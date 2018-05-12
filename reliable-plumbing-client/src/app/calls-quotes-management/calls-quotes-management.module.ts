import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { CallsQuotesManagementRoutingModule } from './calls-quotes-management-routing.module';
import { ScheduleCallComponent } from './schedule-call/schedule-call.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppointmentDetailsComponent } from './appointment-details/appointment-details.component';
import { SharedModule } from '../shared/shared.module';
import { RequestQuoteComponent } from './request-quote/request-quote.component';
import { CallsQuotesFormComponent } from './calls-quotes-form/calls-quotes-form.component';
import { QuoteDetailsComponent } from './quote-details/quote-details.component';
import { CallsListingComponent } from './calls-listing/calls-listing.component';
import { CallDetailsComponent } from './call-details/call-details.component';
import { QuoteQuickAddComponent } from './quote-quick-add/quote-quick-add.component';
import { QuotesListingComponent } from './quotes-listing/quotes-listing.component';

@NgModule({
  imports: [
    CommonModule, CallsQuotesManagementRoutingModule, NgbModule, ReactiveFormsModule, SharedModule, FormsModule
  ],
  declarations: [
    ScheduleCallComponent, AppointmentDetailsComponent, RequestQuoteComponent, CallsQuotesFormComponent, QuoteDetailsComponent,
    CallsListingComponent,
    CallDetailsComponent,
    QuoteQuickAddComponent,
    QuotesListingComponent
  ],
  exports: [
    ScheduleCallComponent, AppointmentDetailsComponent, CallsQuotesFormComponent, RequestQuoteComponent, QuoteDetailsComponent,
    CallsListingComponent, CallDetailsComponent, QuoteQuickAddComponent, QuotesListingComponent
  ]
})
export class CallsQuotesManagementModule { }
