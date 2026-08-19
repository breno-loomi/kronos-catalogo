import sharp from 'sharp';

const MAX_WIDTH_PX = 1200;

/** Aplica a orientação EXIF e redimensiona para no máximo 1200px de largura (sem ampliar). */
export function resizeForUpload(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize({ width: MAX_WIDTH_PX, withoutEnlargement: true })
    .toBuffer();
}
