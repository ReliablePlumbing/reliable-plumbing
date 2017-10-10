import { Injectable } from '@angular/core';
//import * as alertify from 'alertify.js';

@Injectable()
export class NotificationService {
 // private notifier: any = alertify;

  constructor() { }

  openConfirmationDialog(message: string, okCallback: () => any) {
    // this.notifier.confirm(message, function (e) {
    //   if (e) {
    //     okCallback();
    //   } else {
    //   }
    // });
  }

  printSuccessMessage(message: string) {
    //this.notifier.success(message);
  }

  printErrorMessage(message: string) {
  //  this.notifier.error(message);
  }

  showSuccessPopup(message: string) {
   // this.notifier.alert(message);
  }
}