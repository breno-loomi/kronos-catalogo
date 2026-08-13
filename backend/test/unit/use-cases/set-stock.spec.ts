import { beforeEach, describe, expect, it } from 'vitest';
import { CreateProductUseCase } from '../../../src/application/use-cases/products/create-product';
import { SetStockUseCase } from '../../../src/application/use-cases/stock/set-stock';
import { ValidationError } from '../../../src/domain/errors/domain-error';
import { FakeProductRepository } from '../fakes/fake-product-repository';

describe('SetStockUseCase', () => {
  let repo: FakeProductRepository;
  let setStock: SetStockUseCase;
  let productId: string;

  beforeEach(async () => {
    repo = new FakeProductRepository();
    const createProduct = new CreateProductUseCase(repo);
    setStock = new SetStockUseCase(repo);
    const product = await createProduct.execute({
      brand: 'Adidas',
      name: 'Samba OG',
      cat: 'lifestyle',
      price: 749,
      avail: 'Por encomenda',
      stock: { '39': 2 },
    });
    productId = product.id;
  });

  it('define a quantidade absoluta pedida', async () => {
    const product = await setStock.execute(productId, '39', 7);
    expect(product.stock['39']).toBe(7);
  });

  it('rejeita quantidade negativa', async () => {
    await expect(setStock.execute(productId, '39', -1)).rejects.toThrow(ValidationError);
  });

  it('rejeita numeração inválida', async () => {
    await expect(setStock.execute(productId, '50', 1)).rejects.toThrow(ValidationError);
  });

  it('rejeita quantidade não inteira', async () => {
    await expect(setStock.execute(productId, '39', 1.2)).rejects.toThrow(ValidationError);
  });
});
