import { Injectable } from '@angular/core';
import * as alertify from 'alertify.js';

@Injectable()
export class AlertifyService {
  private notifier: any = alertify;

  constructor() { }

  confirmDialog(message: string, okCallback: () => any) {
    this.notifier.confirm(message, function (e) {
      if (e) {
        okCallback();
      } else {
      }
    });
  }

  success(message: string) {
    this.notifier.success(message);
  }

  error(message: string) {
    this.notifier.error(message);
  }

  notify(message) {
    this.notifier
    .closeLogOnClick(true)
    .log(message, ev => {
      this.notifier.log('clicked');
    });
  }
}