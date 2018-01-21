import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/services.exports';
import * as randomColor from 'randomcolor';

@Component({
  selector: 'rb-services-dashboard',
  templateUrl: './services-dashboard.component.html',
  styleUrls: ['./services-dashboard.component.scss']
})
export class ServicesDashboardComponent implements OnInit {

  loading;
  data;
  options = {
    title: {
      display: false,
      text: 'Services Calls',
      fontSize: 16
    },
    legend: {
      position: 'bottom'
    }
  };

  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    this.loading = true;
    this.dashboardService.getServicesStats().subscribe(results => {
      this.data = {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
            hoverBackgroundColor: []
          },
        ]
      };

      for (let service of results) {
        this.data.labels.push(service.name);
        this.data.datasets[0].data.push(service.callsCount);
        let color = randomColor();
        this.data.datasets[0].backgroundColor.push(color);
        this.data.datasets[0].hoverBackgroundColor.push(color);
      }

      this.loading = false;
    });
  }

}
