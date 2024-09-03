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
import { SettingsService } from '../../../services/settings.service';
import { join } from '@tauri-apps/api/path';

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
  audioFileBaseDir: string = '/';

  isPlayingAudio = false;
  playbackWarningOverlayText = '';
  playbackEndTime: string = 'N/A';

  isStepContentValid = false;

  transcriptionComponentRef =
    viewChild<TranscriptionComponent>('transcription');

  constructor(
    private perceptionTestService: PerceptionTestService,
    private settingsService: SettingsService
  ) {
    this.perceptionTestService.activeProtocol$.subscribe((protocol) => {
      this.totalSteps = protocol?.sequence.length || 0;
      this.audioFileBaseDir = protocol?.audioFileBaseDir || '/';
    });

    // Run actions on step update
    this.perceptionTestService.currentStep$.subscribe((step) => {
      this.currentStep = step;

      switch (step?.action.type) {
        case ProtocolActionType.TRANSCRIPTION:
          const calibrationMap = this.settingsService.getCalibrationMap();
          const requiredAdjustment =
            this.settingsService.desiredNoiseDecibels -
            calibrationMap[step.action.volumeCalibrationKey];
          join(this.audioFileBaseDir, step.action.audioFilePath)
            .then((filepath) => {
              this.playAudio(filepath, requiredAdjustment);
            })
            .catch(() => {
              // TODO: Error Toast
            });

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
          this.perceptionTestService.recordTranscriptionResult(
            this.playbackEndTime,
            new Date().toISOString(),
            this.currentStep.stepIndex + 1,
            this.currentStep.action.label,
            this.currentStep.action.audioFilePath,
            transcriptFormResult.transcription || '',
            transcriptFormResult.intelligibilityScore
          );

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

  playAudio(url: string, decibelAdjustment: number) {
    if (this.isPlayingAudio) {
      return;
    }

    console.log(`Play request: ${url} with ${decibelAdjustment} adjustment.`);

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
        decibelAdjustment: decibelAdjustment,
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
          this.playbackEndTime = new Date().toISOString();
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
