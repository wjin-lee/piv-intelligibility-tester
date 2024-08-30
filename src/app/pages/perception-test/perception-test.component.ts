import { AsyncPipe, NgIf } from '@angular/common';
import { Component, ElementRef, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideChevronsLeft, lucideUpload } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { PerceptionTestService } from '../../services/perception-test.service';
@Component({
  selector: 'app-perception-test',
  standalone: true,
  imports: [HlmButtonDirective, HlmIconComponent, RouterLink, NgIf, AsyncPipe],
  providers: [provideIcons({ lucideChevronsLeft, lucideUpload })],
  templateUrl: './perception-test.component.html',
  styleUrl: './perception-test.component.css',
})
export class PerceptionTestComponent {
  protocolFileInputRef =
    viewChild<ElementRef<HTMLInputElement>>('protocolFile');

  constructor(public perceptionTestService: PerceptionTestService) {}

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
