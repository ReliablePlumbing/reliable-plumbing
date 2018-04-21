import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { LookupsService } from '../../services/lookups.service';

@Component({
  selector: 'rb-quote-quick-add',
  templateUrl: './quote-quick-add.component.html',
  styleUrls: ['./quote-quick-add.component.scss']
})
export class QuoteQuickAddComponent implements OnInit {

  form: FormGroup;
  services;
  quote = {
    typeId: '-1',
    message: null
  }
  trySubmit = false;
  images = [];
  @Output() submitted: EventEmitter<any> = new EventEmitter<any>();
  @Output() close: EventEmitter<any> = new EventEmitter<any>();

  constructor(private fb: FormBuilder, private lookupsService: LookupsService) { }

  ngOnInit() {
    this.getLookups();
    this.form = this.fb.group({
      service: [null, this.validateDropdownRequired],
      desc: [null]
    });
  }

  validateDropdownRequired(control: AbstractControl) {
    let value = control.value;

    return value != null && value != '-1' ? null : { req: true };
  }

  getLookups() {
    this.lookupsService.getAppointmentSettingsAndTypes()
      .subscribe(results => this.services = results.types);
  }

  getControlValidation(controlName, errorName, beforeSubmit = true) {
    if (this.form == null)
      return false;

    let control = this.form.controls[controlName];

    return (beforeSubmit || this.trySubmit) && !control.valid && control.hasError(errorName);
  }

  onUploadFile(files) {
    for (let file of files.files)
      this.images.push({ file: file, source: file.objectURL, alt: 'image' + (this.images.length + 1), title: 'image' + (this.images.length + 1) });
  }

  removeAllImages = () => this.images = [];

  save() {
    this.trySubmit = true;
    if (this.form.invalid)
      return;

    this.submitted.emit({
      obj: this.quote,
      images: this.images.map(img => img.file)
    });
  }

  resetForm() {
    this.quote.typeId = '-1';
    this.quote.message = null;
    this.images = [];
  }
}
