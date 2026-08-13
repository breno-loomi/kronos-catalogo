import { z } from 'zod';

export const AdjustStockBodySchema = z
  .object({
    size: z.string().min(1),
    delta: z.number().int().optional(),
    qty: z.number().int().min(0).optional(),
  })
  .refine((body) => (body.delta !== undefined) !== (body.qty !== undefined), {
    message: 'Envie exatamente um dos campos: delta ou qty.',
  });
