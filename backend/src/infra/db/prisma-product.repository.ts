import { Prisma, type PrismaClient } from '@prisma/client';
import type {
  NewProductData,
  ProductPatch,
  ProductRepository,
} from '../../application/ports/product-repository';
import {
  type Availability,
  type Category,
  type Product,
  SIZES,
  type Size,
  emptyStock,
  isSize,
} from '../../domain/entities/product';
import { InsufficientStockError, NotFoundError } from '../../domain/errors/domain-error';

type ProductRow = Prisma.ProductGetPayload<{ include: { stock: true } }>;

function toDomain(row: ProductRow): Product {
  const stock = emptyStock();
  for (const item of row.stock) {
    if (isSize(item.size)) stock[item.size] = item.qty;
  }
  return {
    id: row.id,
    brand: row.brand,
    name: row.name,
    cat: row.cat as Category,
    desc: row.desc,
    price: row.price,
    avail: row.avail as Availability,
    img: row.img,
    stock,
  };
}

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listAll(): Promise<Product[]> {
    const rows = await this.prisma.product.findMany({
      include: { stock: true },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({ where: { id }, include: { stock: true } });
    return row ? toDomain(row) : null;
  }

  async create(data: NewProductData): Promise<Product> {
    const row = await this.prisma.product.create({
      data: {
        brand: data.brand,
        name: data.name,
        cat: data.cat,
        desc: data.desc,
        price: data.price,
        avail: data.avail,
        img: data.img,
        stock: {
          create: SIZES.map((size) => ({ size, qty: data.stock[size] ?? 0 })),
        },
      },
      include: { stock: true },
    });
    return toDomain(row);
  }

  async update(id: string, patch: ProductPatch): Promise<Product> {
    try {
      const row = await this.prisma.product.update({
        where: { id },
        data: patch,
        include: { stock: true },
      });
      return toDomain(row);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new NotFoundError(`Produto ${id} não encontrado.`);
      }
      throw err;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.product.delete({ where: { id } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new NotFoundError(`Produto ${id} não encontrado.`);
      }
      throw err;
    }
  }

  async adjustStock(productId: string, size: Size, delta: number): Promise<Product> {
    const exists = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundError(`Produto ${productId} não encontrado.`);

    const attempt = () =>
      this.prisma.$queryRaw<{ qty: number }[]>(Prisma.sql`
        UPDATE stock_items
        SET qty = qty + ${delta}
        WHERE "productId" = ${productId} AND "size" = ${size} AND qty + ${delta} >= 0
        RETURNING qty
      `);

    let updated = await attempt();

    if (updated.length === 0) {
      // Linha de estoque nunca existiu para essa numeração (não deveria acontecer, já que todo
      // produto é criado com as 10 numerações) — cai para criar/retry em vez de assumir conflito.
      const row = await this.prisma.stockItem.findUnique({
        where: { productId_size: { productId, size } },
      });
      if (row) throw new InsufficientStockError();
      if (delta < 0) throw new InsufficientStockError();
      try {
        await this.prisma.stockItem.create({ data: { productId, size, qty: delta } });
      } catch {
        // outra requisição criou a linha entre o SELECT e o INSERT — tenta o UPDATE atômico de novo.
        updated = await attempt();
        if (updated.length === 0) throw new InsufficientStockError();
      }
    }

    return (await this.findById(productId)) as Product;
  }

  async setStock(productId: string, size: Size, qty: number): Promise<Product> {
    const exists = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundError(`Produto ${productId} não encontrado.`);

    await this.prisma.stockItem.upsert({
      where: { productId_size: { productId, size } },
      update: { qty },
      create: { productId, size, qty },
    });

    return (await this.findById(productId)) as Product;
  }
}
