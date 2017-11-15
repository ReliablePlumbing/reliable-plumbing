import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { compareBootstrapDate } from '../../utils/date-helpers';

const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;


@Component({
  selector: 'multi-select-datepicker',
  templateUrl: './multi-select-datepicker.component.html',
  styleUrls: ['./multi-select-datepicker.component.scss']
})
export class MultiSelectDatepickerComponent {
  hoveredDate: NgbDateStruct;
  fromDate: NgbDateStruct;
  toDate: NgbDateStruct;

  @Input() dates: {
    from: { day: number, month: number, year: number },
    to: { day: number, month: number, year: number }
  }

  @Output() datesChanged: EventEmitter<any> = new EventEmitter<any>();

  constructor(private calendar: NgbCalendar) {
  }

  ngOnInit() {
    if (this.dates == null || this.dates.from == null || compareBootstrapDate(this.dates.from, this.dates.to) > 0) {
      this.fromDate = this.calendar.getToday();
      this.toDate = this.calendar.getNext(this.calendar.getToday(), 'd', 7);
    }
    else {
      this.fromDate = this.dates.from;
      this.toDate = this.dates.to;
    }
    // this
  }

  onDateChange(date: NgbDateStruct) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && after(date, this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }

    this.datesChanged.emit({
      from: this.fromDate,
      to: this.toDate
    })
  }

  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);

}
