import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpExtensionService } from './http-extension.service';
import { environment } from '../../environments/environment';
import { EnvironmentService } from './services.exports';

@Injectable()
export class DashboardService {

  protected basePath = environment.apiUrl + 'security/';

  constructor(private httpService: HttpExtensionService, private environmentService: EnvironmentService) { }

 
}

