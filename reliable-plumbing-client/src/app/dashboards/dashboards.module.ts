import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesDashboardComponent } from './services-dashboard/services-dashboard.component';
import { TechniciansRatingComponent } from './technicians-rating/technicians-rating.component';
import { TechniciansCallsComponent } from './technicians-calls/technicians-calls.component';
import { CallsDashboardComponent } from './calls-dashboard/calls-dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { ServicesModule } from '../services/services.module';

@NgModule({
  imports: [
    CommonModule, SharedModule, ServicesModule
  ],
  declarations: [
    ServicesDashboardComponent, TechniciansRatingComponent, TechniciansCallsComponent, CallsDashboardComponent
  ],
  exports: [
    ServicesDashboardComponent, TechniciansRatingComponent, TechniciansCallsComponent, CallsDashboardComponent
  ]
})
export class DashboardsModule { }
