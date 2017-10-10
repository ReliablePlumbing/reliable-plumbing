import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
// our modules
import { UserManagementModule } from './user-management/user-management.module';
import { ServicesModule } from './services/services.module';

// components
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule/*.withServerTransition({appId: 'ang4-seo-pre'})*/,
    AppRoutingModule, ServicesModule, UserManagementModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
