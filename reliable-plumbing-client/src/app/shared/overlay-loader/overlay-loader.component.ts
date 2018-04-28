import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'overlay-loader',
  templateUrl: './overlay-loader.component.html',
  styleUrls: ['./overlay-loader.component.scss']
})
export class OverlayLoaderComponent implements OnInit {

  @Input() message;

  constructor() { }

  ngOnInit() {
  }

}
