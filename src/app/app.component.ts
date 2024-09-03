import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HlmToasterComponent } from '@spartan-ng/ui-sonner-helm';
import { invoke } from '@tauri-apps/api/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HlmToasterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'piv-intelligibility-tester';

  // Prevents back navigation when pressing on the backspace button.
  // See https://github.com/r0x0r/pywebview/issues/102 and https://stackoverflow.com/questions/49402985
  @HostListener('document:keydown', ['$event'])
  onKeyDown(evt: KeyboardEvent) {
    if (evt.keyCode === 8 || evt.which === 8) {
      let doPrevent = true;
      const types = [
        'text',
        'password',
        'file',
        'search',
        'email',
        'number',
        'date',
        'color',
        'datetime',
        'datetime-local',
        'month',
        'range',
        'search',
        'tel',
        'time',
        'url',
        'week',
      ];
      const target = <HTMLInputElement>evt.target;

      const disabled =
        target.disabled || (<HTMLInputElement>event?.target).readOnly;
      if (!disabled) {
        if (target.isContentEditable) {
          doPrevent = false;
        } else if (target.nodeName === 'INPUT') {
          let type = target.type;
          if (type) {
            type = type.toLowerCase();
          }
          if (types.indexOf(type) > -1) {
            doPrevent = false;
          }
        } else if (target.nodeName === 'TEXTAREA') {
          doPrevent = false;
        }
      }
      if (doPrevent) {
        evt.preventDefault();
        return false;
      }
    }

    return true;
  }

  constructor() {}
}
