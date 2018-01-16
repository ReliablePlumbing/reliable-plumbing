import { Injectable } from '@angular/core';
import { Response, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs';
import { HttpExtensionService } from './http-extension.service';
import { environment } from '../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable()
export class QuoteService {

  protected basePath = environment.apiUrl + 'quotes/';

  constructor(private httpService: HttpExtensionService, private sanitizer: DomSanitizer) { }

  addQuote(quote, images): Observable<any> {

    let formData = new FormData();
    formData.append('quote', JSON.stringify(quote));
    for (let img of images)
      formData.append('images', img, img.name);
    return this.httpService.post(this.basePath + 'addQuote', formData, false)
      .map((response: Response) => response.json())
  }

  getAppointmentsFiltered(filters): Observable<any> {
    return this.httpService.post(this.basePath + 'getAppointmentsFiltered', filters)
      .map((response: Response) => response.json())
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

  getQuotesFilteredByStatus(statuses, userId = null) {
    let body =  { statuses: statuses, userId: userId }
    return this.httpService.post(this.basePath + 'getQuotesFilteredByStatus', body)
      .map((response: Response) => response.json())
  }

  updateQuote(quote) {
    return this.httpService.post(this.basePath + 'updateQuote', quote)
      .map((response: Response) => response.json())
  }
}

