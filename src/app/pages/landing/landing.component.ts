import { Component } from '@angular/core';
import { lucideEar, lucideSettings } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { BrnSeparatorComponent } from '@spartan-ng/ui-separator-brain';
import { HlmSeparatorDirective } from '@spartan-ng/ui-separator-helm';
import { getTauriVersion, getVersion } from '@tauri-apps/api/app';

import { RouterLink } from '@angular/router';
import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    HlmButtonDirective,
    HlmSeparatorDirective,
    BrnSeparatorComponent,
    HlmIconComponent,
    RouterLink,
  ],
  providers: [provideIcons({ lucideSettings, lucideEar })],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  appVersion = 'UNKNOWN';
  tauriVersion = 'UNKNOWN';

  constructor() {
    // Retrieve application metadata
    getVersion().then((version) => {
      this.appVersion = version;
    });

    getTauriVersion().then((version) => {
      this.tauriVersion = version;
    });
  }
}
