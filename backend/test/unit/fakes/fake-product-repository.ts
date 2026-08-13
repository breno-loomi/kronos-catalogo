import { randomBytes } from 'node:crypto';
import type {
  NewProductData,
  ProductPatch,
  ProductRepository,
} from '../../../src/application/ports/product-repository';
import type { Product, Size } from '../../../src/domain/entities/product';
import { InsufficientStockError, NotFoundError } from '../../../src/domain/errors/domain-error';

/** Repositório em memória — usado para testar os use-cases sem tocar no banco. */
export class FakeProductRepository implements ProductRepository {
  private readonly products = new Map<string, Product>();

  async listAll(): Promise<Product[]> {
    return [...this.products.values()];
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) ?? null;
  }

  async create(data: NewProductData): Promise<Product> {
    const product: Product = { id: randomBytes(8).toString('hex'), ...data };
    this.products.set(product.id, product);
    return product;
  }

  async update(id: string, patch: ProductPatch): Promise<Product> {
    const product = this.products.get(id);
    if (!product) throw new NotFoundError(`Produto ${id} não encontrado.`);
    const updated = { ...product, ...patch };
    this.products.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!this.products.delete(id)) throw new NotFoundError(`Produto ${id} não encontrado.`);
  }

  async adjustStock(id: string, size: Size, delta: number): Promise<Product> {
    const product = this.products.get(id);
    if (!product) throw new NotFoundError(`Produto ${id} não encontrado.`);
    const next = (product.stock[size] ?? 0) + delta;
    if (next < 0) throw new InsufficientStockError();
    const updated = { ...product, stock: { ...product.stock, [size]: next } };
    this.products.set(id, updated);
    return updated;
  }

  async setStock(id: string, size: Size, qty: number): Promise<Product> {
    const product = this.products.get(id);
    if (!product) throw new NotFoundError(`Produto ${id} não encontrado.`);
    const updated = { ...product, stock: { ...product.stock, [size]: qty } };
    this.products.set(id, updated);
    return updated;
  }
}
