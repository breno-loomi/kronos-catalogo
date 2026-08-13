import type { Product } from '../../../domain/entities/product';
import { NotFoundError } from '../../../domain/errors/domain-error';
import type { ProductRepository } from '../../ports/product-repository';

export class GetProductUseCase {
  constructor(private readonly products: ProductRepository) {}

  async execute(id: string): Promise<Product> {
    const product = await this.products.findById(id);
    if (!product) throw new NotFoundError(`Produto ${id} não encontrado.`);
    return product;
  }
}
