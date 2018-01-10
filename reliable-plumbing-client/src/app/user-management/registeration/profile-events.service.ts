import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ProfileEventsService {

  private validateFormSource: Subject<any> = new Subject<any>()
  validateForm: Observable<any> = this.validateFormSource.asObservable();

  isFormValid = () => this.validateFormSource.next();
  
  private validateFormResponseSource: Subject<boolean> = new Subject<boolean>()
  validateFormResponse: Observable<boolean> = this.validateFormResponseSource.asObservable();

  isFormValidResponse = (isValid) => this.validateFormResponseSource.next(isValid);

}
