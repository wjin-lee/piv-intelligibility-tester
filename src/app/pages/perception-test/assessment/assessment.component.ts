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
import { BreakComponent } from '../../../components/break/break.component';

const AUDIO_COUNTDOWN_INTERVAL = 750;

@Component({
  selector: 'app-assessment',
  standalone: true,
  imports: [
    TranscriptionComponent,
    CommonModule,
    HlmButtonDirective,
    HlmIconModule,
    BreakComponent,
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

        case ProtocolActionType.BREAK:
          // TODO: Play jingle
          break;
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
    }
    this.perceptionTestService.advanceProtocolStep();
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.onContinue();
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
    }, AUDIO_COUNTDOWN_INTERVAL);
    setTimeout(() => {
      this.playbackWarningOverlayText = '1';
    }, AUDIO_COUNTDOWN_INTERVAL * 2);
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
    }, AUDIO_COUNTDOWN_INTERVAL * 3);
  }

  /**
   * Passthrough to template
   */
  public get ProtocolActionType() {
    return ProtocolActionType;
  }
}
