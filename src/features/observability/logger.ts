export interface Logger {
  info(event: string, context?: Record<string, unknown>): void;
  warn(event: string, context?: Record<string, unknown>): void;
  error(event: string, context?: Record<string, unknown>): void;
}

export const logger: Logger = {
  info(event, context) {
    console.info(event, context ?? {});
  },
  warn(event, context) {
    console.warn(event, context ?? {});
  },
  error(event, context) {
    console.error(event, context ?? {});
  }
};
