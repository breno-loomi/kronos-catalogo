import type { FastifyInstance } from 'fastify';
import { UploadProductImageUseCase } from '../../../application/use-cases/uploads/upload-product-image';
import { ValidationError } from '../../../domain/errors/domain-error';
import type { ServerDependencies } from '../server';

export async function registerAdminUploadRoutes(
  fastify: FastifyInstance,
  deps: ServerDependencies,
): Promise<void> {
  const uploadImage = new UploadProductImageUseCase(deps.imageStorage);

  fastify.post('/api/admin/uploads', async (request, reply) => {
    const file = await request.file();
    if (!file) throw new ValidationError('Envie um arquivo no campo "file".');
    const buffer = await file.toBuffer();
    const result = await uploadImage.execute(buffer);
    reply.code(201);
    return result;
  });
}
