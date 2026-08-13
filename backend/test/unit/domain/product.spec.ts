import { describe, expect, it } from 'vitest';
import {
  SIZES,
  emptyStock,
  isSize,
  sizesInStock,
  totalStock,
} from '../../../src/domain/entities/product';

describe('product domain rules', () => {
  it('SIZES cobre exatamente 36 a 45', () => {
    expect(SIZES).toEqual(['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']);
  });

  it('isSize aceita só numerações válidas', () => {
    expect(isSize('42')).toBe(true);
    expect(isSize('35')).toBe(false);
    expect(isSize('46')).toBe(false);
    expect(isSize('abc')).toBe(false);
  });

  it('emptyStock começa tudo zerado', () => {
    const stock = emptyStock();
    expect(Object.keys(stock)).toHaveLength(10);
    expect(Object.values(stock).every((qty) => qty === 0)).toBe(true);
  });

  it('produto de pronta entrega só mostra numerações com estoque > 0', () => {
    const product = {
      avail: 'Pronta entrega' as const,
      stock: { ...emptyStock(), '40': 2, '42': 1 },
    };
    expect(sizesInStock(product)).toEqual(['40', '42']);
  });

  it('produto por encomenda mostra todas as numerações, mesmo sem estoque', () => {
    const product = { avail: 'Por encomenda' as const, stock: emptyStock() };
    expect(sizesInStock(product)).toEqual([...SIZES]);
  });

  it('totalStock soma todas as numerações', () => {
    const product = { stock: { ...emptyStock(), '38': 3, '41': 2 } };
    expect(totalStock(product)).toBe(5);
  });
});
