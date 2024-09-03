import { AsyncPipe, NgIf } from '@angular/common';
import { Component, ElementRef, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideAudioLines,
  lucideChevronsLeft,
  lucideUpload,
} from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { ParticipantInfoFormComponent } from '../../components/participant-info-form/participant-info-form.component';
import { Participant } from '../../models/participant.model';
import { PerceptionTestProtocol } from '../../schema/perception-test-protocol.schema';
import { PerceptionTestService } from '../../services/perception-test.service';

@Component({
  selector: 'app-perception-test',
  standalone: true,
  imports: [
    HlmButtonDirective,
    HlmIconComponent,
    RouterLink,
    NgIf,
    AsyncPipe,
    ParticipantInfoFormComponent,
  ],
  providers: [
    provideIcons({ lucideChevronsLeft, lucideUpload, lucideAudioLines }),
  ],
  templateUrl: './perception-test.component.html',
  styleUrl: './perception-test.component.css',
})
export class PerceptionTestComponent {
  protocolFileInputRef =
    viewChild<ElementRef<HTMLInputElement>>('protocolFile');

  participant: Participant | null = null;
  activeProtocol: PerceptionTestProtocol | null = null;

  constructor(
    private perceptionTestService: PerceptionTestService,
    private router: Router
  ) {
    this.perceptionTestService.activeProtocol$.subscribe((newProtocol) => {
      this.activeProtocol = newProtocol;
    });

    this.perceptionTestService.participant$.subscribe((newParticipant) => {
      this.participant = newParticipant;
    });
  }

  onBack() {
    if (this.activeProtocol) {
      this.perceptionTestService.clearProtocol();

      const protocolFileInputRef = this.protocolFileInputRef();
      if (protocolFileInputRef !== undefined) {
        protocolFileInputRef.nativeElement.value = '';
      }
    } else if (this.participant) {
      this.perceptionTestService.setParticipant(null);
    } else {
      this.router.navigate(['landing']);
    }
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

  onParticipantSubmit(participant: Participant) {
    console.log('Setting participant:', participant);
    this.perceptionTestService.setParticipant(participant);
  }
}
