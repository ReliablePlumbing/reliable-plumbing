import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { getCustomerFullName } from '../../utils/call-helpers';
import { AppointmentStatus } from '../../models/enums';
import { buildImagesObjectsForLightBox } from '../../utils/files-helpers';

@Component({
  selector: 'call-details',
  templateUrl: './call-details.component.html',
  styleUrls: ['./call-details.component.scss']
})
export class CallDetailsComponent implements OnInit, OnChanges {

  @Input() call;
  mappedCall;
  isReadOnly

  constructor() { }

  ngOnInit() {
    this.mappedCall = this.mapCall(this.call);
  }

  ngOnChanges() {
    this.mappedCall = this.mapCall(this.call);
  }


  mapCall(call) {
    let user = call.user ? call.user : call.customerInfo;
    return {
      customerName: getCustomerFullName(call),
      date: call.date,
      address: this.getAddress(call),
      email: user.email,
      mobile: user.mobile,
      status: { id: call.status, text: AppointmentStatus[call.status] },
      images: buildImagesObjectsForLightBox(call.id, call.relatedFileNames),
      assignees: !this.isReadOnly ? [] : this.mapTechnicians(call.assignees),
      message: call.message,
      quotes: call.quotes
    }
  }

  mapTechnicians(technicians) {
    let mappedTechs;

    mappedTechs = technicians.map(tech => {
      return {
        technician: this.isReadOnly ? tech : tech.technician,
        status: this.isReadOnly ? null : tech.status,
        appointments: this.isReadOnly ? null : tech.appointments.map(call => this.mappedCall(call)),
      }
    });

    if (!this.isReadOnly) {
      for (let tech of mappedTechs) {
        for (let assigneeId of this.call.assigneeIds)
          if (assigneeId == tech.technician.id) {
            this.mappedCall.assignees.push(tech);
            tech.selected = true;
          }
      }
      mappedTechs = mappedTechs.filter(tech => !tech.selected)
    }
    return mappedTechs;
  }


  getAddress(call) {
    let address = call.user ? call.user.sites.find(x => x.id == call.siteId) : call.customerInfo;

    return address.street + ' - ' + address.city + ' - ' + address.state;
  }
}
