export const SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'] as const;
export type Size = (typeof SIZES)[number];
export type Stock = Record<Size, number>;

export const CATEGORIES = ['corrida', 'treino', 'prova', 'trail', 'lifestyle'] as const;
export type Category = (typeof CATEGORIES)[number];

export const AVAILABILITY = ['Pronta entrega', 'Por encomenda'] as const;
export type Availability = (typeof AVAILABILITY)[number];

export function isSize(value: string): value is Size {
  return (SIZES as readonly string[]).includes(value);
}

export function emptyStock(): Stock {
  const stock = {} as Stock;
  for (const size of SIZES) stock[size] = 0;
  return stock;
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  cat: Category;
  desc: string;
  price: number;
  avail: Availability;
  img: string;
  stock: Stock;
}

/** Numerações visíveis no catálogo: pronta-entrega só mostra o que tem estoque > 0; por encomenda mostra todas. */
export function sizesInStock(product: Pick<Product, 'avail' | 'stock'>): Size[] {
  if (product.avail === 'Por encomenda') return [...SIZES];
  return SIZES.filter((size) => (product.stock[size] ?? 0) > 0);
}

export function totalStock(product: Pick<Product, 'stock'>): number {
  return SIZES.reduce((sum, size) => sum + (product.stock[size] ?? 0), 0);
}
