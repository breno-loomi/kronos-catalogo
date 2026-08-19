import { randomUUID } from 'node:crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { ImageStorage, StoredImage } from '../../application/ports/image-storage';
import type { ImageMimeType } from '../../domain/services/image-type';
import { EXTENSION_BY_MIME } from './extension-by-mime';
import { resizeForUpload } from './resize-for-upload';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  /** URL pública do bucket (domínio custom ou o subdomínio pub-*.r2.dev), sem barra no final. */
  publicUrl: string;
}

/** Cloudflare R2 — API compatível com S3, sem cobrança de egress. Sobrevive a qualquer
 * deploy/restart do servidor, ao contrário de disco local em hospedagens com fs efêmero. */
export class R2ImageStorage implements ImageStorage {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(config: R2Config) {
    this.bucket = config.bucket;
    this.publicUrl = config.publicUrl.replace(/\/$/, '');
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async save(buffer: Buffer, mimeType: ImageMimeType): Promise<StoredImage> {
    const resized = await resizeForUpload(buffer);
    const key = `${randomUUID()}${EXTENSION_BY_MIME[mimeType]}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: resized,
        ContentType: mimeType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    return { url: `${this.publicUrl}/${key}` };
  }
}
