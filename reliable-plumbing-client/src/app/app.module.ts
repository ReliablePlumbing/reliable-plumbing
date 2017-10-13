import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
// our modules
import { UserManagementModule } from './user-management/user-management.module';
import { ServicesModule } from './services/services.module';

// components
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { TestComponent } from './test/test.component';
import { TestService } from './test/test.service';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    TestComponent
  ],
  imports: [
    BrowserModule/*.withServerTransition({appId: 'ang4-seo-pre'})*/,
    AppRoutingModule, ServicesModule, UserManagementModule
  ],
  providers: [TestService],
  bootstrap: [AppComponent]
})
export class AppModule { }
