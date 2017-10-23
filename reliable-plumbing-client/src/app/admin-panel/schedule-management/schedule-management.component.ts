import { Component, OnInit } from '@angular/core';
import { AppointmentStatus } from '../../models/enums';
import { LookupsService, AppointmentService } from '../../services/services.exports';
import { getTimeArray, getEnumEntries } from '../../utils/helpers';

@Component({
  selector: 'rb-schedule-management',
  templateUrl: './schedule-management.component.html',
  styleUrls: ['./schedule-management.component.scss']
})
export class ScheduleManagementComponent implements OnInit {


  loading: boolean = true;
  filters: {
    date: {
      from: { day: number, month: number, year: number },
      to: { day: number, month: number, year: number }
    },
    time: {
      from: { hour: number, minute: number },
      to: { hour: number, minute: number }
    },
    types: { id: string, text: string }[],
    status: { id: string, text: string }[]
  }

  lookups: {
    // times: any[],
    types: { id: string, text: string }[],
    status: any[]
  }
  constructor(private lookupsService: LookupsService, private appointmentService: AppointmentService) { }


  ngOnInit() {
    this.lookupsService.getAppointmentSettingsAndTypes().subscribe(results => {
      console.log(results);
      this.lookups = {
        // times: getTimeArray(results.settings.timeSpan, results.settings.workHours.from, results.settings.workHours.to),
        types: this.mapTypes(results.types),
        status: getEnumEntries(AppointmentStatus)
      };
      let nowDate = new Date();
      this.filters = {
        date: {
          from: { day: nowDate.getDate(), month: nowDate.getMonth() + 1, year: nowDate.getFullYear() },
          to: { day: nowDate.getDate(), month: nowDate.getMonth() + 2, year: nowDate.getFullYear() },
        },
        status: [{ id: AppointmentStatus.Pending.toString(), text: AppointmentStatus[AppointmentStatus.Pending] }],
        time: {
          from: { hour: results.settings.workHours.from.h, minute: results.settings.workHours.from.min },
          to: { hour: results.settings.workHours.to.h, minute: results.settings.workHours.to.min }
        },
        types: []
      }
      this.loading = false;
    });
  }

  mapTypes(types) {
    if (types == null)
      return [];

    let mappedTypes = [];
    for (let type of types) {
      mappedTypes.push({
        id: type.id,
        text: type.name
      });
    }

    return mappedTypes;
  }

  selected(item, items) {
    if (items == null)
      items = [];
    items.push(item);
  }

  removed(item, propName) {
    this.filters[propName] = this.filters[propName].filter(i => i.id != item.id);
  }

  filter() {
    let requestFilters = {
      date: {
        from: this.filters.date.from == null ? null : new Date(this.filters.date.from.year, this.filters.date.from.month - 1, this.filters.date.from.day),
        to: this.filters.date.to == null ? null : new Date(this.filters.date.to.year, this.filters.date.to.month - 1, this.filters.date.to.day),
      },
      time: {
        from: { h: this.filters.time.from.hour, min: this.filters.time.from.minute },
        to: { h: this.filters.time.to.hour, min: this.filters.time.to.minute }
      },
      status: [],
      typeIds: []
    }
    for (let status of this.filters.status)
      requestFilters.status.push(status.id);
    for (let type of this.filters.types)
      requestFilters.typeIds.push(type.id);

    this.appointmentService.getAppointmentsFiltered(requestFilters).subscribe(results => {
      console.log(results);
    })
  }
}
