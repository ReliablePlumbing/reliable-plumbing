import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

// our modules
import { ServicesModule } from '../services/services.module';
import { UserManagementModule } from '../user-management/user-management.module';

// components
import { AdminPanelRoutingModule } from './admin-panel-routing.module';
import { AppointmentTypesManagementComponent } from './appointment-types-management/appointment-types-management.component';
import { AdminPanelComponent } from './admin-panel.component';
import { ScheduleManagementComponent } from './schedule-management/schedule-management.component';

@NgModule({
  imports: [
    CommonModule, AdminPanelRoutingModule, ServicesModule, NgbModule, FormsModule, UserManagementModule
  ],
  declarations: [AppointmentTypesManagementComponent, AdminPanelComponent, ScheduleManagementComponent]
})
export class AdminPanelModule { }
