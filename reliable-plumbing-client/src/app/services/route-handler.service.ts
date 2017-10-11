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
    let currentUser = this.environmentService.currentUser;
    this.router.navigate(['/'])
    
    // switch (currentUser.userTypeEnum) {
    //   case UserTypeEnum.admin:
    //     this.router.navigate(['/reports'])
    //     break;
    // }
  }
}
