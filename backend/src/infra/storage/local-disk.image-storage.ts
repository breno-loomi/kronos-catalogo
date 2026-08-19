import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ImageStorage, StoredImage } from '../../application/ports/image-storage';
import type { ImageMimeType } from '../../domain/services/image-type';
import { EXTENSION_BY_MIME } from './extension-by-mime';
import { resizeForUpload } from './resize-for-upload';

/** Disco local — só sobrevive em dev ou atrás de um volume persistente de verdade
 * (a maioria dos free tiers de hospedagem tem disco efêmero: some a cada deploy). */
export class LocalDiskImageStorage implements ImageStorage {
  constructor(
    private readonly uploadDir: string,
    private readonly publicBaseUrl: string,
  ) {}

  async save(buffer: Buffer, mimeType: ImageMimeType): Promise<StoredImage> {
    await mkdir(this.uploadDir, { recursive: true });

    const resized = await resizeForUpload(buffer);
    const filename = `${randomUUID()}${EXTENSION_BY_MIME[mimeType]}`;
    await writeFile(path.join(this.uploadDir, filename), resized);

    return { url: `${this.publicBaseUrl.replace(/\/$/, '')}/${filename}` };
  }
}
