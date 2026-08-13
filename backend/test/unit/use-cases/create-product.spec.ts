import { describe, expect, it } from 'vitest';
import { CreateProductUseCase } from '../../../src/application/use-cases/products/create-product';
import { ValidationError } from '../../../src/domain/errors/domain-error';
import { FakeProductRepository } from '../fakes/fake-product-repository';

describe('CreateProductUseCase', () => {
  it('preenche as numerações não informadas com zero', async () => {
    const useCase = new CreateProductUseCase(new FakeProductRepository());
    const product = await useCase.execute({
      brand: 'Nike',
      name: 'Vaporfly 4',
      cat: 'prova',
      price: 2290,
      avail: 'Por encomenda',
      stock: { '42': 3 },
    });
    expect(product.stock).toEqual({
      '36': 0,
      '37': 0,
      '38': 0,
      '39': 0,
      '40': 0,
      '41': 0,
      '42': 3,
      '43': 0,
      '44': 0,
      '45': 0,
    });
  });

  it('rejeita numeração fora de 36–45', async () => {
    const useCase = new CreateProductUseCase(new FakeProductRepository());
    await expect(
      useCase.execute({
        brand: 'Nike',
        name: 'Vaporfly 4',
        cat: 'prova',
        price: 2290,
        avail: 'Por encomenda',
        stock: { '50': 1 },
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('rejeita quantidade negativa na criação', async () => {
    const useCase = new CreateProductUseCase(new FakeProductRepository());
    await expect(
      useCase.execute({
        brand: 'Nike',
        name: 'Vaporfly 4',
        cat: 'prova',
        price: 2290,
        avail: 'Por encomenda',
        stock: { '42': -1 },
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('mantém desc vazia quando não informada (o fallback de texto é gerado no front)', async () => {
    const useCase = new CreateProductUseCase(new FakeProductRepository());
    const product = await useCase.execute({
      brand: 'Nike',
      name: 'Vaporfly 4',
      cat: 'prova',
      price: 2290,
      avail: 'Por encomenda',
    });
    expect(product.desc).toBe('');
  });
});
