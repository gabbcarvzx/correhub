import type { StorageProvider } from "@/features/uploads/storage-provider";

export class LocalStorageProvider implements StorageProvider {
  async upload(input: { key: string; body: Buffer; contentType: string }) {
    void input;
    return { url: "/uploads/mock-placeholder" };
  }

  async remove(key: string) {
    void key;
  }
}
