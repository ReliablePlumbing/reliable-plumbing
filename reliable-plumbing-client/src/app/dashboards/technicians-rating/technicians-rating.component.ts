import { Component, OnInit, Input } from '@angular/core';
import { DashboardService } from '../../services/services.exports';

@Component({
  selector: 'rb-technicians-rating',
  templateUrl: './technicians-rating.component.html',
  styleUrls: ['./technicians-rating.component.scss']
})
export class TechniciansRatingComponent implements OnInit {

  data;
  loading;
  options = {
    title: {
      display: false,
      text: 'Technicians Rating',
      fontSize: 16
    },
    legend: {
      position: 'bottom',
      display: false
    },
    
    scales: {
      yAxes: [{
        barPercentage: 0.3,
        categoryPercentage: 0.5
      }],
      xAxes: [{
        ticks: {
          min: 0,
          max: 5,
        }
      }]
    }
  };
  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    this.loading = true;
    this.dashboardService.getTechniciansRating().subscribe(results => {

      this.data = {
        labels: [],
        datasets: [
          {
            data: [],
            label: 'Rating',
            backgroundColor: '#913b3b',
            borderColor: '#1E88E5'
          },
        ]
      };

      for (let technician of results) {
        this.data.labels.push(technician.firstName + ' ' + (technician.lastName ? technician.lastName : ''));
        this.data.datasets[0].data.push(technician.rate);
      }

      this.loading = false;
    });
  }

}
