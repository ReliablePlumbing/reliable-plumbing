import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  @Input() text;

  constructor() { }

  ngOnInit() {
    $('.bb').fadeToggle(200);
    $('.message').toggleClass('comein');
    $('.check').toggleClass('scaledown');
  }

}
