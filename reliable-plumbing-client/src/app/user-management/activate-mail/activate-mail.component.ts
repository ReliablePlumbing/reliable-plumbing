import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RouteHandlerService } from '../../services/route-handler.service';
import { UserManagementService } from '../services/user-management.service';
import { RegistrationMode, Role } from '../../models/enums';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

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
  @ViewChild('register') registerationTemplate: ElementRef;
  registerModelRef: NgbModalRef;

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

        if (result.success && this.user != null) {
          let isSystemUser = false;
          if (this.user.roles != null)
            for (let i = 0; i < this.user.roles.length; i++)
              if (this.user.roles[i] == Role.Admin || this.user.roles[i] == Role.Technician)
                this.registerModelRef = this.modalService.open(this.registerationTemplate);
        }
      });

  }

  userAdded(user){
    let body = {
      token: this.token,
      user: user
    }
    this.userManagementService.completeUserRegistration(body).subscribe((result) => alert(result));
  }

  routeToDefault() {
    this.routeHandlerService.routeToDefault();
  }
}
