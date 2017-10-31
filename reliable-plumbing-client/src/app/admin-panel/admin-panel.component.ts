import { Component, OnInit } from '@angular/core';
import { EnvironmentService } from '../services/services.exports';
import { Router } from '@angular/router';
@Component({
  selector: 'rb-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {

  currentUser;
  constructor(private environmentService: EnvironmentService, private router: Router) { }

  ngOnInit() {
    this.currentUser = this.environmentService.currentUser;
  }

  logout(){
      this.environmentService.destroyLoginInfo();
      this.currentUser = this.environmentService.currentUser;
      this.router.navigate(['/']);
  }
}
