import { Component, OnInit } from '@angular/core';
import { UserManagementService } from '../services/user-management.service';
import { EnvironmentService } from '../../services/environment.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { RegistrationMode } from '../../models/enums';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'rb-system-users-management',
  templateUrl: './system-users-management.component.html',
  styleUrls: ['./system-users-management.component.scss']
})
export class SystemUsersManagementComponent implements OnInit {

  users = [];
  registerModelRef: NgbModalRef;
  registrationMode: RegistrationMode = RegistrationMode.admin;

  constructor(private userManagementService: UserManagementService, private modalService: NgbModal,
    private environmentService: EnvironmentService, private notificationSerive: NotificationService) { }

  ngOnInit() {
    this.getAllSystemUsers();
  }

  getAllSystemUsers() {
    this.userManagementService.getAllSystemUsers().subscribe(results => {
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
    this.notificationSerive.confirmDialog(message, () => {
      this.userManagementService.deleteUserById(user.id).subscribe(success => {
        if (success) {
          this.users = this.users.filter(u => user.id != u.id);
          this.notificationSerive.printSuccessMessage('User deleted succefully');
        }
      });

    })
  }
}
