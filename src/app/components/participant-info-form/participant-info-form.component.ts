import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmFormFieldModule } from '@spartan-ng/ui-formfield-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import {
  BrnRadioComponent,
  BrnRadioGroupComponent,
} from '@spartan-ng/ui-radiogroup-brain';
import {
  HlmRadioDirective,
  HlmRadioGroupDirective,
  HlmRadioIndicatorComponent,
} from '@spartan-ng/ui-radiogroup-helm';
import { Participant } from '../../models/participant.model';

@Component({
  selector: 'app-participant-info-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HlmInputDirective,
    HlmFormFieldModule,
    BrnRadioGroupComponent,
    BrnRadioComponent,
    HlmRadioIndicatorComponent,
    HlmRadioDirective,
    HlmRadioGroupDirective,
    HlmButtonDirective,
  ],
  templateUrl: './participant-info-form.component.html',
  styleUrl: './participant-info-form.component.css',
})
export class ParticipantInfoFormComponent {
  @Output() onParticipantSubmit = new EventEmitter<Participant>();

  participantInfo = new FormGroup({
    participantId: new FormControl('', Validators.required),
    nativeness: new FormControl('L1', Validators.required),
  });

  onSubmit() {
    if (
      this.participantInfo.valid &&
      typeof this.participantInfo.value.participantId == 'string'
    ) {
      this.onParticipantSubmit.emit(
        new Participant(
          this.participantInfo.value.participantId,
          this.participantInfo.value.nativeness == 'L1'
        )
      );
    }
  }
}
