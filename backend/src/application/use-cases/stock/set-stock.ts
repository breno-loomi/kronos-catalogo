import { type Product, isSize } from '../../../domain/entities/product';
import { ValidationError } from '../../../domain/errors/domain-error';
import type { ProductRepository } from '../../ports/product-repository';

export class SetStockUseCase {
  constructor(private readonly products: ProductRepository) {}

  async execute(id: string, size: string, qty: number): Promise<Product> {
    if (!isSize(size)) throw new ValidationError(`Numeração inválida: ${size}.`);
    if (!Number.isInteger(qty) || qty < 0) {
      throw new ValidationError('qty precisa ser um inteiro maior ou igual a zero.');
    }
    return this.products.setStock(id, size, qty);
  }
}
