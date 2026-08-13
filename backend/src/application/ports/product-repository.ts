import type { Availability, Category, Product, Size, Stock } from '../../domain/entities/product';

export interface NewProductData {
  brand: string;
  name: string;
  cat: Category;
  desc: string;
  price: number;
  avail: Availability;
  img: string;
  stock: Stock;
}

export interface ProductPatch {
  brand?: string;
  name?: string;
  cat?: Category;
  desc?: string;
  price?: number;
  avail?: Availability;
  img?: string;
}

export interface ProductRepository {
  listAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(data: NewProductData): Promise<Product>;
  /** @throws NotFoundError */
  update(id: string, patch: ProductPatch): Promise<Product>;
  /** @throws NotFoundError */
  delete(id: string): Promise<void>;
  /** Atômico no banco (`qty = qty + delta`). @throws NotFoundError, InsufficientStockError */
  adjustStock(id: string, size: Size, delta: number): Promise<Product>;
  /** @throws NotFoundError */
  setStock(id: string, size: Size, qty: number): Promise<Product>;
}
