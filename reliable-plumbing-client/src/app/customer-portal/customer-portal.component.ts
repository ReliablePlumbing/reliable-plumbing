import { Component, OnInit } from '@angular/core';
import { systemRoutes } from './../models/constants';
import { EnvironmentService, RouteHandlerService } from '../services/services.exports';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'rb-customer-portal',
  templateUrl: './customer-portal.component.html',
  styleUrls: ['./customer-portal.component.scss']
})
export class CustomerPortalComponent implements OnInit {

  tabs = {
    calls: 1,
    quotes: 2,
    profile: 3,
    changePassword: 4,
  }
  systemRoutes = systemRoutes;
  currentSelectedTab;

  constructor(private environmentService: EnvironmentService, private router: Router, private routeHandlerService: RouteHandlerService) { }

  ngOnInit() {
    this.currentSelectedTab = this.tabs.calls;
    this.subscribeToRouterEvents();
    this.setCurrentTabFromUrl(this.router.url);
  }

  subscribeToRouterEvents() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd)
        this.setCurrentTabFromUrl(event.url);
    });
  }

  setCurrentTabFromUrl(url) {
    if (~url.indexOf(systemRoutes.callsHistory))
      this.currentSelectedTab = this.tabs.calls;
    else if (~url.indexOf(systemRoutes.quotesHistory))
      this.currentSelectedTab = this.tabs.quotes;
    else if (~url.indexOf(systemRoutes.myProfile))
      this.currentSelectedTab = this.tabs.profile;
    else if (~url.indexOf(systemRoutes.changePassword))
      this.currentSelectedTab = this.tabs.changePassword;
  }

  showContent = true;
  toggleNav(fromTogglerBtn = false) {
    if (fromTogglerBtn || screen.width < 769) {
      document.getElementById("mySidenav").classList.toggle("opened");
      if (document.getElementById("main"))
        document.getElementById("main").classList.toggle("opened");

    }

    if (screen.width < 769)
      this.showContent = !this.showContent;
    else
      this.showContent = true;

  }
}
