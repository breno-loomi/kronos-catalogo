import { z } from 'zod';
import { AVAILABILITY, CATEGORIES } from '../../../domain/entities/product';

export const ProductIdParamsSchema = z.object({
  id: z.string().min(1),
});

const StockInputSchema = z.record(z.string(), z.number().int());

export const CreateProductBodySchema = z.object({
  brand: z.string().trim().min(1, 'brand é obrigatório.'),
  name: z.string().trim().min(1, 'name é obrigatório.'),
  cat: z.enum(CATEGORIES),
  desc: z.string().trim().optional(),
  price: z.number().int().positive('price precisa ser um inteiro positivo.'),
  avail: z.enum(AVAILABILITY),
  img: z.string().trim().optional(),
  stock: StockInputSchema.optional(),
});

export const UpdateProductBodySchema = z
  .object({
    brand: z.string().trim().min(1).optional(),
    name: z.string().trim().min(1).optional(),
    cat: z.enum(CATEGORIES).optional(),
    desc: z.string().trim().optional(),
    price: z.number().int().positive().optional(),
    avail: z.enum(AVAILABILITY).optional(),
    img: z.string().trim().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: 'Envie ao menos um campo para atualizar.',
  });
