import { Component, OnInit } from '@angular/core';
import { EnvironmentService, AlertifyService, UserManagementService } from '../../services/services.exports';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { RegistrationMode, Role } from '../../models/enums';

@Component({
  selector: 'rb-users-management',
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.scss']
})
export class UsersManagementComponent implements OnInit {


  users = [];
  displayedUsers = [];
  page = 1;
  pageSize = 20;
  registerModelRef: NgbModalRef;
  registrationMode: RegistrationMode;
  loading = true;
  clonedEditedUser = null;
  selectedIndex = -1;
  modalHeaderTxt;


  constructor(private userManagementService: UserManagementService, private modalService: NgbModal,
    private environmentService: EnvironmentService, private alertifyService: AlertifyService) { }

  ngOnInit() {
    this.getAllUsers();
  }

  getAllUsers() {
    this.loading = true;
    this.userManagementService.getAllSystemUsers([Role.Customer]).subscribe(users => {
      this.users = users;
      this.displayedUsers = this.users.slice(0, this.pageSize);
      this.loading = false;
    })
  }

  addUser(register) {
    this.modalHeaderTxt = 'Add New User';
    this.clonedEditedUser = null;
    this.registrationMode = RegistrationMode.addCustomer;
    this.registerModelRef = this.modalService.open(register, { size: 'lg' })
  }

  userAdded(user) {
    if (this.registrationMode == RegistrationMode.addCustomer) {
      this.users.push(user);
    }
    else if (this.registrationMode == RegistrationMode.edit) {
      user.rolesString = '';
      for (let i = 0; i < user.rolesObj.length; i++) {
        let role = user.rolesObj[i];
        user.rolesString += role.name;
        if (i < user.roles.length - 1)
          user.rolesString += ', ';
      }
      this.users[this.selectedIndex] = user;
    }
    this.pageChange();
    this.registerModelRef.close();
    this.clonedEditedUser = null;
    this.registrationMode = null;
    this.selectedIndex = -1;
  }

  deleteUser(user) {
    let message = 'Are you sure you want to delete ' + user.firstName + ' ' + user.lastName;
    this.alertifyService.confirmDialog(message, () => {
      this.userManagementService.deleteUserById(user.id).subscribe(success => {
        if (success) {
          this.users = this.users.filter(u => user.id != u.id);
          this.pageChange();
          this.alertifyService.success('User deleted succefully');
        }
      });

    })
  }

  pageChange() {
    this.displayedUsers = this.users.slice((this.page - 1) * this.pageSize, (this.page * this.pageSize) + this.pageSize - 1);
  }


  editUser(user, template, index) {
    this.modalHeaderTxt = 'Edit User';
    this.clonedEditedUser = Object.assign({}, user);
    this.clonedEditedUser.roles = [].concat(this.clonedEditedUser.roles);
    this.registrationMode = RegistrationMode.edit;
    this.selectedIndex = index;
    this.registerModelRef = this.modalService.open(template, { size: 'lg' })

  }
}
