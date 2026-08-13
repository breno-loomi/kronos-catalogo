import { MAX_IMAGE_BYTES, detectImageType } from '../../../domain/services/image-type';
import { ValidationError } from '../../../domain/errors/domain-error';
import type { ImageStorage, StoredImage } from '../../ports/image-storage';

export class UploadProductImageUseCase {
  constructor(private readonly storage: ImageStorage) {}

  async execute(buffer: Buffer): Promise<StoredImage> {
    if (buffer.length === 0) throw new ValidationError('Arquivo vazio.');
    if (buffer.length > MAX_IMAGE_BYTES) {
      throw new ValidationError('Arquivo maior que 5 MB.');
    }

    const mimeType = detectImageType(buffer);
    if (!mimeType) {
      throw new ValidationError('Formato de imagem inválido — use JPEG, PNG ou WebP.');
    }

    return this.storage.save(buffer, mimeType);
  }
}
