import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs';
import { HttpExtensionService } from './http-extension.service';
import { environment } from '../../environments/environment';

@Injectable()
export class AppointmentService {

  protected basePath = environment.apiUrl + 'appointments/';

  constructor(private httpService: HttpExtensionService) { }

  addAppointment(appointment): Observable<any> {
    return this.httpService.post(this.basePath + 'addAppointment', appointment, false)
      .map((response: Response) => response.json())
  }

  getAppointmentsFiltered(filters): Observable<any> {
    return this.httpService.post(this.basePath + 'getAppointmentsFiltered', filters)
      .map((response: Response) => response.json())
  }
}

