import type { Product } from '../../../domain/entities/product';
import type { ProductRepository } from '../../ports/product-repository';

export class ListPublicProductsUseCase {
  constructor(private readonly products: ProductRepository) {}

  execute(): Promise<Product[]> {
    return this.products.listAll();
  }
}
