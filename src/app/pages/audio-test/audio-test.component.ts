import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'ngx-sonner';
import { SettingsService } from '../../services/settings.service';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-audio-test',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    HlmInputDirective,
    HlmButtonDirective,
  ],
  templateUrl: './audio-test.component.html',
  styleUrl: './audio-test.component.css',
})
export class AudioTestComponent {
  isPlayingAudio = false;
  urlFormControl = new FormControl('');
  calibrationKeyFormControl = new FormControl('');

  constructor(private settingsService: SettingsService) {}

  play() {
    const calibrationMap = this.settingsService.getCalibrationMap();
    if (!((this.calibrationKeyFormControl.value || '') in calibrationMap)) {
      toast.error('Invalid calibration map!');
      return;
    }

    const requiredAdjustment =
      this.settingsService.desiredNoiseDecibels -
      calibrationMap[this.calibrationKeyFormControl.value || ''];

    this.playAudio(this.urlFormControl.value || '', requiredAdjustment);
  }

  playAudio(url: string, decibelAdjustment: number) {
    if (this.isPlayingAudio) {
      return;
    }

    console.log(`Play request: ${url} with ${decibelAdjustment} adjustment.`);

    // Initiate countdown
    this.isPlayingAudio = true;
    // Invoke the backend to play multichannel audio file.
    invoke('play_wav_file', {
      filePath: url,
      decibelAdjustment: decibelAdjustment,
    })
      .then(() => {
        toast('Done!');
      })
      .catch((err) => {
        toast.error('Could not play audio file! (See console for details)');
        console.log(err);
      })
      .finally(() => {
        this.isPlayingAudio = false;
      });
  }
}
