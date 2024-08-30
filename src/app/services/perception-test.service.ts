import { Injectable } from '@angular/core';
import { PerceptionTestProtocol } from '../schema/perception-test-protocol.schema';
import {
  ProtocolAction,
  ProtocolActionType,
} from '../schema/protocol-actions.schema';

@Injectable({
  providedIn: 'root',
})
export class PerceptionTestService {
  activeProtocol: PerceptionTestProtocol | null = null;
  stepCounter: number = 0;

  constructor() {}

  WIP_getCalibrationKeys() {
    return ['lecture', 'seminar', 'neon'];
  }

  private validateActionSequence(
    sequence: ProtocolAction[]
  ): { success: true } | { success: false; reason: string } {
    // Verify if all calibration keys are present
    const calibrationKeys = this.WIP_getCalibrationKeys();
    console.log(calibrationKeys);
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

    return { success: true };
  }
}
