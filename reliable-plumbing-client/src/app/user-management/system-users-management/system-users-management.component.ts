import { Component, OnInit } from '@angular/core';
import { UserManagementService } from '../services/user-management.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { RegistrationMode } from '../../models/enums';

@Component({
  selector: 'rb-system-users-management',
  templateUrl: './system-users-management.component.html',
  styleUrls: ['./system-users-management.component.scss']
})
export class SystemUsersManagementComponent implements OnInit {

  users = [];
  registerModelRef: NgbModalRef;
  registrationMode: RegistrationMode = RegistrationMode.admin;

  constructor(private userManagementService: UserManagementService, private modalService: NgbModal) { }

  ngOnInit() {
    this.getAllSystemUsers();
  }

  getAllSystemUsers() {
    this.userManagementService.getAllSystemUsers().subscribe(results => {
      this.users = results;
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
    debugger;
    this.userManagementService.deleteUserById(user.id).subscribe(success => {

    })
  }
}
