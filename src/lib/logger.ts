/**
 * Structured logging utility
 * In production, errors are automatically sent to Sentry for monitoring
 */

import * as Sentry from "@sentry/nextjs";

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  route?: string;
  method?: string;
  userId?: string;
  ip?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

function formatLogEntry(entry: LogEntry): string {
  if (process.env.NODE_ENV === 'production') {
    // JSON format for production (easier to parse by log aggregators)
    return JSON.stringify(entry);
  }
  // Human-readable format for development
  const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
  const errorStr = entry.error ? ` Error: ${entry.error.message}` : '';
  return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${contextStr}${errorStr}`;
}

function log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  };

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    };
  }

  const formatted = formatLogEntry(entry);

  switch (level) {
    case 'debug':
      if (process.env.NODE_ENV !== 'production') {
        console.debug(formatted);
      }
      break;
    case 'info':
      console.log(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
      console.error(formatted);
      break;
  }
}

/**
 * Log debug information (only in development)
 */
export function logDebug(message: string, context?: LogContext) {
  log('debug', message, context);
}

/**
 * Log informational messages
 */
export function logInfo(message: string, context?: LogContext) {
  log('info', message, context);
}

/**
 * Log warning messages
 * In production, warnings are also sent to Sentry for visibility
 */
export function logWarning(message: string, context?: LogContext) {
  log('warn', message, context);

  // Send warnings to Sentry in production (as breadcrumbs, not errors)
  if (process.env.NODE_ENV === 'production') {
    Sentry.addBreadcrumb({
      category: 'warning',
      message,
      level: 'warning',
      data: context,
    });
  }
}

/**
 * Log error messages with optional error object
 * In production, errors are automatically sent to Sentry
 */
export function logError(
  message: string,
  error?: Error,
  context?: LogContext
) {
  log('error', message, context, error);

  // Send errors to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    if (error) {
      Sentry.captureException(error, {
        extra: {
          message,
          ...context,
        },
      });
    } else {
      // If no error object, capture as a message
      Sentry.captureMessage(message, {
        level: 'error',
        extra: context,
      });
    }
  }
}

/**
 * Log API request
 */
export function logRequest(
  request: Request,
  context?: Omit<LogContext, 'route' | 'method'>
) {
  const url = new URL(request.url);
  logInfo('API Request', {
    route: url.pathname,
    method: request.method,
    ...context,
  });
}

/**
 * Log API response
 */
export function logResponse(
  request: Request,
  status: number,
  durationMs: number,
  context?: LogContext
) {
  const url = new URL(request.url);
  const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
  log(level, `API Response ${status}`, {
    route: url.pathname,
    method: request.method,
    status,
    durationMs,
    ...context,
  });
}

/**
 * Create a request logger that tracks duration
 */
export function createRequestLogger(request: Request) {
  const startTime = Date.now();
  const url = new URL(request.url);

  return {
    logStart() {
      logInfo('Request started', {
        route: url.pathname,
        method: request.method,
      });
    },
    logEnd(status: number, context?: LogContext) {
      const durationMs = Date.now() - startTime;
      logResponse(request, status, durationMs, context);
    },
    logError(error: Error, context?: LogContext) {
      logError('Request failed', error, {
        route: url.pathname,
        method: request.method,
        ...context,
      });
    },
  };
}
