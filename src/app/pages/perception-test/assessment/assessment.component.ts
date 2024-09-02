import { Component, ElementRef, viewChild } from '@angular/core';
import {
  PerceptionTestService,
  ProtocolStep,
} from '../../../services/perception-test.service';
import { invoke } from '@tauri-apps/api/core';
import {
  ProtocolAction,
  ProtocolActionTranscription,
  ProtocolActionType,
} from '../../../schema/protocol-actions.schema';
import { TranscriptionComponent } from '../../../components/transcription/transcription.component';
import { CommonModule, NgIf } from '@angular/common';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconModule, provideIcons } from '@spartan-ng/ui-icon-helm';
import { lucideChevronsRight } from '@ng-icons/lucide';

@Component({
  selector: 'app-assessment',
  standalone: true,
  imports: [
    TranscriptionComponent,
    CommonModule,
    HlmButtonDirective,
    HlmIconModule,
  ],
  providers: [provideIcons({ lucideChevronsRight })],
  templateUrl: './assessment.component.html',
  styleUrl: './assessment.component.css',
})
export class AssessmentComponent {
  currentStep: ProtocolStep | null = null;
  totalSteps: number = 0;

  isPlayingAudio = false;
  playbackWarningOverlayText = '';

  isStepContentValid = false;

  transcriptionComponentRef =
    viewChild<TranscriptionComponent>('transcription');

  constructor(private perceptionTestService: PerceptionTestService) {
    this.perceptionTestService.activeProtocol$.subscribe((protocol) => {
      this.totalSteps = protocol?.sequence.length || 0;
    });

    // Run actions on step update
    this.perceptionTestService.currentStep$.subscribe((step) => {
      this.currentStep = step;

      switch (step?.action.type) {
        case ProtocolActionType.TRANSCRIPTION:
          this.playAudio(step.action.audioFilePool[0]);
          break;

        default:
          console.error('Continue pressed with invalid protocol action type.');
      }
    });
  }

  onContinue() {
    switch (this.currentStep?.action.type) {
      case ProtocolActionType.TRANSCRIPTION:
        const transcriptionRef = this.transcriptionComponentRef();
        if (transcriptionRef !== undefined) {
          const transcriptFormResult = transcriptionRef.getFormState();
          console.log(transcriptFormResult);

          transcriptionRef.resetInputs();
        }
        break;

      default:
        console.error('Continue pressed with invalid protocol action type.');
    }
    this.perceptionTestService.advanceProtocolStep();
  }

  onStepContentValidityChange(isStepContentValid: boolean) {
    this.isStepContentValid = isStepContentValid;
  }

  playAudio(url: string) {
    if (this.isPlayingAudio) {
      return;
    }

    console.log(`Play request: ${url}`);

    // Initiate countdown
    this.isPlayingAudio = true;
    this.playbackWarningOverlayText = '3';
    setTimeout(() => {
      this.playbackWarningOverlayText = '2';
    }, 1000);
    setTimeout(() => {
      this.playbackWarningOverlayText = '1';
    }, 2000);
    setTimeout(() => {
      this.playbackWarningOverlayText = 'LISTEN!';
      // Invoke the backend to play multichannel audio file.
      invoke('play_wav_file', {
        filePath: url,
      })
        .then(() => {
          console.log('Finished playing audio clip!');
          const transcriptionRef = this.transcriptionComponentRef();
          if (transcriptionRef !== undefined) {
            transcriptionRef.focusTranscriptionInput();
          }
        })
        .catch((err) => {
          console.log('ERRORED!');
          console.log(err);
        })
        .finally(() => {
          this.isPlayingAudio = false;
        });
    }, 3000);
  }

  /**
   * Passthrough to template
   */
  public get ProtocolActionType() {
    return ProtocolActionType;
  }
}
