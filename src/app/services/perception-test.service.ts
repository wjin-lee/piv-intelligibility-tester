import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Participant } from '../models/participant.model';
import { PerceptionTestProtocol } from '../schema/perception-test-protocol.schema';
import {
  ProtocolAction,
  ProtocolActionType,
} from '../schema/protocol-actions.schema';
import {
  exists,
  BaseDirectory,
  writeTextFile,
  mkdir,
} from '@tauri-apps/plugin-fs';
import Papa from 'papaparse';
import hash from 'fnv1a';
import { shuffleArrayInplace } from './utils';
import { SettingsService } from './settings.service';

export interface ProtocolStep {
  stepIndex: number;
  action: ProtocolAction;
}

const CSV_HEADERS = [
  'timestamp',
  'label',
  'filepath',
  'transcript',
  'intelligibility_score',
];

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

  constructor(private settingsService: SettingsService) {}

  private validateActionSequence(
    sequence: ProtocolAction[]
  ): { success: true } | { success: false; reason: string } {
    // Verify if all calibration keys are present
    const calibrationKeys = this.settingsService.getCalibrationMap();
    for (const protocolStep of sequence) {
      if (
        protocolStep.action == ProtocolActionType.TRANSCRIPTION &&
        !(protocolStep.volumeCalibrationKey in calibrationKeys)
      ) {
        return {
          success: false,
          reason: `Unrecognised volume calibration key: '${protocolStep.volumeCalibrationKey}'.`,
        };
      } else if (protocolStep.action == ProtocolActionType.RANDOMISE) {
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

    // Get seeded random ordering of the transcriptions which is deterministic to each participant id.
    shuffleArrayInplace(
      parseResult.data.sequence,
      hash(this.participantSubject.getValue()!.id)
    );

    // Expand repetitions into linear list
    let newSeq: ProtocolAction[] = [];
    let stepCount = 0;
    for (const step of parseResult.data.sequence) {
      if (step.type == ProtocolActionType.TRANSCRIPTION_POOL) {
        for (const audioFilePath of step.audioFilePool) {
          newSeq = newSeq.concat({
            type: ProtocolActionType.TRANSCRIPTION,
            label: step.label,
            audioFilePath: audioFilePath,
            volumeCalibrationKey: step.volumeCalibrationKey,
          });
        }
      } else {
        newSeq.push(step);
      }
      stepCount++;
      if (stepCount == 1) {
        newSeq.push({
          type: 'BREAK',
        });
        stepCount = 0;
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
      audioFileBaseDir: parseResult.data.audioFileBaseDir,
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

  async recordTranscriptionResult(
    label: string,
    wav_filepath: string,
    transcript: string,
    intelligibilityScore: number
  ) {
    const participant = this.participantSubject.getValue();
    if (participant === null) {
      throw Error('Cannot record transcription for null participant!');
    }

    const resultsPath = `ASIST/${participant.isNative ? 'L1' : 'L2'}-${
      participant.id
    }.csv`;
    const csvExists = await exists(resultsPath, {
      baseDir: BaseDirectory.Document,
    });
    if (!csvExists) {
      // Create directories if they don't exist
      const dirExists = await exists('ASIST', {
        baseDir: BaseDirectory.Document,
      });
      if (!dirExists) {
        await mkdir('ASIST', {
          baseDir: BaseDirectory.Document,
        });
      }

      // Create a new CSV file with headers
      const headerLine = CSV_HEADERS.join(',') + '\n';
      await writeTextFile(resultsPath, headerLine, {
        baseDir: BaseDirectory.Document,
      });
    }

    console.log([
      new Date().toISOString(),
      label,
      wav_filepath,
      transcript,
      intelligibilityScore,
    ]);

    // Append the new row to the CSV file
    const rowLine =
      Papa.unparse(
        [
          [
            new Date().toISOString(),
            label,
            wav_filepath,
            transcript,
            intelligibilityScore,
          ],
        ],
        { header: false }
      ) + '\n';

    await writeTextFile(resultsPath, rowLine, {
      baseDir: BaseDirectory.Document,
      append: true,
    });

    console.log('File updated successfully.');
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
