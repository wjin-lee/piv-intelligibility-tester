import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

const MINIMUM_BREAK_TIMEOUT = 1000;

@Component({
  selector: 'app-break',
  standalone: true,
  imports: [],
  templateUrl: './break.component.html',
  styleUrl: './break.component.css',
})
export class BreakComponent {
  @Output() onValidityChange = new EventEmitter<boolean>();

  ngAfterViewInit() {
    setTimeout(() => {
      this.onValidityChange.emit(true);
    }, MINIMUM_BREAK_TIMEOUT);
  }
}
