import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { EnvironmentService } from './environment.service';
import { Role } from '../models/enums';
import { Location } from '@angular/common'

@Injectable()
export class RouteHandlerService {

  constructor(private environmentService: EnvironmentService, private router: Router,
    private activatedRoute: ActivatedRoute, private location: Location) { }

  goBack() {
    this.location.back();
  }

  routeToDefault() {
    let route = this.getDefaultRoute();
    this.router.navigate([route])
  }

  getDefaultRoute() {
    let currentUser = this.environmentService.currentUser;
    let route = '/';
    if (currentUser)
      for (let role of currentUser.roles) {
        if (role == Role.Technician) {
          route = 'control-panel/my-appointments';
          break;
        }
        else if (role == Role.Admin || role == Role.SystemAdmin || role == Role.Supervisor) {
          route = 'control-panel/schedule-management';
          break;
        }
      }
    return route;
  }
}
