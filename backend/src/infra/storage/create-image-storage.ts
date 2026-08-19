import type { ImageStorage } from '../../application/ports/image-storage';
import type { Env } from '../config/env';
import { LocalDiskImageStorage } from './local-disk.image-storage';
import { SupabaseImageStorage } from './supabase-image-storage';

/** Usa Supabase Storage quando as três variáveis estiverem preenchidas; senão cai pro disco
 * local (suficiente pra dev, mas não sobrevive a deploy/restart em hospedagens com fs
 * efêmero). */
export function createImageStorage(env: Env): ImageStorage {
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY && env.SUPABASE_BUCKET) {
    return new SupabaseImageStorage({
      url: env.SUPABASE_URL,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
      bucket: env.SUPABASE_BUCKET,
    });
  }
  return new LocalDiskImageStorage(env.UPLOAD_DIR, env.PUBLIC_UPLOAD_BASE_URL);
}
