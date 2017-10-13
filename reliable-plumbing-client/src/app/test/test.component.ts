import { Component, OnInit } from '@angular/core';
import { TestService } from './test.service';

@Component({
  selector: 'rb-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  constructor(private testService: TestService) { }

  ngOnInit() {
  }

  validate() {
    this.testService.validateToken().subscribe(result => {
      console.log(result);
    });
  }
}
