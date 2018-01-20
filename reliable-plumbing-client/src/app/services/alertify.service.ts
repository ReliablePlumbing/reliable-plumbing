import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
// import * as alertify from 'alertify.js';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Router } from '@angular/router';

@Injectable()
export class AlertifyService {
  private notifier: any;

  constructor( @Inject(PLATFORM_ID) private platformId: Object, private router: Router) {
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

  notify(notification) {
    if (isPlatformBrowser(this.platformId))
      this.notifier
        .closeLogOnClick(true)
        .log(notification.message, ev => {
          this.router.navigateByUrl(notification.url)
        });
  }

  alert(message: string){
    this.notifier.alert(message);
  }
}