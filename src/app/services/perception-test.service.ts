import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Participant } from '../models/participant.model';
import { PerceptionTestProtocol } from '../schema/perception-test-protocol.schema';
import {
  ProtocolAction,
  ProtocolActionType,
} from '../schema/protocol-actions.schema';
import { sequence } from '@angular/animations';

export interface ProtocolStep {
  stepIndex: number;
  action: ProtocolAction;
}

@Injectable({
  providedIn: 'root',
})
export class PerceptionTestService {
  activeProtocol: PerceptionTestProtocol | null = null;
  stepCounter: number = 0;

  private participantSubject = new BehaviorSubject<Participant | null>(null);
  participant$: Observable<Participant | null> =
    this.participantSubject.asObservable();

  private activeProtocolSubject =
    new BehaviorSubject<PerceptionTestProtocol | null>(null);
  activeProtocol$: Observable<PerceptionTestProtocol | null> =
    this.activeProtocolSubject.asObservable();

  private currentStepSubject = new BehaviorSubject<ProtocolStep | null>(null);
  currentStep$: Observable<ProtocolStep | null> =
    this.currentStepSubject.asObservable();

  private currentStepIndex = -1;

  constructor() {
    // WIP REMOVE
    console.log(
      this.loadProtocol(
        JSON.parse(`{
      "id": "2024-speech-intelligibility-prelim",
      "name": "Preliminary Project #37 Intelligibility Test",
      "sequence": [
      {
          "type": "BREAK"
        },
        {
          "type": "REPEAT",
          "sequence": [
            {
              "type": "TRANSCRIPTION",
              "label": "lecture_2m_0db",
              "audioFilePool": ["/Users/wjin/Documents/uoa/p4p/SPANZ_BKB_List_5_16.wav"],
              "volumeCalibrationKey": "lecture"
            }
          ],
          "count": 3
        },
        {
          "type": "BREAK"
        }
      ]
    }
    `)
      )
    );
  }

  WIP_getCalibrationKeys() {
    return ['lecture', 'seminar', 'neon'];
  }

  private validateActionSequence(
    sequence: ProtocolAction[]
  ): { success: true } | { success: false; reason: string } {
    // Verify if all calibration keys are present
    const calibrationKeys = this.WIP_getCalibrationKeys();
    for (const protocolStep of sequence) {
      if (
        protocolStep.action == ProtocolActionType.TRANSCRIPTION &&
        !calibrationKeys.includes(protocolStep.volumeCalibrationKey)
      ) {
        return {
          success: false,
          reason: `Unrecognised volume calibration key: '${protocolStep.volumeCalibrationKey}'.`,
        };
      } else if (protocolStep.action == ProtocolActionType.REPEAT) {
        const result = this.validateActionSequence(protocolStep.sequence);
        if (!result.success) {
          return result;
        }
      }
    }
    return { success: true };
  }

  loadProtocol(rawProtocolJson: any) {
    const parseResult = PerceptionTestProtocol.safeParse(rawProtocolJson);
    if (!parseResult.success) {
      return {
        success: false,
        reason: 'Invalid perception test protocol format.',
      };
    }

    const actionSequenceValidationResult = this.validateActionSequence(
      parseResult.data.sequence
    );

    if (!actionSequenceValidationResult.success) {
      return { success: false, reason: actionSequenceValidationResult.reason };
    }

    // Expand repetitions into linear list
    let newSeq: ProtocolAction[] = [];
    for (const step of parseResult.data.sequence) {
      if (step.type == ProtocolActionType.REPEAT) {
        for (let i = 0; i < step.count; i++) {
          newSeq = newSeq.concat(step.sequence);
        }
      } else {
        newSeq.push(step);
      }
    }

    if (newSeq.length == 0) {
      return {
        success: false,
        reason: 'A protocol must at least have 1 step.',
      };
    }

    const protocol: PerceptionTestProtocol = {
      id: parseResult.data.id,
      name: parseResult.data.name,
      sequence: newSeq as [ProtocolAction, ...ProtocolAction[]],
    };

    this.activeProtocolSubject.next(protocol);
    this.resetStepIndex();
    console.log(protocol);
    return { success: true };
  }

  clearProtocol() {
    this.activeProtocolSubject.next(null);
  }

  recordProtocolStep(stepData: any) {
    console.warn(`STUBBING WRITE WITH STEP DATA:`, stepData);
  }

  advanceProtocolStep() {
    // Advance internal counter.
    this.currentStepIndex++;

    // Get the next protocol step
    let protocol = this.activeProtocolSubject.getValue();
    let currentStep;
    if (protocol && this.currentStepIndex < protocol.sequence.length) {
      currentStep = {
        action: protocol.sequence[this.currentStepIndex],
        stepIndex: this.currentStepIndex,
      } as ProtocolStep;
    } else {
      currentStep = null;
    }

    // Notify others
    this.currentStepSubject.next(currentStep);
  }

  setParticipant(newParticipantValue: Participant | null) {
    this.participantSubject.next(newParticipantValue);
  }

  resetStepIndex() {
    this.currentStepIndex = -1;
    this.advanceProtocolStep();
  }
}
