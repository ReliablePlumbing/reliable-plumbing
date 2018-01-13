import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ScheduleCallComponent } from './schedule-call/schedule-call.component';
import { systemRoutes } from '../models/constants';
import { RequestQuoteComponent } from './request-quote/request-quote.component';

const routes: Routes = [
  { path: systemRoutes.scheduleCall, component: ScheduleCallComponent },
  { path: systemRoutes.requestQuote, component: RequestQuoteComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CallsQuotesManagementRoutingModule { }
