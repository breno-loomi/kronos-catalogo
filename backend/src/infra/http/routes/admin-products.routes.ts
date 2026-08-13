import type { FastifyInstance } from 'fastify';
import { CreateProductUseCase } from '../../../application/use-cases/products/create-product';
import { DeleteProductUseCase } from '../../../application/use-cases/products/delete-product';
import { UpdateProductUseCase } from '../../../application/use-cases/products/update-product';
import { AdjustStockUseCase } from '../../../application/use-cases/stock/adjust-stock';
import { SetStockUseCase } from '../../../application/use-cases/stock/set-stock';
import {
  CreateProductBodySchema,
  ProductIdParamsSchema,
  UpdateProductBodySchema,
} from '../schemas/product.schemas';
import { AdjustStockBodySchema } from '../schemas/stock.schemas';
import type { ServerDependencies } from '../server';

export async function registerAdminProductRoutes(
  fastify: FastifyInstance,
  deps: ServerDependencies,
): Promise<void> {
  const createProduct = new CreateProductUseCase(deps.productRepository);
  const updateProduct = new UpdateProductUseCase(deps.productRepository);
  const deleteProduct = new DeleteProductUseCase(deps.productRepository);
  const adjustStock = new AdjustStockUseCase(deps.productRepository);
  const setStock = new SetStockUseCase(deps.productRepository);

  fastify.post('/api/admin/products', async (request, reply) => {
    const body = CreateProductBodySchema.parse(request.body);
    const product = await createProduct.execute(body);
    reply.code(201);
    return product;
  });

  fastify.patch('/api/admin/products/:id', async (request) => {
    const { id } = ProductIdParamsSchema.parse(request.params);
    const body = UpdateProductBodySchema.parse(request.body);
    return updateProduct.execute(id, body);
  });

  fastify.delete('/api/admin/products/:id', async (request, reply) => {
    const { id } = ProductIdParamsSchema.parse(request.params);
    await deleteProduct.execute(id);
    return reply.code(204).send();
  });

  fastify.patch('/api/admin/products/:id/stock', async (request) => {
    const { id } = ProductIdParamsSchema.parse(request.params);
    const body = AdjustStockBodySchema.parse(request.body);
    if (body.delta !== undefined) return adjustStock.execute(id, body.size, body.delta);
    return setStock.execute(id, body.size, body.qty as number);
  });
}
