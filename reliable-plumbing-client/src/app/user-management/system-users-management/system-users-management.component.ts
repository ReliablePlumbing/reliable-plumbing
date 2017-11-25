import { Component, OnInit } from '@angular/core';
import { EnvironmentService, AlertifyService, UserManagementService } from '../../services/services.exports';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { RegistrationMode, Role } from '../../models/enums';

@Component({
  selector: 'rb-system-users-management',
  templateUrl: './system-users-management.component.html',
  styleUrls: ['./system-users-management.component.scss']
})
export class SystemUsersManagementComponent implements OnInit {

  users = [];
  registerModelRef: NgbModalRef;
  registrationMode: RegistrationMode = RegistrationMode.admin;
  loading = true;

  constructor(private userManagementService: UserManagementService, private modalService: NgbModal,
    private environmentService: EnvironmentService, private alertifyService: AlertifyService) { }

  ngOnInit() {
    this.getAllSystemUsers();
  }

  getAllSystemUsers() {
    let rolesRequested = [];
    let currentUserRoles = this.environmentService.currentUser.roles;

    if (~currentUserRoles.findIndex(r => r == Role.SystemAdmin))
      rolesRequested = rolesRequested.concat([Role.Admin, Role.SystemAdmin]);
    if (~currentUserRoles.findIndex(r => r == Role.Admin || r == Role.SystemAdmin))
      rolesRequested = rolesRequested.concat([Role.Supervisor, Role.Technician]);
    this.userManagementService.getAllSystemUsers(rolesRequested).subscribe(results => {
      this.users = results;
      let currentUser = this.environmentService.currentUser;
      this.users = this.users.filter(user => user.id != currentUser.id)
      for (let user of this.users) {
        user.rolesString = '';
        for (let i = 0; i < user.rolesObj.length; i++) {
          let role = user.rolesObj[i];
          user.rolesString += role.name;
          if (i < user.roles.length - 1)
            user.rolesString += ', ';
        }
      }
      this.loading = false;
    });
  }


  addUser(register) {
    this.registerModelRef = this.modalService.open(register, { size: 'lg' })
  }

  userAdded(user) {
    this.users.push(user);
    this.registerModelRef.close();
  }

  deleteUser(user) {
    let message = 'Are you sure you want delete ' + user.firstName + ' ' + user.lastName;
    this.alertifyService.confirmDialog(message, () => {
      this.userManagementService.deleteUserById(user.id).subscribe(success => {
        if (success) {
          this.users = this.users.filter(u => user.id != u.id);
          this.alertifyService.success('User deleted succefully');
        }
      });

    })
  }
}
