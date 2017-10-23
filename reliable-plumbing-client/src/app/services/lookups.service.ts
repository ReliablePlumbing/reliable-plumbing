import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs';
import { HttpExtensionService } from './http-extension.service';
import { environment } from '../../environments/environment';

@Injectable()
export class LookupsService {

  protected basePath = environment.apiUrl + 'lookups/';

  constructor(private httpService: HttpExtensionService) { }

  getAllAppointmentTypes(): Observable<any> {
    return this.httpService.get(this.basePath + 'getAllAppointmentTypes', false)
      .map((response: Response) => response.json());
  }

  addEditAppointmentType(appointmentType): Observable<any> {
    return this.httpService.post(this.basePath + 'addEditAppointmentType', appointmentType)
      .map((response: Response) => response.json());

  }

  getAppointmentSettings(): Observable<any> {
    return this.httpService.get(this.basePath + 'getAppointmentSettings', false)
      .map((response: Response) => response.json());
  }

  saveAppointmentSettings(settings): Observable<any> {
    return this.httpService.post(this.basePath + 'addEditAppointmentSettings', settings)
      .map((response: Response) => response.json());
  }

  getAppointmentSettingsAndTypes(): Observable<any> {
    return this.httpService.get(this.basePath + 'getAppointmentSettingsAndTypes', false)
      .map((response: Response) => response.json());
  }


}
