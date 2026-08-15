export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

let currentLevel: LogLevel = 'info';

export function setLogLevel(level: LogLevel) {
  currentLevel = level;
}

export function log(level: LogLevel, message: string, context?: LogContext) {
  if (LOG_LEVEL_ORDER[level] < LOG_LEVEL_ORDER[currentLevel]) {
    return;
  }

  const timestamp = new Date().toISOString();
  const entry = {
    timestamp,
    level,
    message,
    ...context,
  };

  if (level === 'error') {
    console.error(
      `[${timestamp}] [${level.toUpperCase()}]`,
      message,
      context ?? '',
    );
  } else if (level === 'warn') {
    console.warn(
      `[${timestamp}] [${level.toUpperCase()}]`,
      message,
      context ?? '',
    );
  } else {
    console.log(
      `[${timestamp}] [${level.toUpperCase()}]`,
      message,
      context ?? '',
    );
  }

  if (
    typeof window !== 'undefined' &&
    (window as unknown as Record<string, unknown>).__APP_LOGGER__
  ) {
    const appLogger = (
      window as unknown as {
        __APP_LOGGER__?: (entry: Record<string, unknown>) => void;
      }
    ).__APP_LOGGER__;
    if (appLogger) {
      appLogger(entry);
    }
  }
}

export function debug(message: string, context?: LogContext) {
  log('debug', message, context);
}

export function info(message: string, context?: LogContext) {
  log('info', message, context);
}

export function warn(message: string, context?: LogContext) {
  log('warn', message, context);
}

export function error(message: string, context?: LogContext) {
  log('error', message, context);
}
