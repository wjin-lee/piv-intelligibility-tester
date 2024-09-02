import { z } from 'zod';
import { ProtocolAction } from './protocol-actions.schema';

export const PerceptionTestProtocol = z.object({
  id: z.string(),
  name: z.string(),
  sequence: ProtocolAction.array().nonempty(),
});

export type PerceptionTestProtocol = z.infer<typeof PerceptionTestProtocol>;
