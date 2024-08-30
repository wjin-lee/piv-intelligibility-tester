import { Component, ElementRef, viewChild, ViewChild } from '@angular/core';
import { getVersion, getTauriVersion } from '@tauri-apps/api/app';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmSeparatorDirective } from '@spartan-ng/ui-separator-helm';
import { BrnSeparatorComponent } from '@spartan-ng/ui-separator-brain';
import { lucideAperture, lucideSettings } from '@ng-icons/lucide';

import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';
import { PerceptionTestService } from '../../services/perception-test.service';

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
  protocolFileInputRef =
    viewChild<ElementRef<HTMLInputElement>>('protocolFile');

  constructor(public perceptionTestService: PerceptionTestService) {
    // Retrieve application metadata
    getVersion().then((version) => {
      this.appVersion = version;
    });

    getTauriVersion().then((version) => {
      this.tauriVersion = version;
    });
  }

  promptFileSelection() {
    const protocolFileInputRef = this.protocolFileInputRef();
    if (protocolFileInputRef !== undefined) {
      protocolFileInputRef.nativeElement.click();
    } else {
      console.error(
        'Could not locate protocol file selection in DOM! Aborting protocol file selection.'
      );
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (_) => {
        try {
          let jsonData = JSON.parse(reader.result as string);
          console.log(jsonData);
          console.log(this.perceptionTestService.loadProtocol(jsonData));
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(file);
    }
  }
}
