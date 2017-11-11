import { Directive, HostListener, Input } from '@angular/core'
import { NgControl } from '@angular/forms'

@Directive({
    selector: '[ngModel][charsReplace]',
    host: {
     //   '(ngModelChange)': 'onInputChange($event)',
        '(blur)': 'onBlur($event)',
    }
})
export class ModelCharsReplaceDirective {

    @Input('charsReplace') charsReplace;
    control: NgControl;
    constructor(control: NgControl) {
        this.control = control
    }


    onBlur() {
        let val = this.control.value;
        let raw = val.replace(this.charsReplace, '')

        this.control.viewToModelUpdate(raw)
    }

    // onInputChange(val) {
    //     if (val == null) return;
    //     let raw = val.replace(this.charsReplace, '')
    //     if (val !== raw)
    //         this.control.viewToModelUpdate(raw)
    // }
}