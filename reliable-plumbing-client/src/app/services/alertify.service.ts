import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
// import * as alertify from 'alertify.js';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Injectable()
export class AlertifyService {
  private notifier: any;

  constructor( @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId))
      this.notifier = alertify;    
   }

  confirmDialog(message: string, okCallback: () => any) {
    if (isPlatformBrowser(this.platformId))
      this.notifier.confirm(message, function (e) {
        if (e) {
          okCallback();
        } else {
        }
      });
  }

  success(message: string) {
    if (isPlatformBrowser(this.platformId))
      this.notifier.success(message);
  }

  error(message: string) {
    if (isPlatformBrowser(this.platformId))
      this.notifier.error(message);
  }

  notify(message) {
    if (isPlatformBrowser(this.platformId))
      this.notifier
        .closeLogOnClick(true)
        .log(message, ev => {
          this.notifier.log('clicked');
        });
  }
}