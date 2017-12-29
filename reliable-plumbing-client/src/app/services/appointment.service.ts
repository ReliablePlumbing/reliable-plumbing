import { Injectable } from '@angular/core';
import { Response, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs';
import { HttpExtensionService } from './http-extension.service';
import { environment } from '../../environments/environment';
import {DomSanitizer} from '@angular/platform-browser';

@Injectable()
export class AppointmentService {

  protected basePath = environment.apiUrl + 'appointments/';

  constructor(private httpService: HttpExtensionService, private sanitizer: DomSanitizer) { }

  addAppointment(appointment, images): Observable<any> {

    let formData = new FormData();
    formData.append('appointment', JSON.stringify(appointment));
    for (let img of images)
      formData.append('images', img, img.name);
    return this.httpService.post(this.basePath + 'addAppointment', formData, false)
      .map((response: Response) => response.json())
  }

  getAppointmentsFiltered(filters): Observable<any> {
    return this.httpService.post(this.basePath + 'getAppointmentsFiltered', filters)
      .map((response: Response) => response.json())
  }

  getAssigneesAppointments(filters): Observable<any> {
    return this.httpService.post(this.basePath + 'getAssigneesAppointments', filters)
      .map((response: Response) => response.json())
  }

  getTechniciansWithStatusInTime(id): Observable<any> {
    return this.httpService.get(this.basePath + 'getTechniciansWithStatusInTime?appointmentId=' + id)
      .map((response: Response) => response.json());
  }

  updateAppointmentStatusAndAssignees(appointment): Observable<any> {
    return this.httpService.post(this.basePath + 'updateAppointmentStatusAndAssignees', appointment)
      .map((response: Response) => response.json());
  }

  technicianCheckIn(checkInDetails): Observable<any> {
    return this.httpService.post(this.basePath + 'technicianCheckIn', checkInDetails)
      .map((response: Response) => response.json());
  }

  getFiles(body) {
    return this.httpService.post('http://localhost:3000/api/files/getFiles', body, true, {
      responseType: ResponseContentType.Blob
    }).map(res => {
      return new Blob([res._body], {
        type: res.headers.get("Content-Type")
      });
    })
      .map(blob => {
        var urlCreator = window.URL;
        return this.sanitizer.bypassSecurityTrustUrl(urlCreator.createObjectURL(blob));
      })
  }
}

