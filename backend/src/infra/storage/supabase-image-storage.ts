import { randomUUID } from 'node:crypto';
import { type SupabaseClient, createClient } from '@supabase/supabase-js';
import type { ImageStorage, StoredImage } from '../../application/ports/image-storage';
import type { ImageMimeType } from '../../domain/services/image-type';
import { EXTENSION_BY_MIME } from './extension-by-mime';
import { resizeForUpload } from './resize-for-upload';

export interface SupabaseStorageConfig {
  url: string;
  serviceRoleKey: string;
  bucket: string;
}

/** Supabase Storage — sobrevive a qualquer deploy/restart do servidor, ao contrário de
 * disco local em hospedagens com fs efêmero. Usa a service role key (bypassa RLS) porque
 * quem chama já passou pelo `authenticate` do Fastify antes de chegar aqui. */
export class SupabaseImageStorage implements ImageStorage {
  private readonly client: SupabaseClient;
  private readonly bucket: string;

  constructor(config: SupabaseStorageConfig) {
    this.bucket = config.bucket;
    this.client = createClient(config.url, config.serviceRoleKey);
  }

  async save(buffer: Buffer, mimeType: ImageMimeType): Promise<StoredImage> {
    const resized = await resizeForUpload(buffer);
    const key = `${randomUUID()}${EXTENSION_BY_MIME[mimeType]}`;

    const { error } = await this.client.storage.from(this.bucket).upload(key, resized, {
      contentType: mimeType,
      cacheControl: '31536000',
    });
    if (error) throw new Error(`Falha ao enviar imagem pro Supabase Storage: ${error.message}`);

    const {
      data: { publicUrl },
    } = this.client.storage.from(this.bucket).getPublicUrl(key);

    return { url: publicUrl };
  }
}
