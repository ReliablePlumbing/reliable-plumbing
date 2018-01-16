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

@NgModule({
  imports: [
    CommonModule, CallsQuotesManagementRoutingModule, NgbModule, ReactiveFormsModule, SharedModule, FormsModule
  ],
  declarations: [
    ScheduleCallComponent, AppointmentDetailsComponent, RequestQuoteComponent, CallsQuotesFormComponent, QuoteDetailsComponent
  ],
  exports: [
    ScheduleCallComponent, AppointmentDetailsComponent, CallsQuotesFormComponent, RequestQuoteComponent, QuoteDetailsComponent
  ]
})
export class CallsQuotesManagementModule { }
