import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  viewChild,
} from '@angular/core';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';
import { NgIf } from '@angular/common';
import { invoke } from '@tauri-apps/api/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  UntypedFormControl,
  Validators,
} from '@angular/forms';
import { HlmIconComponent, provideIcons } from '@spartan-ng/ui-icon-helm';
import { lucideFrown, lucideLaugh } from '@ng-icons/lucide';

@Component({
  selector: 'app-transcription',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HlmIconComponent,
    HlmInputDirective,
    NgxSliderModule,
    NgIf,
  ],
  providers: [provideIcons({ lucideFrown, lucideLaugh })],
  templateUrl: './transcription.component.html',
  styleUrl: './transcription.component.css',
})
export class TranscriptionComponent {
  @Output() onValidityChange = new EventEmitter<boolean>(false);

  INTELLIGIBILITY_SCORE_OPTIONS: Options = {
    showTicksValues: true,
    stepsArray: [
      { value: 0, legend: 'Very hard' },
      { value: 1 },
      { value: 2 },
      { value: 3, legend: 'Hard' },
      { value: 4 },
      { value: 5, legend: 'Okay' },
      { value: 6 },
      { value: 7, legend: 'Easy' },
      { value: 8 },
      { value: 9 },
      { value: 10, legend: 'Very Easy' },
    ],
  };
  transcriptionTextBoxRef = viewChild<ElementRef<HTMLTextAreaElement>>(
    'transcriptionTextBox'
  );

  transcriptionForm = new FormGroup({
    transcription: new FormControl('', Validators.required),
    intelligibilityScore: new UntypedFormControl(5, Validators.required),
  });

  constructor() {
    // Emit validity script
    setTimeout(() => {
      this.onValidityChange.emit(false);
      this.transcriptionForm.controls.transcription.valueChanges.subscribe(
        (value) => {
          this.onValidityChange.emit(!!value);
        }
      );
    }, 100);
  }

  focusTranscriptionInput() {
    const transcriptionTextBoxRef = this.transcriptionTextBoxRef();
    if (transcriptionTextBoxRef !== undefined) {
      transcriptionTextBoxRef.nativeElement.focus();
    }
  }

  resetInputs() {
    this.transcriptionForm.reset();
    this.transcriptionForm.controls.intelligibilityScore.setValue(5);
  }

  getFormState() {
    return {
      transcription: this.transcriptionForm.value.transcription,
      intelligibilityScore: this.transcriptionForm.value
        .intelligibilityScore as number,
    };
  }
}
