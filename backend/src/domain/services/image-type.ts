export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type ImageMimeType = 'image/jpeg' | 'image/png' | 'image/webp';

/** Detecta o tipo pelo conteúdo (magic numbers), nunca pela extensão do arquivo. */
export function detectImageType(buffer: Buffer): ImageMimeType | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (buffer.length >= pngSignature.length && pngSignature.every((byte, i) => buffer[i] === byte)) {
    return 'image/png';
  }

  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }

  return null;
}
