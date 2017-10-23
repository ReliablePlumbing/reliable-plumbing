import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader/loader.component';
import { MultiSelectDatepickerComponent } from './multi-select-datepicker/multi-select-datepicker.component';
import { InputNumberDirective } from './directives/input-number.directive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

let components = [LoaderComponent, InputNumberDirective, MultiSelectDatepickerComponent]

@NgModule({
  imports: [
    CommonModule, FormsModule, NgbModule
  ],
  declarations: components,
  exports: components
})
export class SharedModule { }
