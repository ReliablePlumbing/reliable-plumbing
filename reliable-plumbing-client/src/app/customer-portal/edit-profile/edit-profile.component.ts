import { Component, OnInit } from '@angular/core';
import { RegistrationMode } from '../../models/enums';

@Component({
  selector: 'rb-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {

  mode = RegistrationMode.edit;

  constructor() { }

  ngOnInit() {
  }

}
