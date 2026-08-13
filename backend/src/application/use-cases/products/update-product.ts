import type { Availability, Category, Product } from '../../../domain/entities/product';
import type { ProductPatch, ProductRepository } from '../../ports/product-repository';

export interface UpdateProductInput {
  brand?: string;
  name?: string;
  cat?: Category;
  desc?: string;
  price?: number;
  avail?: Availability;
  img?: string;
}

export class UpdateProductUseCase {
  constructor(private readonly products: ProductRepository) {}

  execute(id: string, input: UpdateProductInput): Promise<Product> {
    const patch: ProductPatch = { ...input };
    if (patch.brand !== undefined) patch.brand = patch.brand.trim();
    if (patch.name !== undefined) patch.name = patch.name.trim();
    if (patch.desc !== undefined) patch.desc = patch.desc.trim();
    if (patch.img !== undefined) patch.img = patch.img.trim();
    return this.products.update(id, patch);
  }
}
