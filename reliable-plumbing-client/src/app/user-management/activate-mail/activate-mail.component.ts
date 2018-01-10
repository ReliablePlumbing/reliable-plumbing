import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RouteHandlerService } from '../../services/route-handler.service';
import { UserManagementService } from '../../services/services.exports';
import { RegistrationMode, Role } from '../../models/enums';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { isSystemUser } from '../../utils/user-helpers';

@Component({
  selector: 'rb-activate-mail',
  templateUrl: './activate-mail.component.html',
  styleUrls: ['./activate-mail.component.scss']
})
export class ActivateMailComponent implements OnInit {

  token;
  loading = true;
  emailActivated = false;
  displayMessage = '';
  registrationMode = RegistrationMode.completeProfile;
  user = null;
  completeProfile = false;

  constructor(private activatedRoute: ActivatedRoute, private routeHandlerService: RouteHandlerService,
    private userManagementService: UserManagementService, private modalService: NgbModal) { }

  ngOnInit() {
    this.token = this.activatedRoute.snapshot.queryParams['token'];
    if (this.token == null)
      this.routeToDefault();
    else
      this.userManagementService.activateMail(this.token).subscribe(result => {
        this.loading = false;
        this.emailActivated = result.success;
        this.user = result.user;
        this.displayMessage = result.message;

        this.completeProfile = result.success && this.user && this.user.roles && isSystemUser(this.user);
      });

  }

  userAdded(user) {
    let body = {
      token: this.token,
      user: user
    }
    this.userManagementService.completeUserRegistration(body).subscribe((result) => {
      this.routeToDefault();
    });
  }

  routeToDefault() {
    this.routeHandlerService.routeToDefault();
  }
}
