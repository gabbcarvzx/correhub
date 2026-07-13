/**
 * StorageProvider — interface para provedores de armazenamento.
 *
 * v2.8: Adicionado suporte a signed URLs e inputs tipados com multi-tenant.
 */

import type { StorageEntityType } from "@/features/uploads/path-builder";

export interface UploadInput {
  /** Tenant ID do contexto autenticado */
  tenantId: string;
  /** Tipo de entidade */
  entityType: StorageEntityType;
  /** ID da entidade (userId, partnerId, groupId) */
  entityId: string;
  /** Nome original do arquivo (para validação) */
  originalName: string;
  /** Buffer com o conteúdo do arquivo */
  body: Buffer;
  /** MIME type do arquivo */
  contentType: string;
}

export interface UploadResult {
  /** Storage key completo (ex: tenants/{tenantId}/users/{userId}/{uuid}.png) */
  storageKey: string;
  /** Signed URL temporária para acesso ao arquivo */
  signedUrl: string;
  /** Expiração da signed URL em segundos */
  expiresIn: number;
}

export interface StorageProvider {
  /**
   * Faz upload validado de um arquivo.
   * - Valida tamanho, MIME, sanitização
   * - Gera path multi-tenant
   * - Gera nome único UUID
   * - Retorna signed URL
   */
  upload(input: UploadInput): Promise<UploadResult>;

  /**
   * Remove um arquivo do storage.
   */
  remove(storageKey: string): Promise<void>;

  /**
   * Gera uma signed URL temporária para acesso a um arquivo.
   *
   * @param storageKey - Key completa do arquivo
   * @param expiresIn - Tempo de expiração em segundos (default: 3600 = 1h)
   */
  getSignedUrl(input: {
    storageKey: string;
    expiresIn?: number;
  }): Promise<{ signedUrl: string; expiresIn: number }>;
}
