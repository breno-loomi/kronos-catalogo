import type { FastifyInstance } from 'fastify';
import { GetProductUseCase } from '../../../application/use-cases/products/get-product';
import { ListPublicProductsUseCase } from '../../../application/use-cases/products/list-public-products';
import { GetSettingsUseCase } from '../../../application/use-cases/settings/get-settings';
import { ProductIdParamsSchema } from '../schemas/product.schemas';
import type { ServerDependencies } from '../server';

export async function registerPublicRoutes(
  fastify: FastifyInstance,
  deps: ServerDependencies,
): Promise<void> {
  const listProducts = new ListPublicProductsUseCase(deps.productRepository);
  const getProduct = new GetProductUseCase(deps.productRepository);
  const getSettings = new GetSettingsUseCase(deps.settingsRepository);

  fastify.get('/api/products', async () => listProducts.execute());

  fastify.get('/api/products/:id', async (request) => {
    const { id } = ProductIdParamsSchema.parse(request.params);
    return getProduct.execute(id);
  });

  fastify.get('/api/settings', async () => getSettings.execute());
}
