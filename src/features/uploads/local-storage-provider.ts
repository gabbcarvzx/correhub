import type { StorageProvider, UploadInput, UploadResult } from "@/features/uploads/storage-provider";

/**
 * Provedor de armazenamento local para desenvolvimento.
 *
 * @throws {Error} Sempre — use um StorageProvider real em produção
 */
export class LocalStorageProvider implements StorageProvider {
  async upload(input: UploadInput): Promise<UploadResult> {
    void input;
    throw new Error(
      "LocalStorageProvider não persiste arquivos. " +
      "Configure um provedor real: Supabase Storage, AWS S3, Cloudflare R2, etc."
    );
  }

  async remove(storageKey: string): Promise<void> {
    void storageKey;
    throw new Error(
      "LocalStorageProvider não remove arquivos. " +
      "Configure um provedor real: Supabase Storage, AWS S3, Cloudflare R2, etc."
    );
  }

  async getSignedUrl(input: {
    storageKey: string;
    expiresIn?: number;
  }): Promise<{ signedUrl: string; expiresIn: number }> {
    void input;
    throw new Error(
      "LocalStorageProvider não gera signed URLs. " +
      "Configure um provedor real: Supabase Storage, AWS S3, Cloudflare R2, etc."
    );
  }
}
