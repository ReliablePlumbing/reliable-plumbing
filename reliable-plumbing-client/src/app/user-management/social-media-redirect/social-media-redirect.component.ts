import { Component, OnInit } from '@angular/core';
import { SocialMediaProvider } from '../../models/enums';
import { sessionStrg } from '../../models/constants';
import { Location } from '@angular/common';
import { Http, Response, Headers } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, AlertifyService, RouteHandlerService } from '../../services/services.exports';

@Component({
  selector: 'rb-social-media-redirect',
  templateUrl: './social-media-redirect.component.html',
  styleUrls: ['./social-media-redirect.component.scss']
})
export class SocialMediaRedirectComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private authService: AuthService,
    private alertifyService: AlertifyService, private routeHandlerService: RouteHandlerService) { }

  ngOnInit() {
    let code = this.activatedRoute.snapshot.queryParams['code'];
    if (code == null) {
      this.router.navigate(['/']);
      return;
    }

    let provider: SocialMediaProvider = parseInt(sessionStorage.getItem(sessionStrg.socialMediaLoginProvider));

    sessionStorage.removeItem(sessionStrg.socialMediaLoginProvider);
    
    this.authService.getSocialUserDataAndToken(provider, code).subscribe(success => {
      if (success) {
        this.routeHandlerService.routeToDefault();
        this.alertifyService.success('login completed successfully');
      }
      else {
        this.alertifyService.error('incomplete login, please try again');
        this.router.navigate(['/'])
      }

    });

  }

}

  // if (window.opener != null && !window.opener.closed) {

  //   (<any>window).accessToken = res;
  //   window.close();
  // }