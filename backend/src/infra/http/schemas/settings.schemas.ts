import { z } from 'zod';

export const UpdateSettingsBodySchema = z.object({
  phone: z.string().min(1),
});
