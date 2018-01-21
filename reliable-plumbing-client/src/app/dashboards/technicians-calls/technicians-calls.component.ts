import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/services.exports';

@Component({
  selector: 'rb-technicians-calls',
  templateUrl: './technicians-calls.component.html',
  styleUrls: ['./technicians-calls.component.scss']
})
export class TechniciansCallsComponent implements OnInit {

  data;
  loading;
  options = {
    title: {
      display: false,
      text: 'Services Calls',
      fontSize: 16
    },
    legend: {
      position: 'bottom',
      display: false
    },
    scales: {
      xAxes: [{
        barPercentage: 0.3,
        categoryPercentage: 0.5
      }],
      yAxes: [{
        ticks: {
          min: 0,
        }
      }]
    }
  };
  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    this.loading = true;
    this.dashboardService.getTechniciansCallsStats().subscribe(results => {

      this.data = {
        labels: [],
        datasets: [
          {
            data: [],
            label: 'Calls Count',
            backgroundColor: '#42A5F5',
            borderColor: '#1E88E5'
          },
        ]
      };

      for (let technician of results) {
        this.data.labels.push(technician.firstName + ' ' + (technician.lastName ? technician.lastName : ''));
        this.data.datasets[0].data.push(technician.callsCount);
      }

      this.loading = false;
    });
  }

}
