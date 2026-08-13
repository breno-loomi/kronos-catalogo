import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type { ImageStorage, StoredImage } from '../../application/ports/image-storage';
import type { ImageMimeType } from '../../domain/services/image-type';

const EXTENSION_BY_MIME: Record<ImageMimeType, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const MAX_WIDTH_PX = 1200;

export class LocalDiskImageStorage implements ImageStorage {
  constructor(
    private readonly uploadDir: string,
    private readonly publicBaseUrl: string,
  ) {}

  async save(buffer: Buffer, mimeType: ImageMimeType): Promise<StoredImage> {
    await mkdir(this.uploadDir, { recursive: true });

    const resized = await sharp(buffer)
      .rotate() // aplica a orientação EXIF antes de descartar os metadados
      .resize({ width: MAX_WIDTH_PX, withoutEnlargement: true })
      .toBuffer();

    const filename = `${randomUUID()}${EXTENSION_BY_MIME[mimeType]}`;
    await writeFile(path.join(this.uploadDir, filename), resized);

    return { url: `${this.publicBaseUrl.replace(/\/$/, '')}/${filename}` };
  }
}
