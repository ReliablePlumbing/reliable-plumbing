import { Component, OnInit } from '@angular/core';
import { EnvironmentService } from '../services/services.exports';

@Component({
  selector: 'rb-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {

  currentUser;
  constructor(private environmentService: EnvironmentService) { }

  ngOnInit() {
    this.currentUser = this.environmentService.currentUser;
  }

}
