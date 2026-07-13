/**
 * Upload Validator — validação rigorosa de arquivos antes do upload.
 *
 * Segurança OWASP File Upload:
 * - Limite de tamanho (default 5MB, configurável via UPLOAD_MAX_SIZE_BYTES)
 * - MIME types permitidos (apenas image/png, image/jpeg, image/webp)
 * - Bloqueio de SVG (risco de XSS via SVG)
 * - Sanitização de nome de arquivo (remove path traversal, caracteres especiais)
 * - Geração de nome único via UUID v4
 */

import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import { env } from "@/lib/env";
import { logger } from "@/features/observability/logger";

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

const BLOCKED_EXTENSIONS = [".svg", ".xml", ".html", ".htm", ".js", ".php", ".exe", ".bat", ".sh", ".dll"];

const DEFAULT_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface UploadValidationInput {
  /** Nome original do arquivo (ex: "foto.png") */
  originalName: string;
  /** MIME type declarado (ex: "image/png") */
  mimeType: string;
  /** Tamanho do arquivo em bytes */
  sizeBytes: number;
  /** Buffer do arquivo (para inspeção adicional) */
  body?: Buffer;
}

export interface UploadValidationResult {
  valid: boolean;
  /** Nome de arquivo sanitizado e único (ex: "550e8400-...png") - presente apenas se valid=true */
  sanitizedFileName: string;
  /** MIME type validado - presente apenas se valid=true */
  mimeType?: AllowedMimeType;
  /** Mensagem de erro (se inválido) */
  error?: string;
}

// ---------------------------------------------------------------------------
// Validação
// ---------------------------------------------------------------------------

/**
 * Retorna o tamanho máximo permitido em bytes.
 * Configurável via UPLOAD_MAX_SIZE_BYTES.
 */
export function getMaxUploadSize(): number {
  try {
    return env.UPLOAD_MAX_SIZE_BYTES;
  } catch {
    // Fallback seguro durante build/test se env não estiver parseado
    const envValue = process.env.UPLOAD_MAX_SIZE_BYTES;
    if (envValue) {
      const parsed = Number(envValue);
      if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    }
    return DEFAULT_MAX_SIZE_BYTES;
  }
}

/**
 * Valida um arquivo para upload.
 *
 * Verifica:
 * 1. Tamanho dentro do limite
 * 2. MIME type na allowlist
 * 3. Extensão não bloqueada
 * 4. Nome não contém path traversal
 *
 * Retorna:
 * - valid: true + sanitizedFileName + mimeType validado
 * - valid: false + error message
 */
export function validateUpload(input: UploadValidationInput): UploadValidationResult {
  const maxSize = getMaxUploadSize();
  const { originalName, mimeType, sizeBytes } = input;

  // 1. Tamanho
  if (sizeBytes > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    const actualSizeMB = (sizeBytes / (1024 * 1024)).toFixed(1);

    logger.security("upload.validation.size_exceeded", {
      sizeBytes,
      maxSize,
      originalName,
    });    return {
      valid: false,
      sanitizedFileName: "",
      error: `Arquivo muito grande. Máximo permitido: ${maxSizeMB}MB. Enviado: ${actualSizeMB}MB.`,
    };
  }

  // 2. MIME type permitido
  if (!ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType)) {
    logger.security("upload.validation.mime_blocked", {
      mimeType,
      originalName,
    });

    return {
      valid: false,
      sanitizedFileName: "",
      error: `Tipo de arquivo não permitido: ${mimeType}. Permitidos apenas: ${ALLOWED_MIME_TYPES.join(", ")}.`,
    };
  }

  // 3. Extensão bloqueada (camada extra de segurança)
  const ext = extname(originalName).toLowerCase();
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    logger.security("upload.validation.extension_blocked", {
      extension: ext,
      originalName,
      mimeType,
    });

    return {
      valid: false,
      sanitizedFileName: "",
      error: `Extensão de arquivo não permitida: ${ext}.`,
    };
  }

  // 4. Sanitização do nome original (remove path traversal e caracteres perigosos)
  const sanitizedBase = sanitizeFileName(originalName);
  if (!sanitizedBase) {
    logger.security("upload.validation.name_sanitization_failed", {
      originalName,
    });

    return {
      valid: false,
      sanitizedFileName: "",
      error: "Nome de arquivo inválido.",
    };
  }

  // 5. Gera nome único UUID + extensão original
  const extension = ext || `.${mimeType.split("/")[1] ?? "bin"}`;
  const uuid = randomUUID();
  const uniqueFileName = `${uuid}${extension}`;

  return {
    valid: true,
    sanitizedFileName: uniqueFileName,
    mimeType: mimeType as AllowedMimeType,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Sanitiza nome de arquivo:
 * - Remove path traversal (../, ..\\, /, \\)
 * - Remove caracteres não alfanuméricos (exceto . - _)
 * - Remove espaços
 * - Retorna null se o nome ficar vazio após sanitização
 */
function sanitizeFileName(name: string): string | null {
  // Remove path traversal
  let sanitized = name
    .replace(/\.\./g, "")   // remove ..
    .replace(/[/\\]/g, "")  // remove / e \
    .replace(/\s+/g, "_")   // substitui espaços por _
    .replace(/[^a-zA-Z0-9._-]/g, "") // remove caracteres especiais
    .trim();

  // Limita tamanho
  sanitized = sanitized.slice(0, 255);

  return sanitized.length > 0 ? sanitized : null;
}

/**
 * Valida se um storage key segue o padrão multi-tenant.
 * Útil para proteção extra antes de operações de remove.
 */
export function validateStorageKey(key: string): boolean {
  // Formato esperado: tenants/{tenantId}/{type}/{id}/{filename}
  const pattern = /^tenants\/[a-zA-Z0-9_-]+\/(users|partners|groups)\/[a-zA-Z0-9_-]+\/[a-f0-9-]+\.[a-z]+$/;
  return pattern.test(key);
}
