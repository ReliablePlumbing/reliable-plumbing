import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'input[number]'
})
export class InputNumberDirective {

  constructor(private el: ElementRef) {
  }

  @Input('min-number') minNumber: number;
  @Input('max-number') maxNumber: number;

  @HostListener('keydown', ['$event']) onKeyDown(event) {
    let e = <KeyboardEvent>event;
    let newValue;
    // handle if text is selected
    let textLength = this.el.nativeElement.value.length;
    let selectionStart = this.el.nativeElement.selectionStart;
    let selectionEnd = this.el.nativeElement.selectionEnd;
    let firstPartition = this.el.nativeElement.value.substring(0, selectionStart);
    let lastPartition = this.el.nativeElement.value.substring(selectionEnd, textLength);

    if (
      // Allow: tab
      (e.keyCode == 9) ||
      // Allow: Ctrl+A
      (e.keyCode == 65 && e.ctrlKey === true) ||
      // Allow: Ctrl+C
      (e.keyCode == 67 && e.ctrlKey === true) ||
      // Allow: Ctrl+X
      (e.keyCode == 88 && e.ctrlKey === true) ||
      // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)) {
      return;
    }
    else if (e.keyCode == 46 || //Allow: Delete
      // Allow: Backspace      
      e.keyCode == 8) {
      if (selectionStart != selectionEnd)
        newValue = firstPartition.concat(lastPartition);
      else if (e.keyCode == 8)
        newValue = firstPartition.substring(0, firstPartition.length - 1).concat(lastPartition);
      else if (e.keyCode == 46)
        newValue = firstPartition.concat(lastPartition.substring(1, lastPartition.length));
    }
    else {
      newValue = firstPartition.concat(e.key);
      newValue = newValue.concat(lastPartition);
    }

    if (newValue == "" || (this.minNumber != null && this.minNumber < 0 && newValue == "-")) {
      return;
    }
    if (newValue == "-")
      e.preventDefault();

    let numNewValue = Number(newValue);
    if (numNewValue == null && numNewValue !== 0) {
      e.preventDefault();
    }

    if (this.minNumber !== undefined) {
      if (numNewValue != null && numNewValue < this.minNumber)
        e.preventDefault();
    }
    if (this.maxNumber !== undefined) {
      if (numNewValue != null && numNewValue > this.maxNumber)
        e.preventDefault();
    }
    // Disable multiple points
    // if (this.el.nativeElement.value.indexOf('.') !== -1 &&
    //   e.keyCode == 110)
    //   e.preventDefault();
    if (e.keyCode == 110 ||
      // Allow: Dot      
      e.keyCode == 190 ||
      // Allow: Backspace
      e.keyCode == 8 ||
      // Allow: Delete
      e.keyCode == 46 ||
      //Allow: Minus
      e.keyCode == 109 || e.keyCode == 189) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  }

  // @HostListener('click', ['$event']) onClick(event) {
  //   console.log(event);
  // }
  // @HostListener('rightClick', ['$event']) onRightClick(event) {
  //   console.log(event);
  // }
}

