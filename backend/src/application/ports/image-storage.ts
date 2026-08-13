export interface StoredImage {
  url: string;
}

export interface ImageStorage {
  /** Redimensiona (~1200px) e persiste a imagem, devolvendo a URL pública. */
  save(buffer: Buffer, mimeType: string): Promise<StoredImage>;
}
