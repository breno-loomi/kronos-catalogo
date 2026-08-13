import {
  type Availability,
  type Category,
  type Product,
  SIZES,
  emptyStock,
} from '../../../domain/entities/product';
import { ValidationError } from '../../../domain/errors/domain-error';
import type { NewProductData, ProductRepository } from '../../ports/product-repository';

export interface CreateProductInput {
  brand: string;
  name: string;
  cat: Category;
  desc?: string;
  price: number;
  avail: Availability;
  img?: string;
  stock?: Partial<Record<string, number>>;
}

export class CreateProductUseCase {
  constructor(private readonly products: ProductRepository) {}

  async execute(input: CreateProductInput): Promise<Product> {
    const stock = emptyStock();
    for (const [size, qty] of Object.entries(input.stock ?? {})) {
      if (!(SIZES as readonly string[]).includes(size)) {
        throw new ValidationError(`Numeração inválida: ${size}.`);
      }
      const value = Number(qty);
      if (!Number.isInteger(value) || value < 0) {
        throw new ValidationError(`Quantidade inválida para o tamanho ${size}.`);
      }
      stock[size as keyof typeof stock] = value;
    }

    const data: NewProductData = {
      brand: input.brand.trim(),
      name: input.name.trim(),
      cat: input.cat,
      desc: input.desc?.trim() ?? '',
      price: input.price,
      avail: input.avail,
      img: input.img?.trim() ?? '',
      stock,
    };

    return this.products.create(data);
  }
}
