import { z } from 'zod';

export enum ProtocolActionType {
  TRANSCRIPTION_POOL = 'TRANSCRIPTION_POOL',
  TRANSCRIPTION = 'TRANSCRIPTION',
  RANDOMISE = 'RANDOMISE',
  BREAK = 'BREAK',
}

export const ProtocolActionBreak = z.object({
  type: z.literal(ProtocolActionType.BREAK),
});

export const ProtocolActionTranscriptionPool = z.object({
  type: z.literal(ProtocolActionType.TRANSCRIPTION_POOL),
  label: z.string(),
  audioFilePool: z.string().array().nonempty(),
  volumeCalibrationKey: z.string(),
});

export const ProtocolActionTranscription = z.object({
  type: z.literal(ProtocolActionType.TRANSCRIPTION),
  label: z.string(),
  audioFilePath: z.string(),
  volumeCalibrationKey: z.string(),
});

// ZodTypeAny is a placeholder we require to avoid the circular reference.
export const ProtocolActionRandomise: z.ZodTypeAny = z.lazy(() =>
  z.object({
    type: z.literal(ProtocolActionType.RANDOMISE),
    sequence: ProtocolAction.array().nonempty(),
  })
);

export const ProtocolAction = z.union([
  ProtocolActionRandomise,
  ProtocolActionBreak,
  ProtocolActionTranscription,
  ProtocolActionTranscriptionPool,
]);

export type ProtocolAction = z.infer<typeof ProtocolAction>;
