import { NgModule } from '@angular/core';
import { AgmCoreModule } from '@agm/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { TextMaskModule } from 'angular2-text-mask';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../environments/environment';

// prime ng components
import {
  StepsModule, TabViewModule, MenuModule, FileUploadModule, GalleriaModule, InputSwitchModule, ChartModule, PanelModule, CarouselModule,
  ScrollPanelModule, MultiSelectModule, OverlayPanelModule, TooltipModule, CalendarModule, LightboxModule, AccordionModule
} from 'primeng/primeng';
// import { LightboxModule } from 'angular2-lightbox';

// components
import { LoaderComponent } from './loader/loader.component';
import { NoDataComponent } from './no-data/no-data.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { MultiSelectDatepickerComponent } from './multi-select-datepicker/multi-select-datepicker.component';
import { MessageComponent } from './message/message.component';
import { OverlayLoaderComponent } from './overlay-loader/overlay-loader.component';

// directives
import { ModelCharsReplaceDirective } from './directives/model-chars-replace.directive';
import { InputNumberDirective } from './directives/input-number.directive';
import { ClosePopoverOnOutsideClickDirective } from './directives/close-popover-outside-click.directive';

// pipes 
import { TechnicianStatusColor, TechnicianStatusTxt } from './pipes/technician-status-pipes';
import { CallStatusColor, CallStatusTxt } from './pipes/call-status-pipes';

let declarations = [
  // components
  LoaderComponent, MultiSelectDatepickerComponent, NoDataComponent, NotificationsComponent, MessageComponent, OverlayLoaderComponent,
  // pipes
  CallStatusColor, CallStatusTxt, TechnicianStatusColor, TechnicianStatusTxt,
  // directives
  ModelCharsReplaceDirective, InputNumberDirective, ClosePopoverOnOutsideClickDirective
];


@NgModule({
  imports: [
    CommonModule, FormsModule, NgbModule, TextMaskModule, RouterModule, InputSwitchModule, AgmCoreModule.forRoot({ apiKey: environment.mapsApiKey }),
    StepsModule, TabViewModule, MenuModule, FileUploadModule, GalleriaModule, ChartModule, PanelModule, BrowserAnimationsModule, LightboxModule,
    CarouselModule, ScrollPanelModule, MultiSelectModule, OverlayPanelModule, CalendarModule, AccordionModule
  ],
  declarations: declarations,
  exports: [
    declarations, AgmCoreModule, TextMaskModule, StepsModule, TabViewModule, MenuModule, FileUploadModule, GalleriaModule, InputSwitchModule,
    NgbModule, ChartModule, PanelModule, LightboxModule, CarouselModule, ScrollPanelModule, MultiSelectModule, OverlayPanelModule, TooltipModule,
    CalendarModule, AccordionModule
  ]
})
export class SharedModule { }
