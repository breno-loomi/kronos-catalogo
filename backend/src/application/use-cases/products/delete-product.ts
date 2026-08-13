import type { ProductRepository } from '../../ports/product-repository';

export class DeleteProductUseCase {
  constructor(private readonly products: ProductRepository) {}

  execute(id: string): Promise<void> {
    return this.products.delete(id);
  }
}
