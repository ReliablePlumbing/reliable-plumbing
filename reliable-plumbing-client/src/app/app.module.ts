import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// our modules
import { UserManagementModule } from './user-management/user-management.module';
import { ServicesModule } from './services/services.module';
import { AppointmentManagementModule } from './appointment-management/appointment-management.module';
import { AdminPanelModule } from './admin-panel/admin-panel.module';

// components
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { TestComponent } from './test/test.component';
import { TestService } from './test/test.service';


@NgModule({
  declarations: [
    AppComponent, HomeComponent, TestComponent
  ],
  imports: [
    BrowserModule/*.withServerTransition({appId: 'ang4-seo-pre'})*/,
    NgbModule.forRoot(),
    AppRoutingModule, ServicesModule, AdminPanelModule, UserManagementModule, AppointmentManagementModule,
    
  ],
  providers: [TestService],
  bootstrap: [AppComponent]
})
export class AppModule { }
