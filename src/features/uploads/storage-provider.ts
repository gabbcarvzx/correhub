export interface StorageProvider {
  upload(input: { key: string; body: Buffer; contentType: string }): Promise<{ url: string }>;
  remove(key: string): Promise<void>;
}
