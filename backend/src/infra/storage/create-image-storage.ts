import type { ImageStorage } from '../../application/ports/image-storage';
import type { Env } from '../config/env';
import { LocalDiskImageStorage } from './local-disk.image-storage';
import { R2ImageStorage } from './r2-image-storage';

/** Usa R2 quando as cinco variáveis estiverem preenchidas; senão cai pro disco local
 * (suficiente pra dev, mas não sobrevive a deploy/restart em hospedagens com fs efêmero). */
export function createImageStorage(env: Env): ImageStorage {
  if (
    env.R2_ACCOUNT_ID &&
    env.R2_ACCESS_KEY_ID &&
    env.R2_SECRET_ACCESS_KEY &&
    env.R2_BUCKET &&
    env.R2_PUBLIC_URL
  ) {
    return new R2ImageStorage({
      accountId: env.R2_ACCOUNT_ID,
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      bucket: env.R2_BUCKET,
      publicUrl: env.R2_PUBLIC_URL,
    });
  }
  return new LocalDiskImageStorage(env.UPLOAD_DIR, env.PUBLIC_UPLOAD_BASE_URL);
}
