export type LogLevel = "debug" | "info" | "warn" | "error" | "security";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  security: 1, // same level as info — always visible in production
};

/**
 * Retorna o nível mínimo de log configurado via env.
 * Usa lazy evaluation para garantir que process.env está disponível.
 */
function getCurrentLevel(): number {
  const level = process.env.LOG_LEVEL as LogLevel | undefined;
  return LOG_LEVELS[level ?? "info"] ?? LOG_LEVELS.info;
}

let correlationIdCounter = 0;

function generateCorrelationId(): string {
  correlationIdCounter++;
  return `${Date.now().toString(36)}-${correlationIdCounter.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

interface LogEntry {
  level: LogLevel;
  event: string;
  context?: Record<string, unknown>;
  correlationId: string;
  timestamp: string;
  service: string;
  environment: string;
  /** Duração em ms (quando aplicável) */
  durationMs?: number;
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= getCurrentLevel();
}

function createLogEntry(
  level: LogLevel,
  event: string,
  context?: Record<string, unknown>
): LogEntry {
  return {
    level,
    event,
    context,
    correlationId: generateCorrelationId(),
    timestamp: new Date().toISOString(),
    service: "correhub",
    environment: process.env.NODE_ENV ?? "development",
  };
}

function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

export interface Logger {
  debug(event: string, context?: Record<string, unknown>): void;
  info(event: string, context?: Record<string, unknown>): void;
  warn(event: string, context?: Record<string, unknown>): void;
  error(event: string, context?: Record<string, unknown>): void;
  /** Evento de segurança (login, acesso negado, etc.) */
  security(event: string, context?: Record<string, unknown>): void;
  /** Métrica de duração — loga info com durationMs */
  timing(event: string, durationMs: number, context?: Record<string, unknown>): void;
  child(defaultContext: Record<string, unknown>): Logger;
}

const SENSITIVE_KEYS = [
  "password", "passwordHash", "token", "secret",
  "authorization", "cookie", "apiKey", "api_key",
  "accessToken", "refreshToken",
];

function sanitize(context?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!context) return context;
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k))) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function createLogger(defaultContext?: Record<string, unknown>): Logger {
  const withDefaults = (context?: Record<string, unknown>) => ({
    ...defaultContext,
    ...context,
  });

  return {
    debug(event, context) {
      if (!shouldLog("debug")) return;
      const entry = createLogEntry("debug", event, sanitize(withDefaults(context)));
      console.debug(formatLogEntry(entry));
    },
    info(event, context) {
      if (!shouldLog("info")) return;
      const entry = createLogEntry("info", event, sanitize(withDefaults(context)));
      console.info(formatLogEntry(entry));
    },
    warn(event, context) {
      if (!shouldLog("warn")) return;
      const entry = createLogEntry("warn", event, sanitize(withDefaults(context)));
      console.warn(formatLogEntry(entry));
    },
    error(event, context) {
      if (!shouldLog("error")) return;
      const entry = createLogEntry("error", event, sanitize(withDefaults(context)));
      console.error(formatLogEntry(entry));
    },
    security(event, context) {
      if (!shouldLog("security")) return;
      const entry = createLogEntry("security", event, sanitize(withDefaults(context)));
      console.warn(formatLogEntry(entry));
    },
    timing(event, durationMs, context) {
      if (!shouldLog("info")) return;
      const entry = createLogEntry("info", event, sanitize(withDefaults(context)));
      entry.durationMs = durationMs;
      console.info(formatLogEntry(entry));
    },
    child(newContext) {
      return createLogger(withDefaults(newContext));
    },
  };
}

export const logger = createLogger();

/**
 * Cria um logger filho com contexto padrão.
 * Útil para logging consistente dentro de um request/serviço.
 *
 * @example
 * const log = getLogger({ tenantId, userId });
 * log.info("payment.processed", { amount: 100 });
 */
export function getLogger(context: Record<string, unknown>): Logger {
  return createLogger(context);
}
