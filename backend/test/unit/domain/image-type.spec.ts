import { describe, expect, it } from 'vitest';
import { detectImageType } from '../../../src/domain/services/image-type';

describe('detectImageType', () => {
  it('reconhece JPEG pelo magic number', () => {
    expect(detectImageType(Buffer.from([0xff, 0xd8, 0xff, 0x00]))).toBe('image/jpeg');
  });

  it('reconhece PNG pelo magic number', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    expect(detectImageType(png)).toBe('image/png');
  });

  it('reconhece WebP pelo magic number', () => {
    const webp = Buffer.concat([
      Buffer.from('RIFF', 'ascii'),
      Buffer.from([0, 0, 0, 0]),
      Buffer.from('WEBP', 'ascii'),
    ]);
    expect(detectImageType(webp)).toBe('image/webp');
  });

  it('devolve null para um arquivo que não é imagem, mesmo com extensão .jpg', () => {
    expect(detectImageType(Buffer.from('conteudo qualquer', 'utf-8'))).toBeNull();
  });
});
