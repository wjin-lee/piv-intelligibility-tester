import { Component } from '@angular/core';
import { getVersion, getTauriVersion } from '@tauri-apps/api/app';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmSeparatorDirective } from '@spartan-ng/ui-separator-helm';
import { BrnSeparatorComponent } from '@spartan-ng/ui-separator-brain';
import { lucideAperture, lucideSettings } from '@ng-icons/lucide';

import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    HlmButtonDirective,
    HlmSeparatorDirective,
    BrnSeparatorComponent,
    HlmIconComponent,
  ],
  providers: [provideIcons({ lucideSettings, lucideAperture })],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  appVersion = 'UNKNOWN';
  tauriVersion = 'UNKNOWN';

  constructor() {
    // Retrieve application metadata
    getVersion().then((version) => {
      console.log('HELLO');
      this.appVersion = version;
    });

    getTauriVersion().then((version) => {
      this.tauriVersion = version;
    });
  }

  getVersion() {}
}
