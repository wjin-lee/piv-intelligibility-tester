import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-calibration',
  standalone: true,
  imports: [
    HlmInputDirective,
    HlmButtonDirective,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './calibration.component.html',
  styleUrl: './calibration.component.css',
})
export class CalibrationComponent {
  speakerIndexFormControl = new FormControl(1);

  playTestTone() {
    if (
      this.speakerIndexFormControl.value &&
      this.speakerIndexFormControl.value > 0
    ) {
      console.log(
        `Playing test tone on speaker ${this.speakerIndexFormControl.value}`
      );
      invoke('play_test_tone', {
        speakerIndex: this.speakerIndexFormControl.value - 1,
      })
        .then(() => {
          console.log('Finished playing test tone!');
        })
        .catch((err: any) => {
          toast.error('Failed to play test tone. (See console for details).');
          console.error(err);
        });
    }
  }
}
