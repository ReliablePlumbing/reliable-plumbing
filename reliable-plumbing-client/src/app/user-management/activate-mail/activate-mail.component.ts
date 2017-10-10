import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RouteHandlerService } from '../../services/route-handler.service';
import { UserManagementService } from '../services/user-management.service';

@Component({
  selector: 'rb-activate-mail',
  templateUrl: './activate-mail.component.html',
  styleUrls: ['./activate-mail.component.scss']
})
export class ActivateMailComponent implements OnInit {

  token;
  loading = true;
  emailActivated = false;
  constructor(private activatedRoute: ActivatedRoute, private routeHandlerService: RouteHandlerService,
    private userManagementService: UserManagementService) { }

  ngOnInit() {
    this.token = this.activatedRoute.snapshot.queryParams['token'];
    if (this.token == null)
      this.routeToDefault();
    else
      this.userManagementService.activateMail(this.token).subscribe(result => {
        this.loading = false;
        this.emailActivated = result;
      });

  }


  routeToDefault() {
    this.routeHandlerService.routeToDefault();
  }
}
