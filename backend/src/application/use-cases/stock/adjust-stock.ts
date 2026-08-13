import { type Product, isSize } from '../../../domain/entities/product';
import { ValidationError } from '../../../domain/errors/domain-error';
import type { ProductRepository } from '../../ports/product-repository';

export class AdjustStockUseCase {
  constructor(private readonly products: ProductRepository) {}

  async execute(id: string, size: string, delta: number): Promise<Product> {
    if (!isSize(size)) throw new ValidationError(`Numeração inválida: ${size}.`);
    if (!Number.isInteger(delta)) throw new ValidationError('delta precisa ser um inteiro.');
    return this.products.adjustStock(id, size, delta);
  }
}
