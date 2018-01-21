import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/services.exports';

@Component({
  selector: 'rb-dashboards',
  templateUrl: './dashboards.component.html',
  styleUrls: ['./dashboards.component.scss']
})
export class DashboardsComponent implements OnInit {

  loading;
  callsCounts;
  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    this.loading = true;
    this.dashboardService.getCallsCounts().subscribe(results => {
      this.loading = false;
      this.callsCounts = results;
    });

    $(".navbar-nav li a").click(function (event) {
      $(".navbar-collapse").collapse('hide');
    });
  }

}
