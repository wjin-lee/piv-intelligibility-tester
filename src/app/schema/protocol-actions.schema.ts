import { z } from 'zod';

export enum ProtocolActionType {
  TRANSCRIPTION = 'TRANSCRIPTION',
  REPEAT = 'REPEAT',
  BREAK = 'BREAK',
}

export const ProtocolActionBreak = z.object({
  action: z.literal(ProtocolActionType.BREAK),
});

export const ProtocolActionTranscription = z.object({
  action: z.literal(ProtocolActionType.TRANSCRIPTION),
  label: z.string(),
  audioFilePool: z.string().array().nonempty(),
  volumeCalibrationKey: z.string(),
});

// ZodTypeAny is a placeholder we require to avoid the circular reference.
export const ProtocolActionRepeat: z.ZodTypeAny = z.lazy(() =>
  z.object({
    action: z.literal(ProtocolActionType.REPEAT),
    sequence: ProtocolAction.array().nonempty(),
    count: z.number(),
  })
);

export const ProtocolAction = z.union([
  ProtocolActionRepeat,
  ProtocolActionBreak,
  ProtocolActionTranscription,
]);

export type ProtocolAction = z.infer<typeof ProtocolAction>;
