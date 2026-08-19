import type { ImageMimeType } from '../../domain/services/image-type';

export const EXTENSION_BY_MIME: Record<ImageMimeType, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};
