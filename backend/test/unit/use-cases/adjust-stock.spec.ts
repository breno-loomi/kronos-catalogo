import { beforeEach, describe, expect, it } from 'vitest';
import { CreateProductUseCase } from '../../../src/application/use-cases/products/create-product';
import { AdjustStockUseCase } from '../../../src/application/use-cases/stock/adjust-stock';
import { ValidationError } from '../../../src/domain/errors/domain-error';
import { FakeProductRepository } from '../fakes/fake-product-repository';

describe('AdjustStockUseCase', () => {
  let repo: FakeProductRepository;
  let createProduct: CreateProductUseCase;
  let adjustStock: AdjustStockUseCase;
  let productId: string;

  beforeEach(async () => {
    repo = new FakeProductRepository();
    createProduct = new CreateProductUseCase(repo);
    adjustStock = new AdjustStockUseCase(repo);
    const product = await createProduct.execute({
      brand: 'Nike',
      name: 'Pegasus 41',
      cat: 'corrida',
      price: 899,
      avail: 'Pronta entrega',
      stock: { '42': 3 },
    });
    productId = product.id;
  });

  it('incrementa a numeração pedida', async () => {
    const product = await adjustStock.execute(productId, '42', 2);
    expect(product.stock['42']).toBe(5);
  });

  it('decrementa a numeração pedida', async () => {
    const product = await adjustStock.execute(productId, '42', -1);
    expect(product.stock['42']).toBe(2);
  });

  it('rejeita decremento que deixaria a numeração negativa', async () => {
    await expect(adjustStock.execute(productId, '42', -10)).rejects.toThrow(
      'Quantidade em estoque não pode ficar negativa.',
    );
  });

  it('rejeita numeração fora de 36–45 sem chamar o repositório', async () => {
    await expect(adjustStock.execute(productId, '99', 1)).rejects.toThrow(ValidationError);
    const product = await repo.findById(productId);
    expect(product?.stock['42']).toBe(3); // nada mudou
  });

  it('rejeita delta não inteiro', async () => {
    await expect(adjustStock.execute(productId, '42', 1.5)).rejects.toThrow(ValidationError);
  });
});
