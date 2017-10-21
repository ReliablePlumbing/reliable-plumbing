import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader/loader.component';
import { InputNumberDirective } from './directives/input-number.directive';

let components = [LoaderComponent, InputNumberDirective]

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: components,
  exports: components
})
export class SharedModule { }
