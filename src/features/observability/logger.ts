export type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

function getCurrentLevel(): number {
  return LOG_LEVELS[(process.env.LOG_LEVEL as LogLevel) ?? "info"] ?? LOG_LEVELS.info;
}

const currentLevel: number = getCurrentLevel();

let correlationIdCounter = 0;

function generateCorrelationId(): string {
  correlationIdCounter++;
  return `${Date.now().toString(36)}-${correlationIdCounter.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

interface LogEntry {
  level: LogLevel;
  event: string;
  context?: Record<string, unknown>;
  correlationId?: string;
  timestamp: string;
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= currentLevel;
}

function createLogEntry(level: LogLevel, event: string, context?: Record<string, unknown>): LogEntry {
  return {
    level,
    event,
    context,
    correlationId: generateCorrelationId(),
    timestamp: new Date().toISOString()
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
  child(defaultContext: Record<string, unknown>): Logger;
}

function createLogger(defaultContext?: Record<string, unknown>): Logger {
  const withDefaults = (context?: Record<string, unknown>) => ({
    ...defaultContext,
    ...context
  });

  return {
    debug(event, context) {
      if (!shouldLog("debug")) return;
      const entry = createLogEntry("debug", event, withDefaults(context));
      console.debug(formatLogEntry(entry));
    },
    info(event, context) {
      if (!shouldLog("info")) return;
      const entry = createLogEntry("info", event, withDefaults(context));
      console.info(formatLogEntry(entry));
    },
    warn(event, context) {
      if (!shouldLog("warn")) return;
      const entry = createLogEntry("warn", event, withDefaults(context));
      console.warn(formatLogEntry(entry));
    },
    error(event, context) {
      if (!shouldLog("error")) return;
      const entry = createLogEntry("error", event, withDefaults(context));
      console.error(formatLogEntry(entry));
    },
    child(defaultContext) {
      return createLogger(withDefaults(defaultContext));
    }
  };
}

export const logger = createLogger();

export function getLogger(context: Record<string, unknown>): Logger {
  return createLogger(context);
}
